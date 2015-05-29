var helloWorld = this;
var bs, menuHookGl;

exports.init = function( core ) {

  var menuHook;

  //Give ourselves a reference for boson core.
  bs = core.bs;

  console.log("Hello, world!");

  menuHook = bs.insertMenuItem("bosonMenu", {
    label: 'Hello world',
    click: function () {
      console.log("Hello, world!");
    }
  });

  menuHookGl = menuHook;

};

exports.shutdown = function() {

  //Called when plugin is disabled.
  //You should also unregister hooks here.
  console.log("Goodbye, world!");
  bs.removeMenuItem("bosonMenu",menuHookGl);

};
