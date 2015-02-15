exports.init = function(gui,win,bs) {

	window.onkeypress = function(e) {

		switch( e.which ) {
			case 19:
				bs.saveCurrentBuffer();
			break;
		}

	};

};