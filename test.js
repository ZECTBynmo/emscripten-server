var app = require("express")(),
	needle = require('needle');

var sourceCode = {
	c: "class Tester { public: Tester(){} };"
};

var url = "http://50.17.82.56:3000/compile";

console.log( url );
console.log( sourceCode );

needle.post( url, sourceCode, function(err, res, body) {

	require("fs").writeFileSync( __dirname + "/test.js", body.js );
});