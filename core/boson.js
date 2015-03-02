/*
 * Boson.js core
 * This handles all core app things.
*/

var gui = require('nw.gui');
var menu = require(process.cwd() + '/core/modules/menu.js');
var keybindings = require(process.cwd() + '/core/modules/keybindings.js');
var livepreview = require(process.cwd() + '/core/modules/livepreview.js');
var fs = require('fs');
var path = require('path');

(function(window,config){

  var boson = {
    current_editor: null,
    title: "Boson Editor",
    working_dir: process.env.PWD
  }, elements = {}, editor = [], tabs = [], dom, editorData = [], win, activeModes = {}, cancelEvents = {};

  this.preloadDom = function() {
    elements.editorEntryPoint = document.getElementById("editor-entrypoint");
    elements.tabsEntryPoint = document.getElementById("tabs-entrypoint");
    elements.bodyEntryPoint = document.getElementById("body-entrypoint");
    elements.selectFilesInput = document.getElementById("boson-select-files");
    elements.footerEntryPoint = document.getElementById("footer-entrypoint");

    //Hook on change selectFilesInput.
    elements.selectFilesInput.addEventListener("change", function(res){
      bs.attemptOpenFiles(this.value);
    }, false);
  };

  this.refreshCm = function() {

    var key;

    for ( key in editor ) {
      editor[key].cm.setOption("mode", editor[key].mode);
      if ( editor[key].cm.hasOwnProperty("refresh") ) {
        editor[key].cm.refresh();
      }
    }

  };

  this.refreshCmById = function(i) {

    editor[i].cm.setOption("mode", editor[i].mode);
    if ( editor[i].cm.hasOwnProperty("refresh") ) {
       editor[i].cm.refresh();
    }

  };

  this.unrefreshCm = function() {

    var key;

    for ( key in editor ) {
      editor[key].cm.setOption("mode", "text");
      if ( editor[key].cm.hasOwnProperty("refresh") ) {
        editor[key].cm.refresh();
      }
    }

  };

  this.log = function(buffer) {

    console.log(buffer);

  };

  this.handleCancelEvents = function() {

    var key;

    for ( key in cancelEvents ) {
      if ( cancelEvents[key].active === true ) {
        if ( typeof cancelEvents[key].callback === "function" ) {
          cancelEvents[key].callback();
        }
      }
    }

  };

  this.addCancelEvent = function( name, callback ) {

    cancelEvents[name] = {
      active: true,
      callback: callback
    };

  };

  this.suspendCancelEvent = function ( name ) {

    cancelEvents[name].active = false;

  };

  this.attemptOpenFiles = function( fp ) {

    var files;

    //Split the string, check if multiple files have been selected.
    files = fp.split(";");

    for ( key in files ) {
      bs.openFileFromPath( files[key] );
    }

  };

  this.injectModeScript = function( mode ) {

    var modeScript;

    modeScript = document.createElement("script");
    modeScript.src = "assets/codemirror/mode/" + mode + "/" + mode + ".js";

    elements.footerEntryPoint.appendChild(modeScript);
    activeModes[mode] = modeScript;
    
    modeScript.onload = function(){
      bs.refreshCm();
    };

  };

  this.injectCodeMirrorMode = function( mode ) {

    var modeScript = [], key;

    for ( key in mode ) {

      if ( activeModes.hasOwnProperty(mode[key]) ) {
        return;
      }

      bs.injectModeScript( mode[key] );

    }

  };

  this.fileExtensionToMode = function ( ext ) {

    var req = [];

    switch ( ext ) {
      case ".html":
        req.push("htmlmixed","xml","javascript","css");
      break;
      case ".htm":
        req.push("htmlmixed","xml","javascript","css");
      break;
      case ".php":
        req.push("php", "xml", "htmlmixed", "javascript", "css");
      break;
      case ".js":
        req.push("javascript");
      break;
      case ".sass":
        req.push("sass", "css");
      break;
      case ".scss":
        req.push("sass", "css");
      break;
      case ".css":
        req.push("css");
      break;
    }

    if ( req.length === 0 ) { 
      return false;
    } else {
      return req;
    }

  };

  this.openFileFromPath = function( fp ) {

    var key, cfp, currentFileId;

    if ( typeof fp === "undefined" || fp === "" ) {
      bs.bsError("Tried to open file with blank filepath.");
      return;
    }

    //Is the file currently open?
    for ( key in editorData ) {
      cfp = editorData[key].cwd + "/" + editorData[key].name;
      if ( cfp === fp ) {
        //File is already open.
        bs.log("File already open, switching to tab.");
        bs.switchToEditor( key );
        return;
      }
    }

    //Open the file.
    fs.exists(fp, function (exists) {
      if ( exists ) {

        //Open the file buffer.
        fs.readFile(fp, {
          encoding: "utf-8"
        }, function(err, data){

          if ( err ) {
            bs.bsError("There was an error opening " + fp);
            return;
          }

          currentFileId = editorData.length;

          //Open new tab.
          editorData.push({
            name: path.basename(fp),
            guid: fp,
            cwd: path.dirname(fp),
            buffer: data
          });

          this.createEditor(editorData[currentFileId], currentFileId, true);

        });

      } else {
        bs.bsError("Tried to open file that doesn't exist, " + fp);
        return;
      }
    });

  };

  this.openFileDialogue = function() {

    elements.selectFilesInput.click();

  };

  this.createTab = function(object, i) {

    var tab;

    tab = document.createElement("li");
    tab.id = "tab-" + object.guid;
    tab.innerHTML = object.name;
    tab.setAttribute("data-name", object.name);

    //Hook onclick.
    tab.onmousedown = function(e) {
      e.preventDefault();
      bs.switchToEditor(i);
      bs.refreshCmById(i);
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

  this.createEditor = function(object, i, activateOnComplete) {

    var textarea, cmMode;

    //Create the textarea.
    textarea = document.createElement("textarea");
    textarea.id = "ta-" + object.guid;
    textarea.value = object.buffer;

    //Create a tab.
    this.createTab(object, i);

    //Inject into DOM.
    elements.editorEntryPoint.appendChild(textarea);

    //Try to find file type mode for CM.
    cmMode = bs.fileExtensionToMode( path.extname( editorData[i].name ) );
    if ( cmMode === false ) {
      cmMode = [];
      cmMode[0] = "text";
    }

    //Create the editor.
    editor[i] = {
      cm: CodeMirror.fromTextArea(textarea, {
          lineNumbers: true,
          theme: config.theme,
          mode: cmMode[0]
      }),
      mode: cmMode[0],
      ta: textarea,
      changed: false
    };

    //Inject script.
    bs.injectCodeMirrorMode(cmMode);

    //Hide the editor.
    editor[i].cm.getWrapperElement().style.display = "none";

    //Create on change hook for save notifications.
    editor[i].cm.on("change", function(cm) {
      if ( editor[i].changed === false ) {
         this.flagHasChanged(i, true);
      }
    });

    if ( typeof activateOnComplete !== "undefined" ) {
      if ( activateOnComplete === true ) {
        bs.switchToEditor(i);
      }
    }

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
    bs.setTitle("Nothing open");

    //Find another editor to activate.
    bs.findAndActivateTab(i);

  };

  this.findAndActivateTab = function(i) {

    var newTab = false, max, x;

    max = editorData.length - 1;

    for ( x = max; x >= 0; x-- ) {
      if ( editorData[x].hasOwnProperty('name') ) {
        newTab = x;
        break;
      }
    }

    if ( newTab !== false ) {
      bs.switchToEditor(x);
    }

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

  this.createPopupDialogue = function(title, message, accept, decline, onSuccess, onFailure, i) {

    var popup, popup_cancel_button, popup_logo, popup_title, popup_description, popup_accept_button, popup_decline_button;

    popup = document.createElement("div");
    popup.className = "popup prompt";

    popup_cancel_button = document.createElement("div");
    popup_cancel_button.className = "cancel";

    popup_logo = document.createElement("div");
    popup_logo.className = "logo";

    popup_title = document.createElement("h4");
    popup_title.innerHTML = title;

    popup_description = document.createElement("div");
    popup_description.className = "dialogue";
    popup_description.innerHTML = message;

    popup_accept_button = document.createElement("button");
    popup_accept_button.className = "btn btn-accept";
    popup_accept_button.innerHTML = accept;

    popup_decline_button = document.createElement("button");
    popup_decline_button.className = "btn btn-decline";
    popup_decline_button.innerHTML = decline;

    popup_cancel_button.addEventListener("click", function(e){
      e.preventDefault();
      bs.removePopupDialogue(popup);
    });

    popup_accept_button.addEventListener("click", function(e){
      e.preventDefault();
      onSuccess(i);
      bs.removePopupDialogue(popup);
    });

    popup_decline_button.addEventListener("click", function(e){
      e.preventDefault();
      onFailure(i);
      bs.removePopupDialogue(popup);
    });

    popup.appendChild(popup_cancel_button);
    popup.appendChild(popup_logo);
    popup.appendChild(popup_title);
    popup.appendChild(popup_description);
    popup.appendChild(popup_decline_button);
    popup.appendChild(popup_accept_button);

    elements.bodyEntryPoint.appendChild(popup);

    return popup;

  };

  this.removePopupDialogue = function(popup) {

    popup.className = "popup prompt popOut";
    setTimeout(function(){
      popup.parentElement.removeChild(popup);
    }, 150);

  };

  this.warnSave = function(i, onSuccess, onFailure) {

    var dialogueMessage;

    dialogueMessage = "Do you want to save " + editorData[i].name + " before closing it?";

    return this.createPopupDialogue("Save before closing?", dialogueMessage, "Save", "Don't save", onSuccess, onFailure, i);

  };

  this.closeCurrentTab = function() {

    var popup;

    if ( boson.current_editor === null || boson.current_editor === false ) {
      return;
    }

    if ( editor[boson.current_editor].changed === true ) {

      //Confirm save.
      popup = this.warnSave(boson.current_editor, function(i){

        //On save.
        bs.saveCurrentBuffer(function(){
          bs.closeEditor(boson.current_editor);
        });

      }, function(i){

        //On not save.
        bs.closeEditor(boson.current_editor);

      });

      bs.addCancelEvent( "confirm-save", function(){
        bs.removePopupDialogue( popup );
        bs.suspendCancelEvent( "confirm-save" );
      });

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

  this.saveBuffer = function(i, callback) {

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

      if ( typeof callback === "function" ) {
        callback();
      }

    });

  };

  this.saveCurrentBuffer = function(callback) {

    
    if ( typeof callback === "function" ) {
      this.saveBuffer(boson.current_editor, callback);
    } else {
      this.saveBuffer(boson.current_editor);
    }

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
      name: "editor.js",
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
  theme: "tomorrow-night-eighties"
});