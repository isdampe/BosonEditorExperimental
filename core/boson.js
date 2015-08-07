/*
 * Boson.js core
 * This handles all core app things.
 */
var gui = require('nw.gui');
var fs = require('fs');
var path = require('path');
var args = window.gui.App.argv;
var child = require('child_process');

var modules = {};
var plugins = {};

(function(window, config) {

  var elements = {},
    editor = [],
    tabs = [],
    dom, editorData = [],
    win, cancelEvents = {},
    cm = {
      themes: []
    };

  var boson = {
    current_editor: null,
    title: "Boson Editor",
    working_dir: process.env.PWD,
    maxFileSize: 5242880,
    version: "0.1.0",
    sidebarActive: true,
    currentViewport: 1,
    currentSubView: [],
    currentPaneMode: "single",
    app_dir: path.resolve(path.dirname()),
    cmTheme: false,
    ui_theme_element: false,
    platform: process.platform
  };

  var viewports = [];
  for ( i =1; i<5; i++ ) {
    viewports[i] = {
      wrapper: document.getElementById("viewport-" + i),
      editorElement: document.querySelector("#viewport-" + i + " .editor"),
      tabElement: document.getElementById("viewport-" + i + "-tabs")
    };
  }

  var hooks = [];

  boson.currentSubView[1] = null;
  boson.currentSubView[2] = null;
  boson.currentSubView[3] = null;
  boson.currentSubView[4] = null;

  /*
   * Preloads commonly used UI elements into cache, and hooks file inputs required by Nw.js
   */
  this.preloadDom = function() {

    elements.body = document.body;
    elements.editorEntryPoint = document.getElementById("editor-entrypoint");
    elements.editorWrapper = document.getElementById("editor-wrapper");
    elements.tabsEntryPoint = document.getElementById("tabs-entrypoint");
    elements.bodyEntryPoint = document.getElementById("body-entrypoint");
    elements.selectFilesInput = document.getElementById("boson-select-files");
    elements.selectDirectoryInput = document.getElementById("boson-select-directory");
    elements.footerEntryPoint = document.getElementById("footer-entrypoint");
    elements.projectRoot = document.getElementById("project-root-list");
    elements.saveFilesInput = document.getElementById("boson-save-file");
    elements.sidebar = document.getElementById("sidebar-entrypoint");

    //Hook on change selectFilesInput.
    elements.selectFilesInput.addEventListener("change", function(res) {
      bs.attemptOpenFiles(this.value);
    }, false);
    elements.selectDirectoryInput.addEventListener("change", function(res){
      bs.changeWorkingDirectory(this.value);
    }, false);

    //Hook on viewport focus.
    viewports[1].wrapper.addEventListener("click", function(e){
      bs.activateViewport(1);
    });
    viewports[2].wrapper.addEventListener("click", function(e){
      bs.activateViewport(2);
    });
    viewports[3].wrapper.addEventListener("click", function(e){
      bs.activateViewport(3);
    });
    viewports[4].wrapper.addEventListener("click", function(e){
      bs.activateViewport(4);
    });

  };

  /*
   * Loads the config from saved file.
   */
  this.loadConfig = function() {

    var configJson, configObject, key, fileFound = true;

    try {
      configJson = fs.readFileSync("config.json", {
        encoding: "utf-8"
      });
    } catch (err) {
      bs.bsError("No config.json file found");
      fileFound = false;
    }

    if ( fileFound === true ) {
      try {
        configObject = JSON.parse(configJson);
      } catch (err) {
        bs.bsError("Invalid config.json file.");
      }

      for ( key in configObject ) {
        config[key] = configObject[key];
      }
    }

  };

  /*
   * Loads CodeMirror themes into buffer.
   */
  this.loadCmThemes = function() {

    var dir = boson.app_dir + "/assets/codemirror/theme", i = 0, max, name;

    fs.readdir(dir, function(err,files){
      if (err) {
        bs.bsError(err);
        return;
      }

      max = files.length;
      for ( i=0; i<max; i = i +1 ) {
        name = files[i].replace("-", " ").replace(".css","");
        name = name.charAt(0).toUpperCase() + name.slice(1);
        cm.themes.push({
          uri: files[i],
          name: name
        });
      }

    });

  };

  /*
   * Injects the current Boson theme CSS.
   */
  this.injectTheme = function() {

    var theme, link;

    theme = "assets/boson/css/themes/" + config.bosontheme + ".css";
    link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", theme);
    boson.ui_theme_element = link;

    document.head.appendChild(boson.ui_theme_element);

  };

  this.injectCmTheme = function( uri ) {

    var i, max;

    if ( boson.cmTheme === false ) {
      //Create the element and inject it.
      boson.cmTheme = document.createElement("link");
      document.head.appendChild(boson.cmTheme);
    } else {
      document.head.removeChild(boson.cmTheme);
      boson.cmTheme = document.createElement("link");
      document.head.appendChild(boson.cmTheme);
    }

    boson.cmTheme.setAttribute("rel", "stylesheet");
    boson.cmTheme.setAttribute("href", "assets/codemirror/theme/" + uri);

    max = editor.length;
    i = 0;
    for ( i; i<max; i++ ) {
      if ( editor[i].hasOwnProperty("cm") ) {
        editor[i].cm.setOption("theme", uri.replace(".css","") );
      }
    }

  };

  /*
   * Toggles the sidebar on and off.
   */
  this.toggleSidebar = function() {

    if (! bs.procHooks("toggle-sidebar") ) {
      return;
    }

    if (boson.sidebarActive === true) {
      elements.sidebar.className = "sidebar-deactivated";
      elements.editorWrapper.className = "editor-fullscreen";
      boson.sidebarActive = false;
    } else {
      elements.sidebar.className = "";
      elements.editorWrapper.className = "";
      boson.sidebarActive = true;
    }

  };

  /*
   * Updates a boson config property.
   * Also writes the changes to disk to remember a preference.
   */
  this.updateConfig = function(property, value) {

    var configBuffer;

    if (! bs.procHooks("update-config", {
      property: property,
      value: value
    }) ) {
      return;
    }

    config[property] = value;

    bs.fsWriteConfigAsync();

  };

  this.fsWriteConfigAsync = function() {

    var configBuffer;

    configBuffer = JSON.stringify(config, null, 2);

    fs.writeFile("config.json", configBuffer);

  };

  /*
   * Sets the Codemirror font size via CSS
   * It's done like this to ensure each editor instance is uniform.
   */
  this.setFontSize = function(size) {

    if (! bs.procHooks("set-font-size", {
      size: size
    }) ) {
      return;
    }

    elements.editorEntryPoint.style.fontSize = size + "px";
    bs.updateConfig("fontSize", size);

  };

  /*
   * Increases the font size from the current.
   */
  this.increaseFontSize = function() {

    var size;

    if (! bs.procHooks("increase-font-size") ) {
      return;
    }

    size = config.fontSize + 1;

    bs.setFontSize(size);
    bs.updateConfig("fontSize", size);

  };

  /*
   * Decreases the font size from the current.
   */
  this.decreaseFontSize = function() {

    var size;

    if (! bs.procHooks("decrease-font-size") ) {
      return;
    }

    size = config.fontSize - 1;

    bs.setFontSize(size);
    bs.updateConfig("fontSize", size);

  };

  /*
   * Let's the user fine tune settings.
   */
  this.configuration = function() {

    bs.openFileFromPath("config.json");

  }

  /*
   * Internal logging function.
   * Should probably write to a global buffer which would be visible via a virtual "console".
   */
  this.log = function(buffer) {

    if (! bs.procHooks("bs-log", {
      buffer: buffer
    } ) ) {
      return;
    }

    console.log(buffer);

  };

  /*
   * Registers a hook by hook_name
   * Handles a later callback from a hooked point.
   */
  this.addHook = function(hook_name,callback,guid) {

    var newHook = {};

    if ( typeof guid === "undefined" ) {
      guid = bs.createUniqueGuid(hook_name);
    }

    if (! hooks.hasOwnProperty(hook_name) ) {
      hooks[hook_name] = [];
    }

    newHook = {
      guid: guid,
      func: callback
    };

    hooks[hook_name].push(newHook);

  };

  /*
   * Executes a hook / hooks by hook_name.
   */
  this.procHooks = function(hook_name,args){

    var i, max, executed = [], result;

    if ( typeof args === "undefined" ) {
      args = {};
    }

    if ( hooks.hasOwnProperty(hook_name) ) {

      max = hooks[hook_name].length;
      for ( i=0; i<max; i++ ) {
        executed.push(hooks[hook_name][i].func(args));
      }

    }

    max = executed.length - 1;
    if ( typeof executed[max] === "undefined" ) {
      result = true;
    } else {
      result = executed[max];
    }

    return result;

  };

  /*
   * Remove a hook by hook_name and hook_guid.
   */
  this.removeHook = function(hook_name,guid) {

    var i, max;

    if ( typeof hook_name === "undefined" || typeof guid === "undefined" ) {
      return;
    }

    if ( hooks.hasOwnProperty(hook_name) ) {
      max = hooks[hook_name].length;
      for ( i=0; i<max; i++ ) {
        if ( hooks[hook_name][i].guid === guid ) {
          hooks[hook_name].splice(i,1);
          return;
        }
      }
    }

  }

  /*
   * This function is hooked using addCancelEvent.
   * If a cancel event is registered, and the user presses ESC (or the mapped cancel key)
   * all active cancel events will be executed.
   * Used for things like warning dialogues.
   */
  this.handleCancelEvents = function() {

    var key;

    for (key in cancelEvents) {
      if (cancelEvents[key].active === true) {
        if (typeof cancelEvents[key].callback === "function") {
          cancelEvents[key].callback();
        }
      }
    }

  };

  /*
   * Hooks a cancel event into the buffer for later callback.
   */
  this.addCancelEvent = function(name, callback) {

    cancelEvents[name] = {
      active: true,
      callback: callback
    };

  };

  /*
   * Suspends a cancel event to prevent it executing on cancel callback.
   */
  this.suspendCancelEvent = function(name) {

    if (cancelEvents.hasOwnProperty(name)) {
      cancelEvents[name].active = false;
    }

  };

  /*
   * Attempts to open multiple files
   * Called from the Nw.js file open dialogue callback.
   */
  this.attemptOpenFiles = function(fp) {

    if (! bs.procHooks("attempt-open-files", {
      fp: fp
    } ) ) {
      return;
    }

    var files;

    //Split the string, check if multiple files have been selected.
    files = fp.split(";");

    for (key in files) {
      bs.openFileFromPath(files[key]);
    }

  };

  /*
   * Opens a file from a filepath.
   */
  this.openFileFromPath = function(fp) {

    if (! bs.procHooks("open-file-from-path", {
      fp: fp
    } ) ) {
      return;
    }

    var key, cfp, currentFileId, dialogueMessage, saveFunc;

    if (typeof fp === "undefined" || fp === "") {
      bs.bsError("Tried to open file with blank filepath.");
      return;
    }

    //Is the file currently open?
    for (key in editorData) {
      cfp = editorData[key].cwd + "/" + editorData[key].name;
      if (cfp === fp) {
        //File is already open.
        bs.log("File already open, switching to tab.");
        bs.switchToEditor(key);
        return;
      }
    }

    //Open the file.
    fs.exists(fp, function(exists) {
      if (exists) {

        //Is the file too big?
        fs.stat(fp, function(err, data) {

          if (err) {
            bs.bsError(err);
            return;
          }

          var openFunc = function() {

            //Open the file buffer.
            fs.readFile(fp, {
              encoding: "utf-8"
            }, function(err, data) {

              if (err) {
                bs.bsError("There was an error opening " + fp);
                return;
              }

              currentFileId = editorData.length;

              //Open new tab.
              editorData.push({
                name: path.basename(fp),
                guid: bs.bs.createUniqueGuid(fp),
                cwd: path.dirname(fp),
                buffer: data
              });

              this.createEditor(editorData[currentFileId], currentFileId, true);

            });

          };

          if (data.size > boson.maxFileSize) {

            var popup = this.createPopupDialogue("Open big file?", "The file you are trying to open is pretty big.", "Open it", "Don't open it", function() {
              openFunc();
              bs.suspendCancelEvent("Open big file?");
            }, function() {
              //On cancel.
              bs.suspendCancelEvent("Open big file?");
            }, null);

            bs.addCancelEvent("Open big file?", function() {
              bs.removePopupDialogue(popup);
              bs.suspendCancelEvent("Open big file?");
            });

          } else {
            openFunc();
          }


        });



      } else {
        bs.bsError("Tried to open file that doesn't exist, " + fp);
        return;
      }
    });

  };

  /*
   * Nw.js requires HTML level file inputs to trigger native file select dialogues.
   * Focuses on the file select element to trigger this.
   */
  this.openFileDialogue = function() {

    if (! bs.procHooks("open-file-dialogue") ) {
      return;
    }

    elements.selectFilesInput.click();

  };

  /*
   * Open folder dialogue
   */
  this.triggerChangeWorkingDirectory = function() {

    if (! bs.procHooks("change-working-directory") ) {
      return;
    }

    elements.selectDirectoryInput.click();

  };

  /*
   * Changes the current working directory.
   */
  this.changeWorkingDirectory = function(directory) {

    if ( directory === "" ) {
      bs.bsError("No directory to change to");
      return;
    }

    boson.working_dir = directory;
    modules["treeview"].reset();
    bs.moduleReInitByName("treeview");

  };

  /*
   * Refresh the current directory
   */
  this.refreshWorkingDirectory = function() {
    modules["treeview"].reset();
    bs.moduleReInitByName("treeview");
  };

  /*
   * Opens a new tab, and creates a Codemirror instance.
   * Triggered by File -> File file, or Ctrl+N
   */
  this.createNewFile = function() {

    if (! bs.procHooks("create-new-file") ) {
      return;
    }

    var i;

    editorData.push({
      name: "New document",
      guid: bs.createUniqueGuid("new-document"),
      cwd: boson.working_dir,
      buffer: ""
    });

    i = editorData.length - 1;

    bs.createEditor({
      guid: bs.createUniqueGuid("new-document"),
      buffer: "",
      name: "New document"
    }, i, true);

  };

  /*
   * Hooks drag and drop for tabs.
   */
  this.registerDragDrop = function() {

    /*nativesortable(elements.tabsEntryPoint, {
      change: function() {

      },
      childClass: "sortable-child",
      draggingClass: "sortable-dragging",
      overClass: "sortable-over"
    });*/

  };

  /*
   * Creates a tab, and hooks everything necessary for complete use.
   */
  this.createTab = function(object, i) {

    if (! bs.procHooks("create-tab", {
      object: object,
      i: i
    } ) ) {
      return;
    }

    var tab, title, close, contextMenu;

    tab = document.createElement("li");
    tab.id = "tab-" + object.guid;
    tab.setAttribute("draggable", "true");

    title = document.createElement("span");
    title.innerHTML = object.name;

    close = document.createElement("span");
    close.className = "close";

    tab.appendChild(title);
    tab.appendChild(close);
    tab.setAttribute("data-name", object.name);

    //Hook onclick.
    tab.onclick = function(e) {
      e.preventDefault();
      bs.switchToEditor(i);
    };

    close.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      bs.closeTabById(i);
    };

    //Hook native menu.
    if ( typeof bs.createTabMenu === "function" ) {
      contextMenu = bs.createTabMenu(tab,i);
    } else {
      contextMenu = null;
    }

    viewports[boson.currentViewport].tabElement.appendChild(tab);

    tabs[i] = {
      tab: tab,
      menu: contextMenu,
      title: title
    };

  };

  /*
   * Activates a tab if it's not currently active.
   */
  this.activateTab = function(i) {

    if (! bs.procHooks("activate-tab", {
      i: i
    } ) ) {
      return;
    }

    if (boson.current_editor !== null && boson.current_editor !== false) {
      tabs[boson.current_editor].tab.className = "";
    }

    tabs[i].tab.className = "active";

  }

  /*
   * Switches the pane mode as specified.
   */
  this.switchPaneMode = function( mode, colNumber ) {

    if (! bs.procHooks("switch-pane-mode", {
      mode: mode,
      colNumber: colNumber
    } ) ) {
      return;
    }

    elements.editorEntryPoint.className = mode;
    boson.currentPaneMode = mode;
    bs.rerouteOverflowingPanes( mode, colNumber );
    bs.updateConfig("paneMode", mode);

  };

  /*
   * Moves editors out of inactive viewports, into the closest active viewport.
   */
  this.rerouteOverflowingPanes = function( mode, colNumber ) {

    if (! bs.procHooks("reroute-overflowing-panes", {
      mode: mode,
      colNumber: colNumber
    } ) ) {
      return;
    }

    var i, max, currentViewport, futureViewport;

    max = editor.length;

    for ( i = 0; i<max; i++ ) {
      currentViewport = editor[i].currentViewport;
      if ( currentViewport > colNumber ) {

        futureViewport = colNumber;

        bs.moveEditorToViewport(i,futureViewport)

      }
    }

  };

  /*
   * Moves a specified editor to a new viewport via DOM.
   */
  this.moveEditorToViewport = function( i, futureViewport ) {

    if (! bs.procHooks("move-editor-to-viewport", {
      i: i,
      futureViewport: futureViewport
    } ) ) {
      return;
    }

    //Append to new viewport.
    viewports[futureViewport].editorElement.appendChild( editor[i].ta );
    viewports[futureViewport].editorElement.appendChild( editor[i].cm.getWrapperElement() );

    //Move tabs to new viewport.
    viewports[futureViewport].tabElement.appendChild( tabs[i].tab );

    //Update editor.
    editor[i].currentViewport = futureViewport;

  };

  /*
   * Activates specified viewport for focus.
   */
  this.activateViewport = function( viewport ) {

    if (! bs.procHooks("activate-viewport", {
      viewport: viewport
    } ) ) {
      return;
    }

    boson.currentViewport = viewport;

  };

  /*
   * Injects a textarea editor into the active
   * viewport / pane.
   */
  this.injectEditorToActivePane = function( element ) {

    if (! bs.procHooks("inject-editor-to-active-pane", {
      element: element
    } ) ) {
      return;
    }

    viewports[boson.currentViewport].editorElement.appendChild(element);

  };

  /*
   * Get an editor by ID.
   */
  this.getEditorById = function(i) {

    if ( editor.hasOwnProperty(i) ) {
      return editor[i];
    } else {
      return false;
    }

  };

  /*
   * Gets editor data by ID.
   */
  this.getEditorDataById = function(i) {

    if ( editorData.hasOwnProperty(i) ) {
      return editorData[i];
    } else {
      return false;
    }

  };

  /*
   * Creates a new editor / Codemirror instance.
   * Also hooks required Codemirror sections.
   */
  this.createEditor = function(object, i, activateOnComplete) {

    if (! bs.procHooks("create-editor", {
      object: object,
      i: i,
      activateOnComplete: activateOnComplete
    } ) ) {
      return;
    }

    var textarea, cmMode, m, mode, spec;

    //Create the textarea.
    textarea = document.createElement("textarea");
    textarea.id = "ta-" + object.guid;
    textarea.value = object.buffer;

    //Create a tab.
    this.createTab(object, i);

    //Inject into DOM.
    bs.injectEditorToActivePane(textarea);

    //Try to find file type mode for CM.
    if (m = /.+\.([^.]+)$/.exec(editorData[i].name)) {
      var info = CodeMirror.findModeByExtension(m[1]);
      if (info) {
        mode = info.mode;
        spec = info.mime;
      }
    } else if (/\//.test(editorData[i].name)) {
      var info = CodeMirror.findModeByMIME(val);
      if (info) {
        mode = info.mode;
        spec = editorData[i].name;
      }
    } else {
      mode = spec = editorData[i].name;
    }

    if (!mode) {
      mode = "text";
    }

    //Create the editor.
    editor[i] = {
      cm: CodeMirror.fromTextArea(textarea, {
        lineNumbers: true,
        theme: config.theme,
        autoCloseBrackets: true,
        tabSize: config.tabSize,
        lineWrapping: config.lineWrapping,
        indentWithTabs: config.indentWithTabs,
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
      }),
      ta: textarea,
      mode: mode,
      changed: false,
      currentViewport: boson.currentViewport
    };

    //Hide the editor.
    editor[i].cm.getWrapperElement().style.display = "none";

    //Create on change hook for save notifications.
    editor[i].cm.on("change", function(cm) {
      if (editor[i].changed === false) {
        this.flagHasChanged(i, true);
      }
    });
    editor[i].cm.on("focus", function(cm){
      boson.currentViewport = editor[i].currentViewport;
      bs.switchToEditor(i);
    });

    if (typeof activateOnComplete !== "undefined") {
      if (activateOnComplete === true) {
        bs.switchToEditor(i);
      }
    }

    editor[i].cm.setOption("mode", spec);
    CodeMirror.autoLoadMode(editor[i].cm, mode);

  };

  /*
   * Closes an editor, defined by i (editor id)
   */
  this.closeEditor = function(i) {

    if (! bs.procHooks("close-editor", {
      i: i
    } ) ) {
      return;
    }

    //Remove the CM element.
    editor[i].cm.toTextArea();

    //Remove the text area.
    editor[i].ta.parentElement.removeChild(editor[i].ta);

    //Remove the tab.
    tabs[i].tab.parentElement.removeChild(tabs[i].tab);

    //Remove the context menu.
    if ( typeof bs.deleteTabMenu === "function" ) {
      bs.deleteTabMenu(tabs[i].menu);
    }


    //Clear the editor object.
    editor[i] = {};
    editorData[i] = {};
    tabs[i] = null;

    boson.current_editor = false;
    bs.setTitle("Nothing open");

    //Find another editor to activate.
    bs.findAndActivateTab(i);

  };

  /*
   * Scrolls to the next tab, triggered by Ctrl + T
   */
  this.tabScroll = function() {

    if (! bs.procHooks("tab-scroll") ) {
      return;
    }

    var i, newTab = false,
      max, x, start;

    max = editorData.length - 1;
    i = boson.current_editor;
    start = i + 1;

    for (x = start; x <= max; x++) {
      if (editorData.hasOwnProperty(x)) {
        if (editorData[x].hasOwnProperty('name') && x !== i) {
          newTab = x;
          break;
        }
      }
    }

    if (newTab === false) {
      for (x = 0; x < i; x++) {
        if (editorData.hasOwnProperty(x)) {
          if (editorData[x].hasOwnProperty('name') && x !== i) {
            newTab = x;
            break;
          }
        }
      }
    }

    if (newTab !== false) {
      bs.switchToEditor(x);
    }

  };

  /*
   * Scrolls to the previous tab, triggered by Ctrl + Shift + T
   */
  this.tabScrollBack = function() {

    if (! bs.procHooks("tab-scroll-back") ) {
      return;
    }

    var i, newTab = false,
      max, x, start;

    max = editorData.length - 1;
    i = boson.current_editor;
    start = i - 1;

    for (x = start; x >= 0; x--) {
      if (editorData[x].hasOwnProperty('name') && x !== i) {
        newTab = x;
        break;
      }
    }

    if (newTab === false) {
      for (x = max; x > start; x--) {
        if (editorData[x].hasOwnProperty('name') && x !== i) {
          newTab = x;
          break;
        }
      }
    }

    if (newTab !== false) {
      bs.switchToEditor(x);
    }

  };

  /*
   * Finds another tab to activate.
   * Called after a tab is closed.
   */
  this.findAndActivateTab = function(i) {

    if (! bs.procHooks("find-activate-tab", {
      i: i
    } ) ) {
      return;
    }

    var newTab = false,
      max, x;

    max = editorData.length - 1;

    for (x = max; x >= 0; x--) {
      if (editorData[x].hasOwnProperty('name')) {
        newTab = x;
        break;
      }
    }

    if (newTab !== false) {
      bs.switchToEditor(x);
    }

  };

  /*
   * Shows a hidden Codemirror instance
   */
  this.showEditor = function(i) {

    if (! bs.procHooks("show-editor", {
      i: i
    } ) ) {
      return;
    }

    editor[i].cm.getWrapperElement().style.display = "block";
    editor[i].cm.focus();

  }

  /*
   * Hides a visible Codemirror instance
   */
  this.hideEditor = function(i) {

    if (! bs.procHooks("hide-editor", {
      i: i
    } ) ) {
      return;
    }

    if (i !== false) {
      if ( editor[i].hasOwnProperty("cm") ) {
        editor[i].cm.getWrapperElement().style.display = "none";
      }
    }

  }

  /*
   * Switches tabs to editor, as specified by i (editor id)
   * Triggered by clicking on an inactive tab.
   */
  this.switchToEditor = function(i) {

    if (! bs.procHooks("switch-to-editor", {
      i: i
    } ) ) {
      return;
    }

    var newViewPort;

    newViewPort = editor[i].currentViewport;

    if (boson.current_editor !== i) {
      if ( boson.currentSubView[newViewPort] !== null ) {

        if ( i !== boson.currentSubView[newViewPort] ) {
          this.hideEditor(boson.currentSubView[newViewPort]);
        }
      }

      this.showEditor(i);
      this.activateTab(i);
      boson.current_editor = i;
      boson.currentSubView[newViewPort] = i;
      boson.currentViewport = newViewPort;

      if (editor[i].changed === true) {
        this.setTitle(editorData[i].cwd + "/" + editorData[i].name + " *");
      } else {
        this.setTitle(editorData[i].cwd + "/" + editorData[i].name);
      }
    }
  };

  /*
   * Creates a popup dialogue.
   */
  this.createPopupDialogue = function(title, message, accept, decline, onSuccess, onFailure, i) {

    if (! bs.procHooks("create-popup-dialogue", {
      title: title,
      message: message,
      accept: accept,
      decline: decline,
      onSuccess: onSuccess,
      onFailure: onFailure,
      i: i
    } ) ) {
      return;
    }

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

    popup_cancel_button.addEventListener("click", function(e) {
      e.preventDefault();
      bs.removePopupDialogue(popup);
      bs.suspendCancelEvent(title);
    });

    popup_accept_button.addEventListener("click", function(e) {
      e.preventDefault();
      onSuccess(i);
      bs.removePopupDialogue(popup);
      bs.suspendCancelEvent(title);
    });

    popup_decline_button.addEventListener("click", function(e) {
      e.preventDefault();
      onFailure(i);
      bs.removePopupDialogue(popup);
      bs.suspendCancelEvent(title);
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

  /*
   * Removes an active popup dialogue.
   */
  this.removePopupDialogue = function(popup) {

    if (! bs.procHooks("remove-popup-dialogue", {
      popup: popup
    } ) ) {
      return;
    }

    popup.className = "popup prompt popOut";
    setTimeout(function() {
      popup.parentElement.removeChild(popup);
    }, 150);

  };

  /*
   * Warns the user that their file has changed, prompts to save or close.
   * Triggered when a user closes a tab that has changed, and hasn't been saved.
   */
  this.warnSave = function(i, onSuccess, onFailure) {

    if (! bs.procHooks("warn-save", {
      i: i,
      onSuccess: onSuccess,
      onFailure: onFailure
    } ) ) {
      return;
    }

    var dialogueMessage;

    dialogueMessage = "Do you want to save " + editorData[i].name + " before closing it?";

    return this.createPopupDialogue("Save before closing?", dialogueMessage, "Save", "Don't save", onSuccess, onFailure, i);

  };

  /*
   * Closes a tab defined by i (editor id)
   */
  this.closeTabById = function(i) {

    if (! bs.procHooks("close-tab-by-id", {
      i: i
    } ) ) {
      return;
    }

    var popup;

    if (editor[i].changed === true) {

      //Confirm save.
      popup = this.warnSave(i, function(i) {

        //On save.
        bs.saveBufferById(i, function() {
          bs.closeEditor(i);
          bs.suspendCancelEvent("Save before closing?");
        });

      }, function(i) {

        //On not save.
        bs.closeEditor(i);
        bs.suspendCancelEvent("Save before closing?");

      });

      bs.addCancelEvent("Save before closing?", function() {
        bs.removePopupDialogue(popup);
        bs.suspendCancelEvent("Save before closing?");
      });

    } else {
      this.closeEditor(i);
    }

  };

  /*
   * Closes the current active tab.
   * Triggered by Ctrl+W, or closing the current tab.
   */
  this.closeCurrentTab = function() {

    if (! bs.procHooks("close-current-tab") ) {
      return;
    }

    var popup;

    if (boson.current_editor === null || boson.current_editor === false) {
      return;
    }

    if (editor[boson.current_editor].changed === true) {

      //Confirm save.
      popup = this.warnSave(boson.current_editor, function(i) {

        //On save.
        bs.saveCurrentBuffer(function() {
          bs.closeEditor(boson.current_editor);
          bs.suspendCancelEvent("Save before closing?");
        });

      }, function(i) {

        //On not save.
        bs.closeEditor(boson.current_editor);
        bs.suspendCancelEvent("Save before closing?");

      });

      bs.addCancelEvent("Save before closing?", function() {
        bs.removePopupDialogue(popup);
        bs.suspendCancelEvent("Save before closing?");
      });

    } else {
      this.closeEditor(boson.current_editor);
    }

  };

  /*
   * Handles boson errors.
   * This should do something with a virtual console down the track.
   */
  this.bsError = function(err) {

    if (! bs.procHooks("bs-error", {
      err: err
    } ) ) {
      return;
    }

    console.log("BOSON ERROR: " + err);

  };

  /*
   * Flags an editor buffer as "changed".
   * Triggered by Codemirror callback when editing a file.
   */
  this.flagHasChanged = function(i, status) {

    if (! bs.procHooks("flag-has-changed", {
      i: i,
      status: status
    } ) ) {
      return;
    }

    editor[i].changed = status;

    if (status === true) {
      //Set both tab title and window title.
      tabs[i].title.innerHTML = tabs[i].tab.getAttribute("data-name") + "*";
      this.setTitle(editorData[i].cwd + "/" + editorData[i].name + " *");
    } else {
      //Set both tab title and window title.
      tabs[i].title.innerHTML = tabs[i].tab.getAttribute("data-name");
      this.setTitle(editorData[i].cwd + "/" + editorData[i].name);
    }

  };

  /*
   * Save an editor buffer as defined by i (editor id)
   */
  this.saveBuffer = function(i, callback, secondcallback) {

    if (! bs.procHooks("save-buffer", {
      i: i,
      callback: callback,
      secondcallback: secondcallback
    } ) ) {
      return;
    }

    //Save the specified buffer changes to buffer.
    var fh, fileBuffer;

    if (editorData[i].guid.substring(0, 12) === "new-document") {
      //We need a file name first.
      bs.saveFileAs(i, callback);
      return;
    }

    //Sync Codemirror and editorData.
    editorData[i].buffer = editor[i].cm.getValue();

    fileBuffer = editorData[i];

    fs.writeFile(fileBuffer.cwd + "/" + fileBuffer.name, fileBuffer.buffer, function(err) {
      if (err) {
        this.bsError(err);
      }
      this.log("Saved buffer  to " + fileBuffer.cwd + "/" + fileBuffer.name);

      //Remove the "changed" symbol and flag.
      this.flagHasChanged(i, false);

      if (typeof callback === "function") {
        callback();
      }
      if (typeof secondcallback === "function") {
        secondcallback();
      }

    });

  };

  /*
   * Saves an existing file as something else.
   */
  this.saveFileAs = function() {

    if (! bs.procHooks("save-file-as") ) {
      return;
    }

    var i, fn;

    if (boson.current_editor === null || boson.current_editor === false) {
      return;
    }

    i = boson.current_editor;

    elements.saveFilesInput.addEventListener("change", function(res) {

      if (this.value) {

        fn = path.basename(this.value);

        //Do stuff here.
        editorData[i].cwd = path.dirname(this.value);
        editorData[i].name = fn;
        editorData[i].guid = bs.createUniqueGuid(this.value);

        bs.saveCurrentBuffer();
        tabs[i].tab.setAttribute("data-name", fn);
        tabs[i].title.innerHTML = fn;
        bs.setTitle(this.value);

      }

      this.removeEventListener("change", arguments.callee);

    }, false);

    elements.saveFilesInput.click();
    return;

  };

  /*
   * Generates a semi-unique identifier.
   */
  this.createUniqueGuid = function(prep) {

    var tm;

    tm = (new Date).getTime();

    return prep + "-" + tm;

  };

  /*
   * Saves an editor buffer defined by i (editor id)
   */
  this.saveBufferById = function(i, callback) {


    if (! bs.procHooks("save-buffer-by-id", {
      i: i,
      callback: callback
    } ) ) {
      return;
    }

    if (typeof callback === "function") {
      this.saveBuffer(i, callback);
    } else {
      this.saveBuffer(i);
    }

  };

  /*
   * Saves the currently active editor buffer to disk.
   */
  this.saveCurrentBuffer = function(callback) {

    if (! bs.procHooks("save-current-buffer", {
      callback: callback
    } ) ) {
      return;
    }

    if (boson.current_editor === null || boson.current_editor === false) {
      return;
    }

    if (typeof callback === "function") {
      this.saveBuffer(boson.current_editor, callback);
    } else {
      this.saveBuffer(boson.current_editor);
    }

  };

  /*
   * Synchronously saves a editor buffer as defined by i (editor id)
   */
  this.saveBufferByIdSync = function(i) {

    if (! bs.procHooks("save-buffer-by-id-sync", {
      i: i
    } ) ) {
      return;
    }

    //Save the specified buffer changes to buffer.
    var fh, fileBuffer;

    if (editorData[i].guid.substring(0, 12) === "new-document") {
      return;
    }

    //Sync Codemirror and editorData.
    editorData[i].buffer = editor[i].cm.getValue();
    fileBuffer = editorData[i];

    fs.writeFileSync(fileBuffer.cwd + "/" + fileBuffer.name, fileBuffer.buffer);

    bs.flagHasChanged(i, false);

    return;

  };

  /*
   * Loops through all active file buffers, and save them in their current state to disk.
   */
  this.saveAllBuffers = function(callback) {

    if (! bs.procHooks("save-all-buffers", {
      callback: callback
    } ) ) {
      return;
    }

    var key;

    for (key in editor) {
      if (editor[key].changed === true) {
        bs.saveBufferByIdSync(key);
      }
    }

    if (typeof callback === "function") {
      callback();
    }

    return;

  };

  /*
   * Sets the window title.
   */
  this.setTitle = function(titleBuffer) {

    if (! bs.procHooks("set-title", {
      titleBuffer: titleBuffer
    } ) ) {
      return;
    }

    var proposedTitle;

    proposedTitle = titleBuffer + " - Boson Editor";

    if (boson.title !== proposedTitle) {
      //Set title.
      gui.Window.get().title = proposedTitle;
      boson.title = proposedTitle;
    }

  }

  /*
   * Launches Devtools.
   */
  this.debug = function() {

    if (! bs.procHooks("debug") ) {
      return;
    }

    win.showDevTools();

  };

  /*
   * Reloads the window.
   * Broken.
   */
  this.reinit = function() {

    if (! bs.procHooks("reinit") ) {
      return;
    }

    win.reload();

  };

  /*
   * Trigger Codemirror undo buffer on current document.
   */
  this.cmUndo = function() {

    if (! bs.procHooks("cm-undo") ) {
      return;
    }

    if (boson.current_editor === null || boson.current_editor === false) {
      return;
    }

    editor[boson.current_editor].cm.undo();

  };

  /*
   * Triggers Codemirror redo buffer on current document.
   */
  this.cmRedo = function() {

    if (! bs.procHooks("cm-redo") ) {
      return;
    }

    if (boson.current_editor === null || boson.current_editor === false) {
      return;
    }

    editor[boson.current_editor].cm.redo();

  };

  /*
   * Triggers the Codemirror find function.
   */
  this.cmFind = function() {

    if (! bs.procHooks("cm-find") ) {
      return;
    }

    if (boson.current_editor === null || boson.current_editor === false) {
      return;
    }

    CodeMirror.commands.find(editor[boson.current_editor].cm);

  };

  /*
   * Triggers the Codemirror replace function.
   */
  this.cmReplace = function() {

    if (! bs.procHooks("cm-replace") ) {
      return;
    }

    if (boson.current_editor === null || boson.current_editor === false) {
      return;
    }

    CodeMirror.commands.replace(editor[boson.current_editor].cm);

  };

  /*
   * Creates a dialogue to pick a new pane for a specified editor.
   */
  this.selectNewPane = function(xi) {

    if (! bs.procHooks("select-new-pane", {
      xi: xi
    } ) ) {
      return;
    }

    if (boson.currentPaneMode === "single") {
      bs.log("There's no other active pane to use in single mode.");
      return;
    }

    var popup, popup_cancel_button, paneWrapper, paneHandles = [];

    popup = document.createElement("div");
    popup.className = "popup prompt selectpane"
    popup.id = "popup-selectpane";

    popup_cancel_button = document.createElement("div");
    popup_cancel_button.className = "cancel";

    //Add the panes.
    paneWrapper = document.createElement("div");
    paneWrapper.id = "panewrapper";
    paneWrapper.className = boson.currentPaneMode;

    for ( i=1; i<5; i++ ) {
      paneHandles[i] = document.createElement("div");
      paneHandles[i].id = "viewport-" + i;
      if ( editor[xi].currentViewport === i ) {
        paneHandles[i].className = "viewport active viewport-" + i;
      } else {
        paneHandles[i].className = "viewport viewport-" + i;
      }

      //Need to preserve anonymous scope for i.
      (function(i){
        paneHandles[i].addEventListener("click", function(e){
          e.preventDefault();
          bs.moveEditorToViewport(xi,i);
          bs.removePopupDialogue(popup);
          bs.suspendCancelEvent("SelectPane");
        });
      })(i);

    }

    bs.addCancelEvent("SelectPane", function() {
      bs.removePopupDialogue(popup);
      bs.suspendCancelEvent("SelectPane");
    });

    popup_cancel_button.addEventListener("click", function(e) {
      e.preventDefault();
      bs.removePopupDialogue(popup);
      bs.suspendCancelEvent("SelectPane");
    });

    for ( i=1; i<5; i++ ) {
      paneWrapper.appendChild(paneHandles[i]);
    }

    popup.appendChild(popup_cancel_button);
    popup.appendChild(paneWrapper);

    elements.bodyEntryPoint.appendChild(popup);

    return popup;

  };

  this.activateCmTheme = function(i) {

    if ( cm.themes[i].uri === config.theme + ".css" ) {
      bs.bsError("Theme is already active");
      return false;
    }

    //Inject the theme.
    bs.injectCmTheme(cm.themes[i].uri);

    //Update the config.
    bs.updateConfig("theme", cm.themes[i].uri.replace(".css", ""));

    return true;

  };

  /*
   * Toggle UI theme.
   */
  this.toggleUITheme = function() {

    var current_theme = config.bosontheme;
    var future_theme;

    if ( current_theme === "dark" ) {
      future_theme = "light";
    } else {
      future_theme = "dark";
    }

    boson.ui_theme_element.setAttribute("href","assets/boson/css/themes/" + future_theme + ".css");

    bs.updateConfig("bosontheme", future_theme);

  };

  /*
   * Creates a theme selection window.
   */
  this.themeWindow = function() {

    var popup, popup_cancel_button, popup_logo, popup_title, popup_list, list_items, i = 0, max, active = false;

    popup = document.createElement("div");
    popup.className = "popup prompt plugin-window theme-window"
    popup.id = "popup-plugin-window";

    popup_cancel_button = document.createElement("div");
    popup_cancel_button.className = "cancel";

    popup_logo = document.createElement("div");
    popup_logo.className = "logo";

    popup_title = document.createElement("div");
    popup_title.className = "title";
    popup_title.innerHTML = "Source view themes";

    popup_list = document.createElement("ul");
    popup_list.className = "theme-list";

    max = cm.themes.length;
    for ( i; i<max; i++ ) {

      if ( cm.themes[i].uri === config.theme + ".css" ) {
        active = true;
      } else {
        active = false;
      }

      list_items = document.createElement("li");
      if ( active === true ) {
        list_items.className = "active";
      } else {
        list_items.className = "inactive";
      }

      btn = document.createElement("div");
      if ( active === true ) {
        btn.innerHTML = "Enabled";
        btn.className = "btn btn-active";
        btn.setAttribute("data-active", "true");
      } else {
        btn.innerHTML = "Disabled";
        btn.className = "btn btn-inactive";
        btn.setAttribute("data-active", "false");
      }

      (function(btn,list_items,i){

        var qs, qsb;

        //Hook on click of btn.
        btn.addEventListener("click", function(e){
          e.preventDefault();
          if ( bs.activateCmTheme(i) === true ) {

            qs = document.querySelector("ul.theme-list li.active");
            qsb = document.querySelector("ul.theme-list li.active .btn-active");

            if ( qs ) {
              qs.className = "inactive";
            }
            if ( qsb ) {
              qsb.className = "btn btn-inactive";
              qsb.innerHTML = "Disabled";
            }

            list_items.className = "active";
            btn.className = "btn btn-active";
            btn.innerHTML = "Enabled";
          }
        });

      })(btn,list_items,i);

      sname = document.createElement("div");
      sname.className = "name";
      sname.innerHTML = cm.themes[i].name;

      list_items.appendChild(btn);
      list_items.appendChild(sname);

      popup_list.appendChild(list_items);

    }

    bs.addCancelEvent("ThemeWindow", function() {
      bs.removePopupDialogue(popup);
      bs.suspendCancelEvent("ThemeWindow");
    });

    popup_cancel_button.addEventListener("click", function(e) {
      e.preventDefault();
      bs.removePopupDialogue(popup);
      bs.suspendCancelEvent("ThemeWindow");
    });

    popup.appendChild(popup_cancel_button);
    popup.appendChild(popup_logo);
    popup.appendChild(popup_title);
    popup.appendChild(popup_list);

    elements.bodyEntryPoint.appendChild(popup);

  };

  /*
   * Creates the plugin dialogue, and hooks cancel events.
   */
  this.pluginWindow = function() {

    if (! bs.procHooks("plugin-window") ) {
      return;
    }

    var popup, popup_cancel_button, popup_logo, popup_title, popup_list, key, list_items, name, des, version, link, btn;

    popup = document.createElement("div");
    popup.className = "popup prompt plugin-window"
    popup.id = "popup-plugin-window";

    popup_cancel_button = document.createElement("div");
    popup_cancel_button.className = "cancel";

    popup_logo = document.createElement("div");
    popup_logo.className = "logo";

    popup_title = document.createElement("div");
    popup_title.className = "title";
    popup_title.innerHTML = "Plugin manager";

    popup_list = document.createElement("ul");

    for ( key in plugins ) {

      list_items = document.createElement("li");
      if ( plugins[key].active === true ) {
        list_items.className = "active";
      } else {
        list_items.className = "inactive";
      }

      btn = document.createElement("div");
      if ( plugins[key].active === true ) {
        btn.innerHTML = "Enabled";
        btn.className = "btn btn-active";
        btn.setAttribute("data-active", "true");
      } else {
        btn.innerHTML = "Disabled";
        btn.className = "btn btn-inactive";
        btn.setAttribute("data-active", "false");
      }

      (function(btn,list_items,plugin){

        //Hook on click of btn.
        btn.addEventListener("click", function(e){
          e.preventDefault();
          bs.togglePlugin( plugin, function(enabled) {
            if ( enabled === true ) {
              btn.innerHTML = "Enabled";
              btn.className = "btn btn-active";
              list_items.className = "active";
            } else {
              btn.innerHTML = "Disabled";
              btn.className = "btn btn-inactive";
              list_items.className = "inactive";
            }
          } );
        });

      })(btn,list_items,plugins[key]);

      name = document.createElement("div");
      name.className = "name";
      name.innerHTML = plugins[key].name;

      version = document.createElement("div");
      version.className = "version";
      version.innerHTML = "Version: " + plugins[key].version + ", Author: ";

      link = document.createElement("a");
      link.href = plugins[key].url;
      link.innerHTML = plugins[key].author;

      (function(link,key){

        link.addEventListener("click", function(e){
          e.preventDefault();
          console.log(plugins[key].name);
          console.log(plugins[key].url)
          gui.Shell.openExternal(plugins[key].url);
        });

      })(link,key);

      des = document.createElement("div");
      des.className = "description";
      des.innerHTML = plugins[key].description;

      version.appendChild(link);

      list_items.appendChild(btn);
      list_items.appendChild(name);
      list_items.appendChild(version);
      list_items.appendChild(des);

      popup_list.appendChild(list_items);


    }

    bs.addCancelEvent("PluginWindow", function() {
      bs.removePopupDialogue(popup);
      bs.suspendCancelEvent("PluginWindow");
    });

    popup_cancel_button.addEventListener("click", function(e) {
      e.preventDefault();
      bs.removePopupDialogue(popup);
      bs.suspendCancelEvent("PluginWindow");
    });

    popup.appendChild(popup_cancel_button);
    popup.appendChild(popup_logo);
    popup.appendChild(popup_title);
    popup.appendChild(popup_list);


    elements.bodyEntryPoint.appendChild(popup);

    return popup;

  };

  /*
   * Toggles a plugin either active or inactive.
   */
  this.togglePlugin = function( plugin, callback ) {

    var pluginRef = plugin.name, result = false;

    if ( plugin.active === true ) {
      //Disable plugin.
      bs.disablePlugin(plugin.name);
      result = false;
    } else {
      //Enable plugin.
      bs.enablePlugin(plugin.name);
      result = true;
    }

    if ( typeof callback === "function" ) {
      callback(result);
    }

  };

  /*
   * Enables a plugin as specified by name.
   */
  this.enablePlugin = function( ref ) {

    config.plugins[ref].active = true;
    plugins[ref].active = true;
    bs.bootPluginByName( ref );

    //Update these changes to the config.json file.
    bs.fsWriteConfigAsync();

  };

  /*
   * Disables a plugin as specified by name.
   */
  this.disablePlugin = function( ref ) {

    config.plugins[ref].active = false;
    plugins[ref].active = false;
    bs.shutdownPluginByName( ref );

    //Update these changes to the config.json file.
    bs.fsWriteConfigAsync();

  };

  /*
   * Creates the about dialogue, and hooks cancel events.
   */
  this.about = function() {

    if (! bs.procHooks("about") ) {
      return;
    }

    var popup, popup_cancel_button, popup_logo, popup_title, popup_description, aboutTxt;

    popup = document.createElement("div");
    popup.className = "popup prompt about"
    popup.id = "popup-about";

    aboutTxt = "Boson Version " + boson.version + "<br /><br />";
    aboutTxt += "Boson is an experimental source code editor. It's written in NodeJS, and wrapped in Nw.js as a runtime container for easy cross-platform integration.<br /><br />";
    aboutTxt += "Follow or contribute to it at https://github.com/isdampe/BosonEditorExperimental<br /><br />";
    aboutTxt += "<strong>Credits</strong><br /><br />";
    aboutTxt += "@isdampe - Main developer<br />";
    aboutTxt += "@bgrins - Nativesortable.js library<br />";
    aboutTxt += "Codemirror.net - JS source view library<br />";
    aboutTxt += "Dejavu-fonts - Default font faces<br />";
    aboutTxt += "ionicons.com - MIT licensed icons<br />";

    popup_cancel_button = document.createElement("div");
    popup_cancel_button.className = "cancel";

    popup_logo = document.createElement("div");
    popup_logo.className = "logo";

    popup_title = document.createElement("h4");
    popup_title.innerHTML = "About Boson";

    popup_description = document.createElement("div");
    popup_description.className = "about-dialogue";
    popup_description.innerHTML = aboutTxt;

    bs.addCancelEvent("About", function() {
      bs.removePopupDialogue(popup);
      bs.suspendCancelEvent("About");
    });

    popup_cancel_button.addEventListener("click", function(e) {
      e.preventDefault();
      bs.removePopupDialogue(popup);
      bs.suspendCancelEvent("About");
    });

    popup.appendChild(popup_cancel_button);
    popup.appendChild(popup_logo);
    popup.appendChild(popup_title);
    popup.appendChild(popup_description);

    elements.bodyEntryPoint.appendChild(popup);



    return popup;

  };

  /*
   * Initialzes plugins.
   */
  this.pluginInit = function() {

    //Scan plugins directory.
    fs.readdir(process.cwd() + "/plugins", function(err, files){

      var i = 0, max = files.length, stat, cwd = process.cwd(), uid, currentPlugin;

      for ( i; i<max; i++ ) {

        uid = cwd + "/plugins/" + files[i];
        currentPlugin = files[i];

        //Protect the scope while in the loop.
        (function(uid,currentPlugin){

          fs.stat(uid, function(err, stats) {

            var fuid;

            if (! err ) {
              if(! stats.isFile() ) {

                //Plugin folder found.
                //Check it for a package.json.
                fuid = uid + "/package.json";
                fs.exists(fuid, function(exists){
                  if ( exists ) {
                    //Add it to plugin list.
                    bs.insertPlugin( currentPlugin );
                  } else {
                    bs.log("Plugin " + currentPlugin + " is missing package.json, therefor, it was not activated.");
                  }
                });


              }
            }
          });

        })(uid,currentPlugin);

      }

    });

  };

  /*
   * Inserts a verified plugin into the plugins object.
   */
  this.insertPlugin = function( plugin ) {

    var uid;

    uid = process.cwd() + "/plugins/" + plugin + "/";
    fs.readFile(uid + "package.json", {
      encoding: "utf-8"
    }, function(err, data){

      var jsonP;

      if (! err ) {

        try {
          jsonP = JSON.parse(data);
        } catch( e ) {
          bs.bsError("Invalid package.json on plugin " + plugin);
          return;
        }

        if ( jsonP.hasOwnProperty("name") && jsonP.hasOwnProperty("description") && jsonP.hasOwnProperty("version") && jsonP.hasOwnProperty("main") ) {

          //Inject the plugin.
          if (! plugins.hasOwnProperty(jsonP.name) ) {

            plugins[jsonP.name] = jsonP;

            //Is the plugin active?
            if ( bs.isPluginActive( jsonP.name ) ) {
              plugins[jsonP.name].active = true;
              bs.bootPluginByName( jsonP.name );
            } else {
              plugins[jsonP.name].active = false;
              config.plugins[jsonP.name] = {
                active: false
              };
              bs.log("Plugin is not yet active: " + plugin);
            }

          } else {

            bs.bsError("A plugin with the same name already exists");
            return;
          }

        } else {
          bs.bsError("Invalid manifest format on plugins package.json, " + plugin);
          return;
        }

      } else {
        bs.log("There was an error reading package.json from " + plugin);
        return;
      }

    });

  };

  /*
   * Checks to see if a plugin is active in config.
   */
  this.isPluginActive = function( plugin ) {

    if ( config.plugins.hasOwnProperty(plugin) ) {
      if ( config.plugins[plugin].hasOwnProperty("active") ) {
        if ( config.plugins[plugin].active === true ) {
          return true;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }

  };

  /*
   * Properly requires the plugin and calls the plugins init() function.
   */
  this.bootPluginByName = function( plugin ) {

    var passObject;

    plugins[plugin].entryPoint = require( process.cwd() + "/plugins/" + plugin + "/" + plugins[plugin].main );

    passObject = {
      gui: gui,
      win: win,
      bs: this,
      boson: boson,
      elements: elements,
      config: config
    };

    if ( typeof plugins[plugin].entryPoint.init === "function" ) {
      plugins[plugin].entryPoint.init(passObject);
    }

  };

  /*
   * Calls the shutdown method on a plugin.
   */
  this.shutdownPluginByName = function( plugin ) {

    if ( typeof plugins[plugin].entryPoint.shutdown === "function" ) {
      plugins[plugin].entryPoint.shutdown();
    } else {
      bs.bsError("Plugin " + plugin + " has no method 'shutdown'");
    }

  };

  /*
   * ReInitializes a core module by name
   */
  this.moduleReInitByName = function(name) {

    var passObject;

    passObject = {
      gui: gui,
      win: win,
      bs: this,
      boson: boson,
      elements: elements,
      config: config
    };

    modules[name].init(passObject);

  };

  /*
   * Initializes core modules.
   */
  this.moduleInit = function() {

    var passObject, key;

    //Essential modules.
    modules["treeview"] = require(process.cwd() + "/core/modules/treeview.js");
    modules["keybindings"] = require(process.cwd() + "/core/modules/keybindings.js");
    modules["nativemenu"] = require(process.cwd() + "/core/modules/nativemenu.js");
    modules["resize"] = require(process.cwd() + "/core/modules/resize.js");

    passObject = {
      gui: gui,
      win: win,
      bs: this,
      boson: boson,
      elements: elements,
      config: config
    };

    for (key in modules) {
      modules[key].init(passObject);
    }

  };

  /*
   * Initialize function for the Boson core.
   * Bootstraps the entire app.
   */
  this.init = function() {

    var startupTime, bootUpTime, totalBootTime, i, fileCount, argCountType;

    //Check command line args.
    if (args.length > 0) {

      switch ( args.length ) {
        case 1:

          //Is first arg file or directory?
          try {
            argCountType = fs.lstatSync(args[0]);
            if (argCountType.isDirectory()) {
              boson.working_dir = args[0];
            } else if (argCountType.isFile()) {
              //Get the file's working directory.
              boson.working_dir = path.dirname(args[0]);
              bs.openFileFromPath(args[0]);
            }
          } catch(err) {
            boson_working_dir = process.env.PWD;
            bs.openFileFromPath(process.env.PWD + "/" + args[0]);
          }

        break;
        case 2:

          //Open file and directory.
          boson.working_dir = args[0];
          bs.openFileFromPath(args[0] + "/" + args[1]);

        break;
      }

    } else {
      if ( process.platform === "win32" ) {
        boson.working_dir = process.env['USERPROFILE'];
      } else {
        boson.working_dir = process.env.PWD;
      }
    }

    //Log the startup time.
    startupTime = new Date().getTime();

    //Load config.
    bs.loadConfig();

    //Set Codemirror options.
    CodeMirror.modeURL = "assets/codemirror/mode/%N/%N.js";

    //Preload dom selection.
    bs.preloadDom();
    bs.injectTheme();
    bs.injectCmTheme(config.theme + ".css");

    bs.setFontSize(config.fontSize);

    bs.switchPaneMode(config.paneMode);

    //Fetch window.
    win = gui.Window.get();

    win.on("close", function() {
      bs.closeBoson();
    });

    //Load modules.
    bs.moduleInit();

    //Register Drag and drop tabs.
    bs.registerDragDrop();

    //Show the window.
    win.show();

    //Auto select editor.
    if (boson.current_editor === null) {
      if (fileCount >= 1) {
        this.switchToEditor(fileCount - 1);
      }
    }

    //Load themes.
    bs.loadCmThemes();

    //Calc boot time.
    bootUpTime = new Date().getTime();
    totalBootTime = bootUpTime - startupTime;

    //Scan for plugins later to keep startup speed down.
    bs.pluginInit();

    //Log boot time.
    this.log("Boot complete, " + totalBootTime + " ms");

  };

  /*
   * Closes the Boson app.
   */
  this.closeBoson = function() {

    if (! bs.procHooks("close-boson") ) {
      return;
    }

    var key, allSaved = true,
      popup;

    //Is there unsaved buffers?
    for (key in editorData) {
      if (editor[key].changed === true) {
        allSaved = false;
      }
    }

    if (allSaved === false) {

      //Confirm save.
      popup = this.warnSave(boson.current_editor, function(i) {

        //On save.
        bs.saveAllBuffers(function() {
          bs.suspendCancelEvent("Save all before closing?");
          process.exit(0);
        });

      }, function(i) {

        //On not save.
        bs.suspendCancelEvent("Save all before closing?");
        process.exit(0);

      });

      bs.addCancelEvent("Save all before closing?", function() {
        bs.removePopupDialogue(popup);
        bs.suspendCancelEvent("Save all before closing?");
      });


    } else {
      process.exit(0);
    }

  };

  window.bs = this;
  this.init();

})(window, {
  theme: "mdn-like",
  bosontheme: "light",
  tabSize: 2,
  indentWithTabs: true,
  fontSize: 14,
	lineWrapping: true,
	sidebarWidth: 190,
  plugins: {},
  paneMode: "single"
});
