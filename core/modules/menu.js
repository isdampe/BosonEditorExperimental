var fs = require("fs");

var menu = this;
var current_menu_item = false;
var open_directory = {};

exports.init = function(gui,win,bs,boson,elements) {

	//Fetch directory listing.
	fs.readdir( boson.working_dir, function(err, files) {
		if ( err ) {
			bs.bsError(err);
		} else {

			//Sort tabs.
			files = menu.sortFiles( files, boson.working_dir );

			//Add tabs.
			menu.injectFilesToRoot( files, elements.projectRoot, boson.working_dir, bs );

		}

	} );

};

exports.sortFiles = function ( files, cwd ) {

	//Sort folder to top, file to bottom.
	var mainBuffer = [], folderBuffer = [], fileBuffer = [], key, fstat, uid;

	for ( key in files ) {

		uid = cwd + "/" + files[key];
		fstat = fs.statSync( uid );

		
		if ( fstat.isFile() ) {
			fileBuffer.push( files[key] );
		} else {
			folderBuffer.push( files[key] );
		}

	}

	for ( key in folderBuffer ) {
		mainBuffer.push( folderBuffer[key] );
	}
	for ( key in fileBuffer ) {
		mainBuffer.push( fileBuffer[key] );
	}

	return mainBuffer;

};

exports.injectFilesToRoot = function( files, projectRoot, cwd, bs ) {

	var key;

	for ( key in files ) {

		menu.createProjectItem( files[key], projectRoot, cwd, bs );

	}

};

exports.handleSecondClick = function( uri, list_item ) {

	var submenu, i, max, duri;

	submenu = list_item.querySelectorAll("ul.submenu");
	max = submenu.length;

	if ( max > 0 ) {
		for ( i=0; i<max; i++ ) {
			duri = null;
			duri = submenu[i].getAttribute("data-uri");
			delete open_directory[duri];
		}
		submenu[0].className = "submenu hide-sub-menu";
		setTimeout(function(){
			list_item.removeChild( submenu[0] );
		}, 100);
	}

};

exports.createProjectItem = function( file, projectRoot, cwd, bs ) {

	var list_item, list_span, uri, fstat;

	uri = cwd + "/" + file;

	list_item = window.document.createElement("li");
	list_item.setAttribute("data-uri", uri);

	list_span = window.document.createElement("span");
	list_span.innerHTML = file;

	list_item.appendChild(list_span);
	projectRoot.appendChild(list_item);

	//Onclick.
	list_item.onmousedown = function(e){
		e.preventDefault();
		e.stopPropagation();

		if ( open_directory.hasOwnProperty(uri) ) {
			menu.handleSecondClick( uri, list_item );
			return;
		}

		menu.handleClick( file, list_item, cwd, bs );

	};

	//Fix this.
	//We shouldn't be checking stats more than once.
	fs.stat( uri, function(err, file) {

		if ( err ) {
			bs.bsError(err);
			return;
		}

		if ( file.isFile() ) {
			list_item.setAttribute( "data-type", "file" );
		} else {
			list_item.setAttribute( "data-type", "folder" );
		}

	} );

};

exports.handleClick = function( file, list_item, cwd, bs ) {

	var uri;

	uri = cwd + "/" + file;

	if ( current_menu_item !== false && list_item !== current_menu_item ) {
		current_menu_item.className = "";
	}
	
	list_item.className = "current";
	current_menu_item = list_item;

	//File or directory?
	fs.stat( uri, function(err, data) {

		if ( err ) {
			bs.bsError(err);
			return;
		}

		if ( data.isFile() ) {
			bs.attemptOpenFiles( uri );
		} else if ( data.isDirectory() ) {
			//Expand.
			menu.expandDir( list_item, bs );
			open_directory[uri] = list_item;
		}

	});

};

exports.expandDir = function( list_item, bs ) {

	var uri, submenu;

	uri = list_item.getAttribute("data-uri");

	fs.readdir( uri, function(err, files) {

		if (err) {
			bs.bsError(err);
			return;
		}

		submenu = window.document.createElement("ul");
		submenu.className = "submenu";
		submenu.setAttribute("data-uri", uri);

		list_item.appendChild(submenu);

		menu.injectFilesToRoot( files, submenu, uri, bs );

	});

};