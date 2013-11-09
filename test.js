var app = require("express")(),
	needle = require('needle');

var sourceCode = {
	c: "class Tester { public: Tester(){} };"
};

var url = "http://54.243.208.160:3000/compile";

console.log( url );
console.log( sourceCode );

needle.post( url, sourceCode, function(err, res, body) {

	require("fs").writeFileSync( __dirname + "/testoutput.js", body.js );
});