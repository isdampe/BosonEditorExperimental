var btrace = this;
var bs;

exports.init = function( core ) {

  //Give ourselves a reference for boson core.
  bs = core.bs;
  bs.log("Welcome to btrace");

  bs.addHook("toggle-sidebar", function(){
    bs.log("bs.toggleSidebar");
  },"btrace-toggle-sidebar");

  bs.addHook("update-config", function(){
    bs.log("bs.updateConfig");
  },"btrace-update-config");

  bs.addHook("set-font-size", function(){
    bs.log("bs.setFontSize");
  },"btrace-set-font-size");

  bs.addHook("increase-font-size", function(){
    bs.log("bs.increaseFontSize");
  },"btrace-increase-font-size");

  bs.addHook("decrease-font-size", function(){
    bs.log("bs.decreaseFontSize");
  },"btrace-decrease-font-size");

  bs.addHook("attempt-open-files", function(){
    bs.log("bs.attemptOpenFiles");
  },"btrace-attempt-open-files");

  bs.addHook("open-file-from-path", function(){
    bs.log("bs.openFileFromPath");
  },"btrace-open-file-from-path");

  bs.addHook("open-file-dialogue", function(){
    bs.log("bs.openFileDialogue");
  },"btrace-open-file-dialogue");

  bs.addHook("create-new-file", function(){
    bs.log("bs.createNewFile");
  },"btrace-create-new-file");

  bs.addHook("create-tab", function(){
    bs.log("bs.createTab");
  },"btrace-create-tab");

  bs.addHook("activate-tab", function(){
    bs.log("bs.activateTab");
  },"btrace-activate-tab");

  bs.addHook("switch-pane-mode", function(){
    bs.log("bs.switchPaneMode");
  },"btrace-switch-pane-mode");

  bs.addHook("reroute-overflowing-panes", function(){
    bs.log("bs.rerouteOverflowingPanes");
  },"btrace-reroute-overflowing-panes");

  bs.addHook("move-editor-to-viewport", function(){
    bs.log("bs.moveEditorToViewport");
  },"btrace-move-editor-to-viewport");

  bs.addHook("activate-viewport", function(){
    bs.log("bs.activateViewport");
  },"btrace-activate-viewport");

  bs.addHook("inject-editor-to-active-pane", function(){
    bs.log("bs.injectEditorToActivePane");
  },"btrace-inject-editor-to-active-pane");

  bs.addHook("create-editor", function(){
    bs.log("bs.createEditor");
  },"btrace-create-editor");

  bs.addHook("close-editor", function(){
    bs.log("bs.closeEditor");
  },"btrace-close-editor");

  bs.addHook("tab-scroll", function(){
    bs.log("bs.tabScroll");
  },"btrace-tab-scroll");

  bs.addHook("tab-scroll-back", function(){
    bs.log("bs.tabScrollBack");
  },"btrace-tab-scroll-back");

  bs.addHook("find-activate-tab", function(){
    bs.log("bs.findActivateTab");
  },"btrace-find-activate-tab");

  bs.addHook("show-editor", function(){
    bs.log("bs.showEditor");
  },"btrace-show-editor");

  bs.addHook("hide-editor", function(){
    bs.log("bs.hideEditor");
  },"btrace-hide-editor");

  bs.addHook("switch-to-editor", function(){
    bs.log("bs.switchToEditor");
  },"btrace-switch-to-editor");

  bs.addHook("create-popup-dialogue", function(){
    bs.log("bs.createPopupDialogue");
  },"btrace-create-popup-dialogue");

  bs.addHook("remove-popup-dialogue", function(){
    bs.log("bs.removePopupDialogue");
  },"btrace-remove-popup-dialogue");

  bs.addHook("warn-save", function(){
    bs.log("bs.warnSave");
  },"btrace-warn-save");

  bs.addHook("close-tab-by-id", function(){
    bs.log("bs.closeTabById");
  },"btrace-close-tab-by-id");

  bs.addHook("close-current-tab", function(){
    bs.log("bs.closeCurrentTab");
  },"btrace-close-current-tab");

  bs.addHook("bs-error", function(){
    bs.log("bs.bsError");
  },"btrace-bs-error");

  bs.addHook("flag-has-changed", function(){
    bs.log("bs.flagHasChanged");
  },"btrace-flag-has-changed");

  bs.addHook("save-buffer", function(){
    bs.log("bs.saveBuffer");
  },"btrace-save-buffer");

  bs.addHook("save-file-as", function(){
    bs.log("bs.saveFileAs");
  },"btrace-save-file-as");

  bs.addHook("save-buffer-by-id", function(){
    bs.log("bs.saveBufferById");
  },"btrace-save-buffer-by-id");

  bs.addHook("save-current-buffer", function(){
    bs.log("bs.saveCurrentBuffer");
  },"btrace-save-current-buffer");

  bs.addHook("save-all-buffers", function(){
    bs.log("bs.saveAllBuffers");
  },"btrace-save-all-buffers");

  bs.addHook("set-title", function(){
    bs.log("bs.setTitle");
  },"btrace-set-title");

  bs.addHook("debug", function(){
    bs.log("bs.debug");
  },"btrace-debug");

  bs.addHook("reinit", function(){
    bs.log("bs.reinit");
  },"btrace-reinit");

  bs.addHook("cm-undo", function(){
    bs.log("bs.cmUndo");
  },"btrace-cm-undo");

  bs.addHook("cm-redo", function(){
    bs.log("bs.cmRedo");
  },"btrace-cm-redo");

  bs.addHook("cm-find", function(){
    bs.log("bs.cmFind");
  },"btrace-cm-find");

  bs.addHook("cm-replace", function(){
    bs.log("bs.cmReplace");
  },"btrace-cm-replace");

  bs.addHook("select-new-pane", function(){
    bs.log("bs.selectNewPane");
  },"btrace-select-new-pane");

  bs.addHook("about", function(){
    bs.log("bs.about");
  },"btrace-about");

  bs.addHook("close-boson", function(){
    bs.log("bs.closeBoson");
  },"btrace-close-boson");

  bs.addHook("plugin-window", function(){
    bs.log("bs.pluginWindow");
  },"btrace-plugin-window");


};

