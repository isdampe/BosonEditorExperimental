exports.init = function( core ) {

	//Hook drag resize.
  window.interact('#sidebar-entrypoint')
  .resizable({
    edges: { left: false, right: true, bottom: false, top: false }
  })
  .styleCursor(true)
  .on('resizemove', function (event) {

     if ( event.rect.width < 160 ) {
      return;
    }
      
    var target = event.target,
        x = (parseFloat(target.getAttribute('data-x')) || 0),
        y = (parseFloat(target.getAttribute('data-y')) || 0);

    target.style.width  = event.rect.width + 'px';

    var calcString = "calc(100% - " + event.rect.width + "px)";
    core.elements.editorEntryPoint.style.width = calcString;
    core.elements.editorEntryPoint.style.left  = event.rect.width + 'px';
    core.elements.topbar.style.width = calcString;
    core.elements.topbar.style.left  = event.rect.width + 'px';

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  });

};