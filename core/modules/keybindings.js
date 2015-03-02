exports.init = function(gui,win,bs) {

	//Global hotkeys.
	window.onkeydown = function(e) {
		if ( e.which === 27 ) {
			//Escape.
			bs.handleCancelEvents();
		}
	};

	//Standard keys.
	window.onkeypress = function(e) {
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
			case 15:
				//Ctrl + O, open files.
				bs.openFileDialogue();
			break;
		}

	};

};