exports.shutdown = function() {

  bs.removeHook("toggle-sidebar", "btrace-toggle-sidebar");
  bs.removeHook("update-config", "btrace-update-config");
  bs.removeHook("set-font-size", "btrace-set-font-size");
  bs.removeHook("increase-font-size", "btrace-increase-font-size");
  bs.removeHook("decrease-font-size", "btrace-decrease-font-size");
  bs.removeHook("attempt-open-files", "btrace-attempt-open-files");
  bs.removeHook("open-file-from-path", "btrace-open-file-from-path");
  bs.removeHook("open-file-dialogue", "btrace-open-file-dialogue");
  bs.removeHook("create-new-file", "btrace-create-new-file");
  bs.removeHook("create-tab", "btrace-create-tab");
  bs.removeHook("activate-tab", "btrace-activate-tab");
  bs.removeHook("switch-pane-mode", "btrace-switch-pane-mode");
  bs.removeHook("reroute-overflowing-panes", "btrace-reroute-overflowing-panes");
  bs.removeHook("move-editor-to-viewport", "btrace-move-editor-to-viewport");
  bs.removeHook("activate-viewport", "btrace-activate-viewport");
  bs.removeHook("inject-editor-to-active-pane", "btrace-inject-editor-to-active-pane");
  bs.removeHook("create-editor", "btrace-create-editor");
  bs.removeHook("close-editor", "btrace-close-editor");
  bs.removeHook("tab-scroll", "btrace-tab-scroll");
  bs.removeHook("tab-scroll-back", "btrace-tab-scroll-back");
  bs.removeHook("find-activate-tab", "btrace-find-activate-tab");
  bs.removeHook("show-editor", "btrace-show-editor");
  bs.removeHook("hide-editor", "btrace-hide-editor");
  bs.removeHook("switch-to-editor", "btrace-switch-to-editor");
  bs.removeHook("create-popup-dialogue", "btrace-create-popup-dialogue");
  bs.removeHook("remove-popup-dialogue", "btrace-remove-popup-dialogue");
  bs.removeHook("warn-save", "btrace-warn-save");
  bs.removeHook("close-tab-by-id", "btrace-close-tab-by-id");
  bs.removeHook("close-current-tab", "btrace-close-current-tab");
  bs.removeHook("bs-error", "btrace-bs-error");
  bs.removeHook("flag-has-changed", "btrace-flag-has-changed");
  bs.removeHook("save-buffer", "btrace-save-buffer");
  bs.removeHook("save-file-as", "btrace-save-file-as");
  bs.removeHook("save-buffer-by-id", "btrace-save-buffer-by-id");
  bs.removeHook("save-current-buffer", "btrace-save-current-buffer");
  bs.removeHook("save-buffer-by-id-sync", "btrace-save-buffer-by-id-sync");
  bs.removeHook("save-all-buffers", "btrace-save-all-buffers");
  bs.removeHook("set-title", "btrace-set-title");
  bs.removeHook("debug", "btrace-debug");
  bs.removeHook("reinit", "btrace-reinit");
  bs.removeHook("cm-undo", "btrace-cm-undo");
  bs.removeHook("cm-redo", "btrace-cm-redo");
  bs.removeHook("cm-find", "btrace-cm-find");
  bs.removeHook("cm-replace", "btrace-cm-replace");
  bs.removeHook("select-new-pane", "btrace-select-new-pane");
  bs.removeHook("about", "btrace-about");
  bs.removeHook("close-boson", "btrace-close-boson");
  bs.removeHook("plugin-window", "btrace-plugin-window");

};
