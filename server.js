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
	console.log( req.body );
	console.log( req.params );

    var guid = uuid.v1(),
		filePath = "./tmp/" + guid + ".cpp",
		emscrPath = "../emscripten/emcc";

	if( req.body != undefined ) {
		console.log( "Converting ")
		fs.writeFile( filePath, req.body.c, function(err) {
			if( err ) {
				res.json( 500, {"error": "Failed to write out cpp file: " + err} );
			} else {
				var outputPath = "./tmp/" + guid + ".js",
					command = emscrPath + " " + filePath + " -o " + outputPath;

				ares( command, true, function() {
					fs.readFile( outputPath, function(error, data) {
						if( error ) {
							res.json( 500, {"error": "Failed to compile source file: " + error} );
						} else {
							res.json( 200, {"js": data} );
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