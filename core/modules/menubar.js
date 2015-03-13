var menubar = this;
var menuParents = [], subMenuActive = false;
var bs;

exports.init = function( core ) {

	bs = core.bs;
	menubar.hookMenus();
	menubar.hookActions();

};

exports.hookMenus = function() {

	var menuList, i, max;

	menuList = window.document.querySelectorAll("[data-rel=menu-parent]");
	max = menuList.length;

	for ( i=0; i<max; i++ ) {

		menubar.hookSubMenu(menuList[i]);

	}

};

exports.hookSubMenu = function( element ) {

	var i, submenu;

	i = menuParents.length;

	submenu = element.querySelectorAll("ul");
	if ( submenu.length > 0 ) {
		submenu = submenu[0];
	}

	menuParents[i] = {
		element: element,
		active: false,
		submenu: submenu
	};

	element.onclick = function(e){
		e.preventDefault();

		//Trigger submenu.
		menubar.triggerSubmenu(i);

	};

};

exports.triggerSubmenu = function( i ) {

	if ( i !== subMenuActive && subMenuActive !== false ) {
		//Close open menu.
		menuParents[subMenuActive].submenu.style.display = "none";
		menuParents[subMenuActive].active = false;
	}

	if ( menuParents[i].active === true ) {
		//Deactivate.
		menuParents[i].submenu.style.display = "none";
		menuParents[i].active = false;
		subMenuActive = false;
	} else {
		//Activate.
		menuParents[i].submenu.style.display = "block";
		menuParents[i].active = true;
		subMenuActive = i;
	}

};

exports.hookActions = function() {

	var actionList, key;

	actionList = window.document.querySelectorAll("[data-menu-trigger]");

	for ( key in actionList ) {

		menubar.hookAction( actionList[key] );

	}

};

exports.hookAction = function( element ) {

	element.onclick =  function(e){
		e.preventDefault();
		e.stopPropagation();

		var evCallback = element.getAttribute("data-menu-trigger");
		if ( bs.hasOwnProperty(evCallback) ) {
			bs[evCallback]();
		}

		menubar.deactivateAllMenus();

	};

};

exports.deactivateAllMenus = function() {

	var key;

	for ( key in menuParents ) {
		menuParents[key].submenu.style.display = "none";
		menuParents[key].active = false;
	}

};