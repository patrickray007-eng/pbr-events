(function(){
"use strict";

/* ---------- footer year ---------- */
var yr = document.getElementById("year");
if(yr) yr.textContent = new Date().getFullYear();

/* ---------- BookLive iframe ----------
   The enquiry form is served from booklive.com, which is where Patrick's
   booking pipeline already lives. It reports its own height through
   BookLive's iframeResizer, so the frame grows and shrinks with the form
   instead of scrolling inside a fixed box.

   The script is only fetched once the form scrolls into view. It is a third
   party request, and most visitors never reach the bottom of the page. */
var frame = document.getElementById("bookliveForm");
if(frame && "IntersectionObserver" in window){
  var loaded = false;
  var io = new IntersectionObserver(function(entries){
    if(!entries[0].isIntersecting || loaded) return;
    loaded = true;
    io.disconnect();
    var s = document.createElement("script");
    s.src = "https://booklive.com/js/iframeResizer.min.js";
    s.onload = function(){
      if(window.iFrameResize) window.iFrameResize({checkOrigin:false}, frame);
    };
    document.body.appendChild(s);
  }, {rootMargin:"400px"});
  io.observe(frame);
}
})();
