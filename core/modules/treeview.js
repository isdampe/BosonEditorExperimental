var fs = require('fs');
var treeView = [];

exports.init = function( core ) {

	this.readTreeDir( core.boson.cwd, core.bs, function( buffer ){
		//Callback.
		console.log("SUCCESS " + buffer);
	});

};

exports.readTreeDir = function( cwd, bs, callback ) {

	var dirBuffer;

	fs.readdir( cwd, function(err, files){
		if ( err ) {
			bs.log("ERR: " + err);
		}
		callback(files);
	});

};