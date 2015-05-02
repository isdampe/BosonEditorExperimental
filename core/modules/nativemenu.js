var nativemenu = this;
var primaryMenuBar;
var fileMenu, editMenu, viewMenu, prefMenu, bosonMenu;
var bs;

exports.init = function( core ) {

  bs = core.bs;
  primaryMenuBar = new core.gui.Menu({ type: 'menubar' });

  /*
   * File menu
   */
  fileMenu = new core.gui.MenuItem({
  	label: 'File',
  	submenu: new core.gui.Menu()
  });

  //New file
  fileMenu.submenu.append(new core.gui.MenuItem({
  	label: 'New file',
    tooltip: "Ctrl + N",
  	click: function () {
      bs.createNewFile();
  	}
  }));

  //Open files
  fileMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Open files',
  	click: function () {
      bs.openFileDialogue();
  	}
  }));

  //Spacer
  fileMenu.submenu.append(new core.gui.MenuItem({ type: 'separator' }));

  //Save
  fileMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Save',
  	click: function () {
      bs.saveCurrentBuffer();
  	}
  }));

  //Save as
  fileMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Save as...',
  	click: function () {
      bs.saveFileAs();
  	}
  }));

  //Spacer
  fileMenu.submenu.append(new core.gui.MenuItem({ type: 'separator' }));

  //Close file
  fileMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Close file',
  	click: function () {
      bs.closeCurrentTab();
  	}
  }));

  //Close boson
  fileMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Exit',
  	click: function () {
      bs.closeBoson();
  	}
  }));

  /*
   * Edit menu
   */
  editMenu = new core.gui.MenuItem({
  	label: 'Edit',
  	submenu: new core.gui.Menu()
  });

  //Undo
  editMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Undo',
  	click: function () {
      bs.cmUndo();
  	}
  }));

  //Redo
  editMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Redo',
  	click: function () {
      bs.cmRedo();
  	}
  }));

  //Spacer
  editMenu.submenu.append(new core.gui.MenuItem({ type: 'separator' }));

  //Find
  editMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Find',
  	click: function () {
      bs.cmFind();
  	}
  }));

  //Replace
  editMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Replace',
  	click: function () {
      bs.cmReplace();
  	}
  }));

  /*
   * View menu
   */
  viewMenu = new core.gui.MenuItem({
    label: 'View',
    submenu: new core.gui.Menu()
  });

  //Single
  viewMenu.submenu.append(new core.gui.MenuItem({
    label: 'Single: 1',
    click: function () {
      bs.switchPaneMode('single');
    }
  }));

  //Two columns
  viewMenu.submenu.append(new core.gui.MenuItem({
    label: 'Columns: 2',
    click: function () {
      bs.switchPaneMode('two-column');
    }
  }));

  //Three columns
  viewMenu.submenu.append(new core.gui.MenuItem({
    label: 'Columns: 3',
    click: function () {
      bs.switchPaneMode('three-column');
    }
  }));

  //Four columns
  viewMenu.submenu.append(new core.gui.MenuItem({
    label: 'Columns: 4',
    click: function () {
      bs.switchPaneMode('four-column');
    }
  }));

  //Two rows
  viewMenu.submenu.append(new core.gui.MenuItem({
    label: 'Rows: 2',
    click: function () {
      bs.switchPaneMode('two-row');
    }
  }));

  //Three rows
  viewMenu.submenu.append(new core.gui.MenuItem({
    label: 'Rows: 3',
    click: function () {
      bs.switchPaneMode('three-row');
    }
  }));

  //Grid
  viewMenu.submenu.append(new core.gui.MenuItem({
    label: 'Grid: 4',
    click: function () {
      bs.switchPaneMode('grid');
    }
  }));

  /*
   * Preferences menu
   */
  prefMenu = new core.gui.MenuItem({
  	label: 'Preferences',
  	submenu: new core.gui.Menu()
  });

  //Configuration
  prefMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Configuration',
  	click: function () {

  	}
  }));

  //Themes
  prefMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Themes',
  	click: function () {

  	}
  }));

  //Spacer
  prefMenu.submenu.append(new core.gui.MenuItem({ type: 'separator' }));

  //Increase font size
  prefMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Increase font size +',
  	click: function () {
      bs.increaseFontSize();
  	}
  }));

  //Decrease font size
  prefMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Decrease font size +',
  	click: function () {
      bs.decreaseFontSize();
  	}
  }));

  //Spacer
  prefMenu.submenu.append(new core.gui.MenuItem({ type: 'separator' }));

  //Toggle sidebar
  prefMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Toggle sidebar',
  	click: function () {
      bs.toggleSidebar();
  	}
  }));

  /*
   * Boson menu
   */
  bosonMenu = new core.gui.MenuItem({
    label: 'Boson',
    submenu: new core.gui.Menu()
  });

  //About Boson
  bosonMenu.submenu.append(new core.gui.MenuItem({
    label: 'About Boson',
    click: function () {
      bs.about();
    }
  }));

  //Debug (WMT)
  bosonMenu.submenu.append(new core.gui.MenuItem({
    label: 'Debug (WMT)',
    click: function () {
      bs.debug();
    }
  }));

  //Append it all.
  primaryMenuBar.append( fileMenu );
  primaryMenuBar.append( editMenu );
  primaryMenuBar.append( viewMenu );
  primaryMenuBar.append( prefMenu );
  primaryMenuBar.append( bosonMenu );
  core.win.menu = primaryMenuBar;

};
