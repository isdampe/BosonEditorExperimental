var nativemenu = this;
var primaryMenuBar;
var menus = {};
var bs, coreGl;

exports.init = function( core ) {

  bs = core.bs;
  coreGl = core;

  primaryMenuBar = new core.gui.Menu({ type: 'menubar' });

  /*
   * File menu
   */
  menus.fileMenu = new core.gui.MenuItem({
  	label: 'File',
  	submenu: new core.gui.Menu()
  });

  //New file
  menus.fileMenu.submenu.append(new core.gui.MenuItem({
  	label: 'New file',
    tooltip: "Ctrl + N",
  	click: function () {
      bs.createNewFile();
  	}
  }));

  //Open files
  menus.fileMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Open files',
  	click: function () {
      bs.openFileDialogue();
  	}
  }));

  //Spacer
  menus.fileMenu.submenu.append(new core.gui.MenuItem({ type: 'separator' }));

  //Save
  menus.fileMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Save',
  	click: function () {
      bs.saveCurrentBuffer();
  	}
  }));

  //Save as
  menus.fileMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Save as...',
  	click: function () {
      bs.saveFileAs();
  	}
  }));

  //Spacer
  menus.fileMenu.submenu.append(new core.gui.MenuItem({ type: 'separator' }));

  //Close file
  menus.fileMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Close file',
  	click: function () {
      bs.closeCurrentTab();
  	}
  }));

  //Close boson
  menus.fileMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Exit',
  	click: function () {
      bs.closeBoson();
  	}
  }));

  /*
   * Edit menu
   */
  menus.editMenu = new core.gui.MenuItem({
  	label: 'Edit',
  	submenu: new core.gui.Menu()
  });

  //Undo
  menus.editMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Undo',
  	click: function () {
      bs.cmUndo();
  	}
  }));

  //Redo
  menus.editMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Redo',
  	click: function () {
      bs.cmRedo();
  	}
  }));

  //Spacer
  menus.editMenu.submenu.append(new core.gui.MenuItem({ type: 'separator' }));

  //Find
  menus.editMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Find',
  	click: function () {
      bs.cmFind();
  	}
  }));

  //Replace
  menus.editMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Replace',
  	click: function () {
      bs.cmReplace();
  	}
  }));

  /*
   * View menu
   */
  menus.viewMenu = new core.gui.MenuItem({
    label: 'View',
    submenu: new core.gui.Menu()
  });

  //Single
  menus.viewMenu.submenu.append(new core.gui.MenuItem({
    label: 'Single: 1',
    click: function () {
      bs.switchPaneMode('single',1);
    }
  }));

  //Two columns
  menus.viewMenu.submenu.append(new core.gui.MenuItem({
    label: 'Columns: 2',
    click: function () {
      bs.switchPaneMode('two-column',2);
    }
  }));

  //Three columns
  menus.viewMenu.submenu.append(new core.gui.MenuItem({
    label: 'Columns: 3',
    click: function () {
      bs.switchPaneMode('three-column',3);
    }
  }));

  //Four columns
  menus.viewMenu.submenu.append(new core.gui.MenuItem({
    label: 'Columns: 4',
    click: function () {
      bs.switchPaneMode('four-column',4);
    }
  }));

  //Two rows
  menus.viewMenu.submenu.append(new core.gui.MenuItem({
    label: 'Rows: 2',
    click: function () {
      bs.switchPaneMode('two-row',2);
    }
  }));

  //Three rows
  menus.viewMenu.submenu.append(new core.gui.MenuItem({
    label: 'Rows: 3',
    click: function () {
      bs.switchPaneMode('three-row',3);
    }
  }));

  //Grid
  menus.viewMenu.submenu.append(new core.gui.MenuItem({
    label: 'Grid: 4',
    click: function () {
      bs.switchPaneMode('grid',4);
    }
  }));

  /*
   * Preferences menu
   */
  menus.prefMenu = new core.gui.MenuItem({
  	label: 'Preferences',
  	submenu: new core.gui.Menu()
  });

  //Configuration
  //To be added to next release.
  /*menus.prefMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Configuration',
  	click: function () {

  	}
  }));*/

  //Toggle UI themes.
  menus.prefMenu.submenu.append(new core.gui.MenuItem({
    label: 'Toggle UI theme',
    click: function () {
      bs.toggleUITheme();
    }
  }));

  //Themes
  menus.prefMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Themes',
  	click: function () {
      bs.themeWindow();
  	}
  }));

  //Plugins
  menus.prefMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Plugins',
  	click: function () {
      bs.pluginWindow();
  	}
  }));

  //Spacer
  menus.prefMenu.submenu.append(new core.gui.MenuItem({ type: 'separator' }));

  //Increase font size
  menus.prefMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Increase font size +',
  	click: function () {
      bs.increaseFontSize();
  	}
  }));

  //Decrease font size
  menus.prefMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Decrease font size +',
  	click: function () {
      bs.decreaseFontSize();
  	}
  }));

  //Spacer
  menus.prefMenu.submenu.append(new core.gui.MenuItem({ type: 'separator' }));

  //Toggle sidebar
  menus.prefMenu.submenu.append(new core.gui.MenuItem({
  	label: 'Toggle sidebar',
  	click: function () {
      bs.toggleSidebar();
  	}
  }));

  /*
   * Boson menu
   */
  menus.bosonMenu = new core.gui.MenuItem({
    label: 'Boson',
    submenu: new core.gui.Menu()
  });

  //About Boson
  menus.bosonMenu.submenu.append(new core.gui.MenuItem({
    label: 'About Boson',
    click: function () {
      bs.about();
    }
  }));

  //Debug (WMT)
  menus.bosonMenu.submenu.append(new core.gui.MenuItem({
    label: 'Debug (WMT)',
    click: function () {
      bs.debug();
    }
  }));

  //Append it all.
  primaryMenuBar.append( menus.fileMenu );
  primaryMenuBar.append( menus.editMenu );
  primaryMenuBar.append( menus.viewMenu );
  primaryMenuBar.append( menus.prefMenu );
  primaryMenuBar.append( menus.bosonMenu );
  core.win.menu = primaryMenuBar;

  //Hook functions into core.
  bs.createTabMenu = nativemenu.createTabMenu;
  bs.deleteTabMenu = nativemenu.deleteTabMenu;
  bs.insertMenuItem = nativemenu.insertMenuItem;
  bs.removeMenuItem = nativemenu.removeMenuItem;

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

exports.insertMenuItem = function (menu, opts) {

  var nMenu;

  nMenu = new coreGl.gui.MenuItem(opts);

  menus[menu].submenu.append(nMenu);

  return nMenu;

};

exports.removeMenuItem = function(name,menu) {

  menus[name].submenu.remove(menu);

};
