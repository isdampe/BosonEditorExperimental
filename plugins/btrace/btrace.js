var btrace = this;
var bs;

exports.init = function( core ) {

  //Give ourselves a reference for boson core.
  bs = core.bs;
  console.log("Welcome to btrace");

  bs.addHook("toggle-sidebar", function(){
    console.log("bs.toggleSidebar");
  },"btrace-toggle-sidebar");

};

exports.shutdown = function() {

  bs.removeHook("toggle-sidebar", "btrace-toggle-sidebar");

};
