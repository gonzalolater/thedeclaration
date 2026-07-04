/* Ambient star field — a sparse constellation of gold points drifting almost
 * imperceptibly, with a slow twinkle. Quiet, analog, cheap to run.
 * Disabled for prefers-reduced-motion. */
(function () {
  "use strict";
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var canvas = document.getElementById("bg-net");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var stars = [];
  var W, H, COUNT;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    COUNT = Math.min(44, Math.max(18, Math.floor((W * H) / 60000)));
    while (stars.length < COUNT) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05,
        r: 0.6 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
        speed: 0.004 + Math.random() * 0.006,
        // iron-gall navy points with the occasional gilt one
        gilt: Math.random() < 0.35,
      });
    }
    stars.length = COUNT;
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.x += s.vx; s.y += s.vy;
      s.phase += s.speed;
      if (s.x < -10) s.x = W + 10; if (s.x > W + 10) s.x = -10;
      if (s.y < -10) s.y = H + 10; if (s.y > H + 10) s.y = -10;
      var a = 0.10 + 0.14 * (0.5 + 0.5 * Math.sin(s.phase));
      ctx.fillStyle = s.gilt
        ? "rgba(168,133,60," + a.toFixed(3) + ")"
        : "rgba(27,42,74," + (a * 0.8).toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(tick);
})();
