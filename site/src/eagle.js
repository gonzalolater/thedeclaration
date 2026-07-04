/* The eagle beats its wings — pure ASCII animation. The <pre> ships with
 * frame 0 inline; the remaining frames are fetched and swapped in on a
 * timer. Static for prefers-reduced-motion, paused while offscreen. */
(function () {
  "use strict";

  var pre = document.querySelector("pre.eagle");
  if (!pre) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var FRAME_MS = 100; // 12 frames -> one wing beat every ~1.2s

  fetch("/eagle-frames.json")
    .then(function (r) { return r.json(); })
    .then(function (frames) {
      if (!frames || frames.length < 2) return;
      var i = 0;
      var visible = true;
      var last = 0;

      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          visible = entries[entries.length - 1].isIntersecting;
        }).observe(pre);
      }

      function tick(ts) {
        if (visible && ts - last >= FRAME_MS) {
          last = ts;
          i = (i + 1) % frames.length;
          pre.innerHTML = frames[i];
        }
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    })
    .catch(function () { /* the still eagle is a fine eagle */ });
})();
