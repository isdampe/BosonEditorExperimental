exports.init = function( core ) {

	//Global hotkeys.
	window.onkeydown = function(e) {
		
		if ( e.which === 27 ) {
			//Escape.
			core.bs.handleCancelEvents();
		}
		if ( e.which === 9 && e.ctrlKey === true ) {
			if ( e.shiftKey === true ) {
				//Backwards.
				core.bs.tabScrollBack();
			} else {
				core.bs.tabScroll();
			}
		}
		if ( e.which === 187 && e.ctrlKey === true ) {
			//Increase font size.
			core.bs.increaseFontSize();
		}
		if ( e.which === 189 && e.ctrlKey === true ) {
			//Decrease font size.
			core.bs.decreaseFontSize();
		}
		if ( e.which === 220 && e.ctrlKey === true ) {
			core.bs.toggleSidebar();
		}
	};

	//Standard keys.
	window.onkeypress = function(e) {
		
		switch( e.which ) {
			case 19:
				core.bs.saveCurrentBuffer();
			break;
			case 23:
				core.bs.closeCurrentTab();
			break;
			case 17:
				//Ctrl + Q, Quit.
				core.bs.closeBoson();
			break;
			case 15:
				//Ctrl + O, open files.
				core.bs.openFileDialogue();
			break;
			case 14:
				//Ctrl + N
				core.bs.createNewFile();
			break;
		}

	};

};