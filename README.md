![Boson logo](https://raw.githubusercontent.com/isdampe/BosonEditorExperimental/master/assets/boson/media/logo.png)

#Boson - An experimental editor
Boson is a minimalistic experimental source code editor. It's written in Node, and wrapped in
Nw.js as a runtime container for easy cross-platform integration.

It utilizes Codemirror in place for it's source view highlighting and editing.

##Keeping things simple
Modern editors tend to be _full_ of features, most of which, we (well, myself anyway) rarely use. A side affect of
this can be crippling performance, gigantic menus, and a slow learning curve.

Boson was written with this in mind, and fundamentally, aims to be a minimal editor that has the bare essentials only.

##Contributing
Found a bug? Great - go ahead and open an issue, with clear instructions on how to re-produce.  
Written a patch? Go ahead and send your pull request with clear instructions what and how your patch fixes something.

##Hooks
Read about hooks over on [hooks.md](hooks.md).

###To do
* Develop a "plugin" architecture for user written extensions  
* ~~Create a multi-pane engine for split view editing~~
* ~~Create a hook engine for extensions~~
* Create a "preferences" window
* Create a "theme" selector window.

And lots more...

###Thanks to
* Dejavu-fonts - http://dejavu-fonts.org/wiki/Main_Page
* @bgrins - For the awesome native sortable js library, https://github.com/bgrins/nativesortable
* http://ionicons.com/ - For the MIT licensed icons
* Codemirror.net - For the awesome JS source view library
* Interact.js - https://github.com/taye/interact.js

> If your name is missing from this list, please let me know.
