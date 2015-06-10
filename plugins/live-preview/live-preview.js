var http = require("http");
var fs = require("fs");
var livePreview = this;
var bs, boson, menuHookGl, guiGl, monitorFiles = [], monitorTimer, live_window;

exports.init = function( core ) {

  var menuHook;

  //Give ourselves a reference for boson core.
  bs = core.bs;
  boson = core.boson;
  guiGl = core.gui;

  menuHook = bs.insertMenuItem("viewMenu", {
    label: 'Live preview',
    click: function () {
      livePreview.openWindow();
    }
  });

  menuHookGl = menuHook;

};

exports.shutdown = function() {

  bs.removeMenuItem("bosonMenu",menuHookGl);

};

exports.openWindow = function() {

  var editor;

	//Get current editor.
  if( boson.current_editor === null ) {
    bs.bsError("live-preview.js: No editor is currently selected");
    return;
  }

  editor = bs.getEditorById(boson.current_editor);

  if ( editor.mode !== "htmlmixed" ) {
    bs.bsError("live-preview.js: Invalid mode, live-preview only supports htmlmixed.");
    return;
  }

  //Create window.
  livePreview.createServer(boson.current_editor);

};

exports.createServer = function(i) {

  var server, editorData;
  var serverData = {
    host: "0.0.0.0",
    port: Math.floor(Math.random() * (10000 - 5000) + 5000)
  };

  editorData = bs.getEditorDataById(i);
  livePreview.startMonitoringFiles();

  server = http.createServer(function(req,res){

    var fqr = editorData.cwd + req.url;

    fs.exists(fqr, function(exists){
      if ( exists ) {
        if (! monitorFiles.hasOwnProperty(fqr) ) {
          monitorFiles[fqr] = {
            fqr: fqr,
            size: 0
          };
        }
        console.log(monitorFiles);
      }
    });

    fs.readFile(fqr,function(err,data){
      res.end(data);
    });

  });

  server.listen(serverData.port, function(){
    bs.log("Server opened on port " + serverData.port);

    //Open a window.
    live_window = guiGl.Window.open("http://localhost:" + serverData.port + "/" + editorData.name,{
      toolbar: false,
      title: "Boson Live Preview"
    });

  });


};

exports.startMonitoringFiles = function() {


  monitorTimer = setInterval(function(){

    var key;

    for( key in monitorFiles ) {

      (function(key){

        fs.stat(monitorFiles[key].fqr, function(err, stats){
          if (! err ) {
            if ( typeof monitorFiles[key] !== "undefined" ) {
              if ( monitorFiles[key].size !== stats.size ) {
                //Trigger reload.
                monitorFiles[key].size = stats.size;
                livePreview.triggerReload(key);
              }
            }

          }
        });

      })(key);


    }

  }, 250);

};

exports.triggerReload = function(key) {

  live_window.reload();

};


exports.stopMonitoringFiles = function() {

  clearInterval(monitorFiles);

};
