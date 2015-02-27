/*
 * Boson.js core
 * This handles all core app things.
*/

var gui = require('nw.gui');
var menu = require(process.cwd() + '/core/modules/menu.js');
var keybindings = require(process.cwd() + '/core/modules/keybindings.js');
var livepreview = require(process.cwd() + '/core/modules/livepreview.js');
var fs = require('fs');

(function(window,config){

  var boson = {
    current_editor: null,
    title: "Boson Editor",
    working_dir: process.env.PWD
  }, elements = {}, editor = [], tabs = [], dom, editorData = [], win;

  this.preloadDom = function() {
    elements.editorEntryPoint = document.getElementById("editor-entrypoint");
    elements.tabsEntryPoint = document.getElementById("tabs-entrypoint");
  };

  this.log = function(buffer) {

    console.log(buffer);

  };

  this.createTab = function(object, i) {

    var tab;

    tab = document.createElement("li");
    tab.id = "tab-" + object.guid;
    tab.innerHTML = object.name;
    tab.setAttribute("data-name", object.name);

    //Hook onclick.
    tab.onclick = function(e) {
      e.preventDefault();
      bs.switchToEditor(i);
    };

    elements.tabsEntryPoint.appendChild( tab );

    tabs[i] = tab;

  };

  this.activateTab = function(i) {
    if ( boson.current_editor !== null && boson.current_editor !== false ) {
      tabs[boson.current_editor].className = "";
    }
    tabs[i].className =  "active";
  }

  this.createEditor = function(object, i) {

    var textarea;

    //Create the textarea.
    textarea = document.createElement("textarea");
    textarea.id = "ta-" + object.guid;
    textarea.value = object.buffer;

    //Create a tab.
    this.createTab(object, i);

    //Inject into DOM.
    elements.editorEntryPoint.appendChild(textarea);

    //Create the editor.
    editor[i] = {
      cm: CodeMirror.fromTextArea(textarea, {
          lineNumbers: true,
          theme: config.theme
        }),
      ta: textarea,
      changed: false
    };

    //Hide the editor.
    editor[i].cm.getWrapperElement().style.display = "none";

    //Create on change hook for save notifications.
    editor[i].cm.on("change", function(cm) {
      if ( editor[i].changed === false ) {
         this.flagHasChanged(i, true);
      }
    });

  };

  this.closeEditor = function(i) {

    //Remove the CM element.
    editor[i].cm.toTextArea();

    //Remove the text area.
    editor[i].ta.parentElement.removeChild(editor[i].ta);

    //Remove the tab.
    tabs[i].parentElement.removeChild(tabs[i]);


    //Clear the editor object.
    editor[i] = {};
    editorData[i] = {};
    tabs[i] = null;

    boson.current_editor = false;

  };

  this.showEditor = function(i) {

    editor[i].cm.getWrapperElement().style.display = "block";
    editor[i].cm.focus();

  }

  this.hideEditor = function(i) {

    if ( i !== false ) {
      editor[i].cm.getWrapperElement().style.display = "none";
    }

  }

  this.switchToEditor = function(i) {
    if ( boson.current_editor !== i ) {
      if ( boson.current_editor !== null ) {
        this.hideEditor(boson.current_editor)
      }
      this.showEditor(i);
      this.activateTab(i);
      boson.current_editor = i;
      if ( editor[i].changed === true ) {
        this.setTitle( editorData[i].cwd + "/" + editorData[i].name + " *" );
      } else {
        this.setTitle( editorData[i].cwd + "/" + editorData[i].name );
      }
    }
  };

  this.closeCurrentTab = function() {

    if ( boson.current_editor === null || boson.current_editor === false ) {
      return;
    }

    if ( editor[boson.current_editor].changed === true ) {
      //Confirm save.
    } else {
      this.closeEditor(boson.current_editor);
    }

  };

  this.bsError = function(err) {
    console.log("BOSON ERROR: " + err);
  };

  this.flagHasChanged = function(i, status) {

    editor[i].changed = status;

    if ( status === true ) {
      //Set both tab title and window title.
      tabs[i].innerHTML = tabs[i].getAttribute("data-name") + "*";
      this.setTitle( editorData[i].cwd + "/" + editorData[i].name + " *" );
    } else {
      //Set both tab title and window title.
      tabs[i].innerHTML = tabs[i].getAttribute("data-name");
      this.setTitle( editorData[i].cwd + "/" + editorData[i].name );
    }

  };

  this.saveBuffer = function(i) {

    //Save the specified buffer changes to buffer.
    var fh, fileBuffer;

    //Sync Codemirror and editorData.
    editorData[i].buffer = editor[i].cm.getValue();

    fileBuffer = editorData[i];

    fs.writeFile( fileBuffer.cwd + "/" + fileBuffer.name, fileBuffer.buffer, function(err){
      if ( err ) {
        this.bsError(err);
      }
      this.log("Saved buffer  to " + fileBuffer.cwd + "/" + fileBuffer.name );

      //Remove the "changed" symbol and flag.
      this.flagHasChanged(i, false);

    });

  };

  this.saveCurrentBuffer = function() {

    this.saveBuffer(boson.current_editor);

  };

  this.setTitle = function(titleBuffer) {

    var proposedTitle;

    proposedTitle = titleBuffer + " - Boson Editor";

    if ( boson.title !== proposedTitle ) {
      //Set title.
      gui.Window.get().title = proposedTitle;
      boson.title = proposedTitle;
    }

  }

  this.debug = function() {
    win.showDevTools();
  };

  this.reinit = function() {
    win.reload();
  };

  this.init = function() {

    var startupTime, bootUpTime, totalBootTime, i, fileCount;

    //Log the startup time.
    startupTime = new Date().getTime();


    //Debug only.
    //This should read data file.
    editorData.push({
      name: "index.html",
      guid: "7812tg87gas87dgasd",
      cwd: "/home/dampe/public_html",
      buffer: "asd967asdg978asvdbasd"
    });
    editorData.push({
      name: "editor.html",
      guid: "abcdefghj",
      cwd: "/home/dampe/public_html",
      buffer: "asd967asdg97asdasdasdasdasdasdasd"
    });

    //Preload dom selection.
    this.preloadDom();

    fileCount = editorData.length;
    for ( i=0; i<fileCount; i++ ) {
      this.createEditor(editorData[i], i);
    }

    //Fetch window.
    win = gui.Window.get();

    //Build menus.
    menu.init(gui,win,this);
    keybindings.init(gui,win,this);
    livepreview.init(gui,win,this);

    //Show the window.
    win.show();

    bootUpTime = new Date().getTime();
    totalBootTime = bootUpTime - startupTime;

    if ( boson.current_editor === null ) {
      if ( fileCount >= 1 ) {
        this.switchToEditor(fileCount -1);
      }
    }

    this.log("Boot complete, " + totalBootTime + " ms");

  };

  window.bs = this;
  this.init();

})(window, {
  theme: "ambiance"
});