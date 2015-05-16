![Boson logo](https://raw.githubusercontent.com/isdampe/BosonEditorExperimental/master/assets/boson/media/logo.png)

#Hooks in Boson
Boson uses "hooks" to make it easy to modify the core with plugin modules.

##Using hooks.
When writing a module for boson, hooks are best added in the modules init() function.

```javascript

this.init = function() {

  //Add a function that will be executed when a user creates a new file.
  bs.addHook("create-new-file",function(args){
    console.log("You just created a file.");
    console.log(args);
  }, "my-module-new-file-guid");

};

```

Depending on the function you hook, the content of args will differ. If it's not currently document, you can debug this by checking the source code, or viewing the contents of args with the console.log function.

###Overriding core code
If you want to override the core functionality of a hooked function, you should always ensure you return a false value in your callback function. If you fail to return a value, the core will continue to execute its function.

```javascript

this.init = function() {

  bs.addHook("toggle-sidebar",function(args){
    console.log("User just tried to toggle the sidebar. We're going to force prevent them by returning false.");
    return false;
  }, "my-module-toggle-sidebar");

}

```

##Removing hooks.
For modules that may interrupt traditional features or crash with another module, you also have the ability to remove hooks.

```javascript

this.init = function() {

  //Remove the hook we added earlier.
  bs.removeHook("create-new-file", "my-module-new-file-guid");

};

```

##List of hooks
This list needs to be finished.

####toggle_sidebar
_Args: none_

####update-config
_Args: property, value_

####set-font-size
_Args: size (Font size in pixels)
