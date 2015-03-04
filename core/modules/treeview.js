var fs = require('fs');
var treeView = [];

exports.init = function(gui,win,boson,bs) {

	this.readTreeDir(boson.cwd, bs, function(buffer){
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