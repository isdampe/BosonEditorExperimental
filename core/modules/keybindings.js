exports.init = function(gui,win,bs) {

	//Global hotkeys.
	window.onkeydown = function(e) {
		if ( e.which === 27 ) {
			//Escape.
			bs.handleCancelEvents();
		}
		if ( e.which === 9 && e.ctrlKey === true ) {
			if ( e.shiftKey === true ) {
				//Backwards.
				bs.tabScrollBack();
			} else {
				bs.tabScroll();
			}
		}
	};

	//Standard keys.
	window.onkeypress = function(e) {
		//console.log(e.which);
		switch( e.which ) {
			case 19:
				bs.saveCurrentBuffer();
			break;
			case 23:
				bs.closeCurrentTab();
			break;
			case 17:
				//Ctrl + Q, Quit.
				bs.closeBoson();
			break;
			case 15:
				//Ctrl + O, open files.
				bs.openFileDialogue();
			break;
			case 14:
				//Ctrl + N
				bs.createNewFile();
			break;
		}

	};

};