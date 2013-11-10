var express = require('express'),
    app = express(),
	fs = require("fs"),
	ares = require("ares").ares,
	uuid = require("node-uuid");

var port = 3000;

app.configure(function(){
  	app.use(express.bodyParser());
  	app.use(app.router);
});

app.listen( port );

app.post('/compile', function(req, res) {

	// We don't want the browser to cache the results 
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

	var options = req.body.c;

    var guid = options.guid || uuid.v1(),
		filePath = __dirname + "/tmp/" + guid + ".cpp",
		emscrPath = __dirname + "/../emscripten/emcc",
		outputExtension = options.extension || ".js",
		outputPath = __dirname + "/tmp/" + guid + outputExtension,
		command = emscrPath + " " + filePath + " -o " + outputPath;

	// Check whether we've already generated this file before. If we did, just 
	// respond with the pre-generated file. This should speed things up a lot.
	try {
		fs.statSync(outputPath).isFile();

		fs.readFile( outputPath, function(error, data) {
			if( error ) {
				// Do nothing here, allowing us to actually compile the source again
			} else {
				var responseData = {
					"js": data.toString(),
					"stdout": undefined,
					"stderr": undefined,
				};

				console.log( "Sending back pre-existing file" );
				return res.json( 200, responseData );
			}
		});
	} catch( err ) {
		console.log( err );
		// Do nothing here, allowing us to actually compile the source again
	}

	console.log( "Creating new file" );

	if( options != undefined ) {
		fs.writeFile( filePath, options.c, function(err) {
			if( err ) {
				res.json( 500, {"error": "Failed to write out cpp file: " + err} );
			} else {

				ares( command, false, function(error, stdout, stderr) {

					fs.readFile( outputPath, function(error, data) {
						if( error ) {
							res.json( 500, {"error": "Failed to compile source file: " + error} );
						} else {
							var responseData = {
								"js": data.toString(),
								"stdout": stdout,
								"stderr": stderr,
							};

							if( stdout ) {
								console.log( "stdout" );
								console.log( stdout );
							}

							if( stderr ) {
								console.log( "stderr" );
								console.log( stderr );
							}

							res.json( 200, responseData );
						}
					});
				});
			}
		});
	} else {
		res.json( 500, {"error": "Request contains no source file: "} );
	}
	
});


console.log( "Listening on port " + port );