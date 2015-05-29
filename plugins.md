![Boson logo](https://raw.githubusercontent.com/isdampe/BosonEditorExperimental/master/assets/boson/media/logo.png)

#Writing plugins for Boson
Boson has a basic plugin engine that allows you to easily build plugins to either
extend the editor core, or change its default functionality.

##Getting started
Plugins should be placed in the plugins/ folder directly. They should have their
own folder, which includes a package.json that follows the manifest below.

##Package.json manifest for boson plugins

```json
{
  "name": "plugin-name",
  "description": "Description of the plugin",
  "version": "1.0",
  "main": "plugin-name.js",
  "author": "@isdampe",
  "url": "https://github.com/isdampe"
}
```

Your plugin's package.json should specify your primary module under the "main"
object. This needs to point directly to your plugin so the core can find it.

##The hello world plugin
There's a plugin called "hello-world" located in the plugins/ folder. This is
a simple example of how plugins should be laid out.

##A few basic principles to follow
To make your plugin readable and easy to modify, you should follow a few basic
principles when developing it.

####Declaring a module level bs object, and a self reference.
If you take a peak at the first two lines in hello-world.js, you'll see they are

```javascript
var helloWorld = this;
var bs;
```

The first line is giving the plugin a self reference, and the second is declaring
a module level pointer that we'll asign to the boson core. This is handy for
quickly accessing core functions and adding hooks.

####You'll need a init() function
After a plugin is activated, the core will call the modules init() function. It
also passes a special object as an argument to give you access to necessary
access to the core and it's components.

Your init function should look something like below

```javascript
exports.init = function( core ) {

  //Asign the module level variable we declared before to the core.
  bs = core.bs;

  //Print to the console when the plugin is first run.
  console.log("Hello, world!");

};
```

####You'll also need a shutdown() function
Opposite to init(), shutdown() is called when a user disables your plugin.
You should unhook an hooks you've set in init() inside shutdown() to stop your
plugin executing code after a user disables it.

```javascript
exports.shutdown = function() {

  //Called when plugin is disabled.
  //You should also unregister hooks here.
  console.log("Goodbye, world!");

};
```

####Adding hooks
Under most circumstances, hooks should be declared inside the init() function,
and cancelled in the shutdown() function.

See [hooks.md](hooks.md) for more info on hooks.

####Inserting menu items.
Menu items can be inserted by calling bs.insertMenuItem().
They should be removed again in your shutdown() function by calling bs.removeMenuItem.

```javascript

var bs, menuHookGl;

exports.init = function( core ) {

  var menuHook;

  bs = core.bs;

  menuHook = bs.insertMenuItem("bosonMenu", {
    label: 'Hello world',
    click: function () {
      console.log("Hello, world!");
    }
  });

  menuHookGl = menuHook;

};

exports.shutdown = function() {

  bs.removeMenuItem("bosonMenu",menuHookGl);

};

```
