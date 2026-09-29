/* Dish360 dish model: a real 3D object you can turn, drawn on one canvas.

   The dish is built from horizontal slices (bottom bun, patty, cheese, tomato,
   lettuce, sesame dome). Each slice is a disc in 3D, projected for a camera
   looking down at `pitch` and turned by `yaw`, and painted bottom to top so the
   upper slices cover the lower ones exactly as a real stack would.

   It used to be ~37 CSS-3D layers per dish; on integrated laptop GPUs three of
   those on one page dropped scrolling to single-digit fps. One canvas is a
   couple of dozen cheap shapes per frame, and it only redraws when something
   changed and the dish is on screen.

   Two published parameters make it a pipeline, which is what the product does:
     mesh    0..1  wire rings appear bottom to top (the mesh is being built)
     texture 0..1  rings fill with colour top to bottom (the texture is baked)

   var m = DishModel.create(host, { label: "Smash Burger" });
   m.set({ mesh: 1, texture: 1, yaw: 30, pitch: 24 });
   m.interactive(true);   // pointer drag + arrow keys, with inertia
   m.spin(12);            // idle turntable, degrees per second (0 = off)      */
(function (global) {
  "use strict";

  var reduce = global.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var TAU = Math.PI * 2;
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function mix(a, b, t) {
    var pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    var r = Math.round(((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t);
    var g = Math.round(((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t);
    var bl = Math.round((pa & 255) * (1 - t) + (pb & 255) * t);
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
  }

  // Outline of a slice as radius (fraction of r) at local angle a.
  var SHAPES = {
    round: function () { return 1; },
    wobble: function (a) { return (50 - 1.6 + 1.6 * Math.sin(a * 5 + 1.3)) / 50; },
    wavy: function (a) { return (50 - 3.2 + 3.2 * Math.sin(a * 14 + 0.4)) / 50; },
    // a rounded square (superellipse), set diamond-wise like a cheese slice
    square: function (a) {
      var c = Math.abs(Math.cos(a + Math.PI / 4)), s = Math.abs(Math.sin(a + Math.PI / 4)), n = 8;
      return Math.SQRT2 * 0.94 / Math.pow(Math.pow(c, n) + Math.pow(s, n), 1 / n) / Math.SQRT2;
    }
  };
  var SAMPLES = { round: 40, wobble: 48, wavy: 112, square: 48 };

  // Seeds on the dome: [x%, y%] of the top slice's box, as the CSS build had them.
  var SEEDS = [[38, 30], [55, 26], [63, 40], [44, 46], [30, 52], [58, 57], [48, 64], [70, 54], [36, 68], [26, 38], [66, 70], [52, 38]];

  function recipe() {
    var s = [], i, t;
    for (i = 0; i < 8; i++) {                                  // bottom bun, rounded underside
      t = i / 7;
      s.push({ h: i * 2, r: 45 * (0.84 + 0.16 * Math.sin(t * Math.PI / 2)), shape: "round",
        c1: i === 7 ? "#e8c98f" : "#c98b4d", c2: i === 7 ? "#c38446" : "#a4642d" });
    }
    for (i = 0; i < 7; i++) {                                  // patty
      s.push({ h: 16 + i * 2, r: 48, shape: "wobble", c1: i === 6 ? "#6d4531" : "#5b3727", c2: "#3a2117" });
    }
    s.push({ h: 30, r: 39, shape: "square", c1: "#ecb851", c2: "#d99a30" });
    s.push({ h: 31, r: 39, shape: "square", c1: "#efbf5b", c2: "#dca236" });
    s.push({ h: 33, r: 41, shape: "round", c1: "#cf5b41", c2: "#9b3726" });
    s.push({ h: 34.5, r: 41, shape: "round", c1: "#d6664b", c2: "#a13c2a" });
    s.push({ h: 36, r: 50, shape: "wavy", c1: "#a3c47b", c2: "#6a8f4c" });
    s.push({ h: 37.5, r: 49, shape: "wavy", c1: "#aecd85", c2: "#739853" });
    for (i = 0; i < 16; i++) {                                 // sesame dome
      var z = i * 2, H = 33;
      t = i / 15;
      s.push({ h: 39 + z, r: Math.max(6, 46 * Math.sqrt(Math.max(0.02, 1 - (z / H) * (z / H)))), shape: "round",
        c1: mix("#cf8f4f", "#e2a766", t), c2: mix("#a15f28", "#c07a3a", t), dome: true });
    }
    return s;
  }

  var STYLE_ID = "dish3d-style";
  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var st = document.createElement("style");
    st.id = STYLE_ID;
    st.textContent = ".dm{position:relative;width:100%;height:100%;touch-action:pan-y;outline:none}" +
      ".dm canvas{position:absolute;inset:0;width:100%;height:100%;display:block}" +
      ".dm:focus-visible{outline:2px solid var(--sc-accent,#aad0af);outline-offset:4px;border-radius:14px}";
    document.head.appendChild(st);
  }

  function create(host, opts) {
    opts = opts || {};
    injectStyle();
    var slices = recipe(), N = slices.length;
    var DOME_BASE = 39, DOME_H = 33, DOME_R = 46;
    var root = document.createElement("div");
    root.className = "dm";
    root.setAttribute("role", "img");
    root.setAttribute("aria-label", (opts.label || "Dish") + ", 3D model. Drag or use arrow keys to rotate.");
    var cv = document.createElement("canvas");
    root.appendChild(cv);
    host.appendChild(root);
    var ctx = cv.getContext("2d");
    var dpr = Math.min(global.devicePixelRatio || 1, 2);

    var st = { mesh: 1, texture: 1, yaw: 25, pitch: 24, scale: 1, lift: 0 };
    var W = 0, Hh = 0, u = 1, dragYaw = 0, vel = 0, spinRate = 0, spinYaw = 0, last = performance.now();
    var dirty = true, visible = true, dragging = false, lastX = 0, paused = false;

    function measure() {
      var w = host.clientWidth, h = host.clientHeight;
      W = Math.max(1, w); Hh = Math.max(1, h);
      cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr);
      var size = opts.size || Math.min(w * 0.82, h * 1.05);
      u = Math.max(0.5, size / 100);
      dirty = true;
    }

    function outline(s, cx, cy, R, sp, yawR) {
      var fn = SHAPES[s.shape], n = SAMPLES[s.shape], pts = [];
      for (var k = 0; k < n; k++) {
        var a = (k / n) * TAU;               // screen angle
        var rr = R * fn(a - yawR);          // outline turns with the dish
        pts.push(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * sp);
      }
      return pts;
    }
    function trace(pts) {
      ctx.beginPath();
      ctx.moveTo(pts[0], pts[1]);
      for (var k = 2; k < pts.length; k += 2) ctx.lineTo(pts[k], pts[k + 1]);
      ctx.closePath();
    }

    function draw() {
      dirty = false;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, Hh);
      var m = clamp01(st.mesh), t = clamp01(st.texture);
      var pitch = Math.max(10, Math.min(40, st.pitch)) * Math.PI / 180;
      var sp = Math.sin(pitch), cp = Math.cos(pitch);
      var yawR = (st.yaw + dragYaw + spinYaw) * Math.PI / 180;
      var U = u * st.scale;
      var cx = W / 2, base = Hh / 2 + 34 * U * cp + st.lift * u;

      // contact shadow
      var sa = t * 0.9 + m * 0.1;
      if (sa > 0.01) {
        var srx = 55 * U, sry = 55 * U * sp * 0.9 + 6 * U, sy = base + 6 * U * sp;
        ctx.save();
        ctx.translate(cx, sy); ctx.scale(1, sry / srx);
        var sg = ctx.createRadialGradient(0, 0, 0, 0, 0, srx);
        sg.addColorStop(0, "rgba(0,0,0," + (0.55 * sa).toFixed(3) + ")");
        sg.addColorStop(0.55, "rgba(0,0,0," + (0.28 * sa).toFixed(3) + ")");
        sg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(0, 0, srx, 0, TAU); ctx.fill();
        ctx.restore();
      }

      ctx.lineWidth = 1;
      for (var i = 0; i < N; i++) {
        var s = slices[i];
        var vis = clamp01((m * (N + 1.5) - i) / 1.5);
        if (vis <= 0) continue;
        var fill = clamp01((t * (N + 1.5) - (N - 1 - i)) / 1.5);
        var rise = (1 - vis) * 7;
        var cy = base - (s.h - rise) * U * cp;
        var R = s.r * U;
        var pts = outline(s, cx, cy, R, sp, yawR);
        if (fill > 0) {
          ctx.globalAlpha = vis * fill;
          var g = ctx.createRadialGradient(cx - 0.12 * R, cy - 0.2 * R * sp, 0, cx, cy, R * 1.02);
          g.addColorStop(0, s.c1); g.addColorStop(0.34, s.c1); g.addColorStop(1, s.c2);
          ctx.fillStyle = g; trace(pts); ctx.fill();
        }
        var wire = vis * (1 - fill) * 0.8;
        if (wire > 0.01) {
          ctx.globalAlpha = 1;
          ctx.strokeStyle = "rgba(170,208,175," + wire.toFixed(3) + ")";
          trace(pts); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      // sesame seeds, sitting on the dome's curve and turning with it
      var seedA = clamp01((t * (N + 1.5) - 0) / 1.5) * clamp01((m * (N + 1.5) - (N - 1)) / 1.5);
      if (seedA > 0.01) {
        ctx.fillStyle = "rgba(243,231,198," + (0.95 * seedA).toFixed(3) + ")";
        for (var k = 0; k < SEEDS.length; k++) {
          var lx = (SEEDS[k][0] - 50) / 50 * 30, ly = (SEEDS[k][1] - 50) / 50 * 30;   // seed spot, in u
          var rho = Math.sqrt(lx * lx + ly * ly);
          if (rho >= DOME_R) continue;
          var zz = DOME_H * Math.sqrt(Math.max(0, 1 - (rho / DOME_R) * (rho / DOME_R)));
          var ang = Math.atan2(ly, lx) + yawR;
          var px = cx + Math.cos(ang) * rho * U, py = base - (DOME_BASE + zz) * U * cp + Math.sin(ang) * rho * U * sp;
          if (Math.sin(ang) < -0.2 && rho > 24) continue;   // the far rim is hidden behind the curve
          ctx.save();
          ctx.translate(px, py); ctx.rotate(ang * 0.6 + k);
          ctx.beginPath(); ctx.ellipse(0, 0, 1.05 * U, 0.55 * U * (0.6 + sp), 0, 0, TAU); ctx.fill();
          ctx.restore();
        }
      }
    }

    function set(o) {
      var changed = false;
      for (var k in o) if (o[k] != null && st[k] !== o[k]) { st[k] = o[k]; changed = true; }
      if (changed) dirty = true;
    }

    function interactive(on) {
      if (!on) return;
      root.tabIndex = 0;
      root.setAttribute("data-cursor", "");
      root.addEventListener("pointerdown", function (e) {
        dragging = true; lastX = e.clientX; vel = 0;
        try { root.setPointerCapture(e.pointerId); } catch (err) {}
      });
      root.addEventListener("pointermove", function (e) {
        if (!dragging) return;
        var dx = e.clientX - lastX; lastX = e.clientX;
        dragYaw += dx * 0.6; vel = dx * 0.6; dirty = true;
      });
      function up() { dragging = false; }
      root.addEventListener("pointerup", up);
      root.addEventListener("pointercancel", up);
      root.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { dragYaw -= 12; dirty = true; e.preventDefault(); }
        if (e.key === "ArrowRight") { dragYaw += 12; dirty = true; e.preventDefault(); }
      });
    }

    function spin(rate) { spinRate = reduce ? 0 : rate || 0; }

    if (global.IntersectionObserver) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) dirty = true; }).observe(root);
    if (global.ResizeObserver) new ResizeObserver(measure).observe(host);
    else addEventListener("resize", measure);
    measure();

    (function loop(now) {
      requestAnimationFrame(loop);
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!visible || paused) return;
      if (!dragging && Math.abs(vel) > 0.02) { dragYaw += vel; vel *= 0.93; dirty = true; }
      if (spinRate) { spinYaw += spinRate * dt; dirty = true; }
      if (dirty && W > 1) draw();
    })(last);

    // pause(true) stops all drawing, e.g. while the dish sits in a faded-out beat
    function pause(b) { b = !!b; if (b !== paused) { paused = b; if (!b) dirty = true; } }

    return { set: set, interactive: interactive, spin: spin, pause: pause, el: root, state: st };
  }

  /* The "photo" a restaurant owner would upload: the same dish drawn flat, side
     on, on a warm blurred background. Clearly an illustration, used as the
     sample input to the pipeline. */
  function photoSVG() {
    return '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sample photo of a smash burger">' +
      '<defs><radialGradient id="pbg" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#3a322a"/><stop offset="1" stop-color="#171513"/></radialGradient>' +
      '<linearGradient id="pbun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3a866"/><stop offset="1" stop-color="#a8652d"/></linearGradient>' +
      '<linearGradient id="pbot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c98b4d"/><stop offset="1" stop-color="#8f5424"/></linearGradient>' +
      '<filter id="pbk"><feGaussianBlur stdDeviation="9"/></filter></defs>' +
      '<rect width="400" height="300" fill="url(#pbg)"/>' +
      '<g filter="url(#pbk)" opacity=".55"><circle cx="60" cy="70" r="16" fill="#f0b76a"/><circle cx="330" cy="54" r="12" fill="#f5c27a"/><circle cx="300" cy="110" r="9" fill="#e9a55a"/><circle cx="96" cy="128" r="8" fill="#e8b070"/></g>' +
      '<ellipse cx="200" cy="252" rx="130" ry="16" fill="#000" opacity=".45"/>' +
      '<path d="M96 222 Q96 250 124 252 L276 252 Q304 250 304 222 Z" fill="url(#pbot)"/>' +
      '<rect x="92" y="200" width="216" height="26" rx="12" fill="#4a2b1e"/>' +
      '<path d="M100 198 L300 198 L292 214 L276 206 L262 222 L246 206 L150 206 L136 220 L122 206 L108 214 Z" fill="#e5ab3f"/>' +
      '<rect x="104" y="188" width="192" height="12" rx="6" fill="#c3533b"/>' +
      '<path d="M86 186 q10 -10 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 l0 6 L86 192 Z" fill="#8fb466"/>' +
      '<path d="M94 184 Q96 100 200 98 Q304 100 306 184 Z" fill="url(#pbun)"/>' +
      '<g fill="#f3e7c6"><ellipse cx="170" cy="124" rx="5" ry="2.6" transform="rotate(-20 170 124)"/><ellipse cx="206" cy="116" rx="5" ry="2.6" transform="rotate(10 206 116)"/><ellipse cx="236" cy="130" rx="5" ry="2.6" transform="rotate(28 236 130)"/><ellipse cx="146" cy="146" rx="5" ry="2.6" transform="rotate(-35 146 146)"/><ellipse cx="192" cy="140" rx="5" ry="2.6"/><ellipse cx="262" cy="150" rx="5" ry="2.6" transform="rotate(40 262 150)"/></g>' +
      '<path d="M130 128 Q160 108 196 108" stroke="#fff" stroke-opacity=".22" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '</svg>';
  }

  global.DishModel = { create: create, photoSVG: photoSVG };
})(window);
