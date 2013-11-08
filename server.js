var app = require('express')(),
	fs = require("fs"),
	ares = require("ares").ares,
	uuid = require("node-uuid");

var port = 3000;

app.post('/compile', function(req, res) {
	console.log( req.body );
	console.log( req.params );

    var guid = uuid.v1(),
		filePath = __dirname + "/tmp/" + guid + ".cpp",
		emscrPath = __dirname + "/../emscripten/emcc";

	if( req.body != undefined ) {
		fs.writeFile( filePath, req.body.c, function(err) {
			if( err ) {
				res.json( 500, {"error": "Failed to write out cpp file: " + err} );
			} else {
				var outputPath = __dirname + "/tmp/" + guid + ".js",
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
		res.json( 500, {"error": "Request contains no source file: " + error} );
	}
	
});


app.listen( port );
console.log( "Listening on port " + port );