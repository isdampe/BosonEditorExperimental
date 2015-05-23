var nativemenu = this;
var primaryMenuBar;
var fileMenu, editMenu, viewMenu, prefMenu, bosonMenu;
var bs, coreGl;

exports.init = function( core ) {

  bs = core.bs;
  coreGl = core;

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
      bs.switchPaneMode('single',1);
    }
  }));

  //Two columns
  viewMenu.submenu.append(new core.gui.MenuItem({
    label: 'Columns: 2',
    click: function () {
      bs.switchPaneMode('two-column',2);
    }
  }));

  //Three columns
  viewMenu.submenu.append(new core.gui.MenuItem({
    label: 'Columns: 3',
    click: function () {
      bs.switchPaneMode('three-column',3);
    }
  }));

  //Four columns
  viewMenu.submenu.append(new core.gui.MenuItem({
    label: 'Columns: 4',
    click: function () {
      bs.switchPaneMode('four-column',4);
    }
  }));

  //Two rows
  viewMenu.submenu.append(new core.gui.MenuItem({
    label: 'Rows: 2',
    click: function () {
      bs.switchPaneMode('two-row',2);
    }
  }));

  //Three rows
  viewMenu.submenu.append(new core.gui.MenuItem({
    label: 'Rows: 3',
    click: function () {
      bs.switchPaneMode('three-row',3);
    }
  }));

  //Grid
  viewMenu.submenu.append(new core.gui.MenuItem({
    label: 'Grid: 4',
    click: function () {
      bs.switchPaneMode('grid',4);
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

  //Plugins
  prefMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Plugins',
  	click: function () {
      bs.pluginWindow();
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

  //Hook functions into core.
  bs.createTabMenu = nativemenu.createTabMenu;
  bs.deleteTabMenu = nativemenu.deleteTabMenu;

};

exports.createTabMenu = function( element, i ) {

  var contextMenu;

  contextMenu = new coreGl.gui.Menu();

  //Close tab.
  contextMenu.append(new coreGl.gui.MenuItem({
    label: 'Close tab',
    click: function() {
      bs.closeTabById(i);
    }
  }));

  //Move to pane.
  contextMenu.append(new coreGl.gui.MenuItem({
    label: 'Move to pane...',
    click: function() {
      bs.selectNewPane(i);
    }
  }));

  contextMenu.append(new coreGl.gui.MenuItem({ type: 'separator' }));

  //New file.
  contextMenu.append(new coreGl.gui.MenuItem({
    label: 'New file',
    click: function() {
      bs.createNewFile();
    }
  }));

  //Open file.
  contextMenu.append(new coreGl.gui.MenuItem({
    label: 'Open files',
    click: function() {
      bs.openFileDialogue();
    }
  }));

  element.addEventListener('contextmenu', function(e){
    e.preventDefault();
    contextMenu.popup(e.x,e.y);
    return false;
  })

  return contextMenu;

};

exports.deleteTabMenu = function( contextMenu ) {

  contextMenu = null;
  delete contextMenu;

};
