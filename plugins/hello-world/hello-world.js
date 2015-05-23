var helloWorld = this;
var bs;

exports.init = function( core ) {

  //Give ourselves a reference for boson core.
  bs = core.bs;

  console.log("Hello, world!");

};

exports.shutdown = function() {

  //Called when plugin is disabled.
  //You should also unregister hooks here.
  console.log("Goodbye, world!");

};
