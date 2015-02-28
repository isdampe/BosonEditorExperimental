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
			case 87:
				bs.debug();
			break;
			case 82:
				bs.reinit();
			break;
			case 17:
				//Ctrl + Q, Quit.
			break;
		}

	};

};