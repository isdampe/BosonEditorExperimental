var resize = this;
var bs, elements;

exports.init = function( core ) {

  bs = core.bs;
  elements = core.elements;

  //Set sidebar width from config.
  resize.setWidthByConfig( core.config.sidebarWidth );

	//Hook drag resize.
  window.interact('#sidebar-entrypoint')
  .resizable({
    edges: { left: false, right: true, bottom: false, top: false }
  })
  .styleCursor(true)
  .on('resizemove', function (event) {
    resize.setWidthByHook(event);
  });

};

exports.setWidthByHook = function( event ) {

  if ( event.rect.width < 160 || event.rect.width > 639 ) {
    return;
  }
      
  var target = event.target,
    x = (parseFloat(target.getAttribute('data-x')) || 0),
    y = (parseFloat(target.getAttribute('data-y')) || 0);

  target.style.width  = event.rect.width + 'px';

  var calcString = "calc(100% - " + event.rect.width + "px)";
  elements.editorEntryPoint.style.width = calcString;
  elements.editorEntryPoint.style.left  = event.rect.width + 'px';
  elements.topbar.style.width = calcString;
  elements.topbar.style.left  = event.rect.width + 'px';

  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);

  bs.updateConfig("sidebarWidth", event.rect.width);

};

exports.setWidthByConfig = function( width ) {

  var ev = {};
  ev.rect = {};
  ev.rect.width = width;
  ev.target = elements.sidebar;

  resize.setWidthByHook(ev);

};