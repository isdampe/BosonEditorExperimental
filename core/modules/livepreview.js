exports.init = function(gui,win,bs) {

	bs.openLivePreviewWindow = function( url ) {

		var newWin = gui.Window.open( url, {
			"icon": "assets/boson/media/logo.png",
	    "toolbar": false,
	    "frame": true,
	    "width": 1280,
	    "height": 720,
	    "min_width": 400,
	    "min_height": 200
		} );

	};

};