exports.init = function(gui,win,bs) {

	window.onkeypress = function(e) {
		//console.log("W:" + e.which );
		switch( e.which ) {
			case 19:
				bs.saveCurrentBuffer();
			break;
			case 23:
				bs.closeCurrentTab();
			break;
		}

	};

};