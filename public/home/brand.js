/* Dish360 brand runtime: the difference-blend cursor, the AR surface ground and
   the glass QR card renderer. Plain JS, no dependencies. design.md §6-§8. */
(function (global) {
  "use strict";

  var reduce = global.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = global.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------------------------------------------------------------- cursor
     One 50px white disc, mix-blend-mode difference, scaled 0.3 -> 1 over
     anything interactive. Delegated, so content added later still counts. */
  function cursor() {
    if (!finePointer) return;
    var el = document.createElement("div");
    el.className = "brand-cursor";
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);
    document.documentElement.classList.add("has-brand-cursor");
    var SEL = "a, button, input, select, textarea, label, summary, [role='button'], [data-cursor]";
    addEventListener("mousemove", function (e) {
      el.style.translate = e.clientX + "px " + e.clientY + "px";
      el.classList.add("is-on");
    }, { passive: true });
    document.addEventListener("mouseout", function (e) { if (!e.relatedTarget) el.classList.remove("is-on"); });
    document.addEventListener("mouseover", function (e) {
      el.classList.toggle("is-link", !!(e.target.closest && e.target.closest(SEL)));
    });
    addEventListener("mousedown", function () { el.classList.add("is-down"); });
    addEventListener("mouseup", function () { el.classList.remove("is-down"); });
  }

  /* ------------------------------------------------------------ AR surface
     The ground is what an AR camera sees when it finds a table: a perspective
     plane of dots that is "detected" outward from its centre, under a soft pool
     of sage light. `detect` (0..1, a number or a function read every frame)
     is how much of the table has been found, so each page ties its ground to
     its own story. Scroll glides the plane toward the viewer. Reduced motion:
     no drift, no shimmer, detection jumps straight to its value. */
  function surface(canvas, opts) {
    opts = opts || {};
    var ctx = canvas.getContext("2d");
    // A soft dot field gains nothing from full retina density; 1.25x keeps it
    // crisp enough and cuts the pixels to redraw by more than half.
    var dpr = Math.min(global.devicePixelRatio || 1, opts.dpr || 1.25);
    var w = 0, h = 0, local = !!opts.local;
    var horizon = opts.horizon == null ? 0.56 : opts.horizon;
    var glow = opts.glow == null ? 1 : opts.glow;
    var cur = scrollY, target = scrollY, shown = 0, t0 = performance.now();
    var SP = 0.46, ZC = 4.6, ROWS = 44, LEVELS = 12;
    var visible = true, lastDraw = 0, dirty = true;

    function size() {
      var r = local ? canvas.getBoundingClientRect() : { width: innerWidth, height: innerHeight };
      w = Math.max(1, Math.round(r.width)); h = Math.max(1, Math.round(r.height));
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dirty = true;
    }
    size();
    if (global.ResizeObserver && local) new ResizeObserver(size).observe(canvas);
    else addEventListener("resize", size, { passive: true });
    addEventListener("scroll", function () { target = scrollY; }, { passive: true });
    // Nothing is drawn while the canvas is off screen.
    if (global.IntersectionObserver) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; dirty = true; }).observe(canvas);

    // Dots and mesh lines are grouped by opacity level and drawn in one call
    // per level: about two dozen draw calls a frame instead of thousands.
    var dotB = [], lineB = [];
    function bucket(a) { return Math.max(0, Math.min(LEVELS - 1, Math.round(a * (LEVELS - 1)))); }

    function frame(now) {
      requestAnimationFrame(frame);
      var moving = Math.abs(target - cur) > 0.3;
      cur += (target - cur) * 0.08;
      if (!moving) cur = target;
      var want = typeof opts.detect === "function" ? opts.detect() : (opts.detect == null ? 1 : opts.detect);
      var settling = Math.abs(want - shown) > 0.002;
      shown += (want - shown) * (reduce ? 1 : 0.06);
      if (!visible) return;
      // When nothing moves, redraw at ~20fps for the shimmer (or not at all
      // under reduced motion) instead of every frame.
      if (!moving && !settling && !dirty && (reduce || now - lastDraw < 50)) return;
      lastDraw = now; dirty = false;

      var t = reduce ? 0 : (now - t0) / 1000;
      var cxF = typeof opts.cx === "function" ? opts.cx() : (opts.cx == null ? 0.5 : opts.cx);
      var y0 = h * horizon, cx = w * cxF, f = Math.max(h - y0, 1) * 1.15;
      ctx.clearRect(0, 0, w, h);

      // the pool of light the dish will sit in
      var py = y0 + f / ZC, pr = Math.max(w, h) * 0.42;
      var g = ctx.createRadialGradient(cx, py, 0, cx, py, pr);
      g.addColorStop(0, "rgba(170,208,175," + (0.2 * glow * (0.35 + 0.65 * shown)).toFixed(3) + ")");
      g.addColorStop(0.55, "rgba(170,208,175," + (0.05 * glow).toFixed(3) + ")");
      g.addColorStop(1, "rgba(170,208,175,0)");
      ctx.save();
      ctx.translate(cx, py); ctx.scale(1, 0.32); ctx.translate(-cx, -py);
      ctx.fillStyle = g; ctx.fillRect(cx - pr, py - pr, pr * 2, pr * 2);
      ctx.restore();

      // the plane: a world grid, detected from the centre outward. Detected
      // cells are joined by faint mesh lines, the way an AR camera draws a
      // table it has found; undetected space is a sparse field of dots.
      for (var k = 0; k < LEVELS; k++) { dotB[k] = new Path2D(); lineB[k] = new Path2D(); }
      var drift = reduce ? 0 : (cur * 0.0016) % SP;
      var shift = Math.floor((cur * 0.0016) / SP);
      var R = 0.6 + shown * 8;
      var scale = Math.min(1.4, Math.max(0.75, h / 800));
      var prev = null;
      for (var zi = 0; zi < ROWS; zi++) {
        var z = 1.1 + zi * SP - drift;
        var sy = y0 + f / z;
        if (z < 0.9) { prev = null; continue; }
        var fade = Math.min(1, (sy - y0) / (h * 0.1));
        var xn = Math.ceil(Math.min((cx + 40) * z / f, 20) / SP);
        var rad = Math.max(0.7, (3.1 / z) * scale);
        var row = {};
        for (var xi = -xn; xi <= xn; xi++) {
          var x = xi * SP, sx = cx + (x * f) / z;
          var dz = z - ZC, d = Math.sqrt(x * x + dz * dz);
          var det = Math.max(0, Math.min(1, (R - d) / 1.2));
          var front = shown < 0.995 ? Math.max(0, 1 - Math.abs(R - d) / 0.55) : 0;
          var mesh = det * fade;
          row[xi] = [sx, sy, mesh];
          if (sy > h + 4 || sx < -8 || sx > w + 8) continue;
          if (mesh > 0.08) {
            var L = lineB[bucket(mesh)];
            var r0 = row[xi - 1];
            if (r0 && r0[2] > 0.08) { L.moveTo(r0[0], r0[1]); L.lineTo(sx, sy); }
            var p0 = prev && prev[xi];
            if (p0 && p0[2] > 0.08) { L.moveTo(p0[0], p0[1]); L.lineTo(sx, sy); }
          }
          var tw = reduce ? 0 : Math.sin(t * 1.4 + xi * 1.7 + (zi + shift) * 2.3) * 0.1;
          var a = Math.min(0.85, (0.07 + det * (0.5 + tw) + front * 0.5) * fade);
          if (a < 0.015) continue;
          var D = dotB[bucket(a / 0.85)];
          if (rad > 1.3) { D.moveTo(sx + rad, sy); D.arc(sx, sy, rad, 0, 6.2832); }
          else D.rect(sx - rad, sy - rad, rad * 2, rad * 2);
        }
        prev = row;
      }
      ctx.lineWidth = 1;
      for (var q = 1; q < LEVELS; q++) {
        var lv = q / (LEVELS - 1);
        ctx.strokeStyle = "rgba(170,208,175," + (0.13 * lv).toFixed(3) + ")";
        ctx.stroke(lineB[q]);
        ctx.fillStyle = "rgba(170,208,175," + (0.85 * lv).toFixed(3) + ")";
        ctx.fill(dotB[q]);
      }
    }
    requestAnimationFrame(frame);
    return { get detected() { return shown; } };
  }

  /* --------------------------------------------------------- QR card render
     Paints a real QR (DishQR) into a card's well as SVG rects, sage on glass.
     `reveal` (0..1) wipes it in column by column for scroll-driven builds. */
  function qrWell(well, text) {
    var q = global.DishQR.cells(text), n = q.size, pad = 0;
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", (-pad) + " " + (-pad) + " " + (n + pad * 2) + " " + (n + pad * 2));
    svg.setAttribute("shape-rendering", "crispEdges");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "QR code linking to " + text);
    var cols = [];
    for (var x = 0; x < n; x++) { var gcol = document.createElementNS(ns, "g"); cols.push(gcol); svg.appendChild(gcol); }
    for (var y = 0; y < n; y++) for (var xx = 0; xx < n; xx++) {
      var r = document.createElementNS(ns, "rect");
      r.setAttribute("x", xx + 0.06); r.setAttribute("y", y + 0.06);
      r.setAttribute("width", 0.88); r.setAttribute("height", 0.88); r.setAttribute("rx", 0.12);
      r.setAttribute("class", q.matrix[y][xx] ? "qr-on" : "qr-off");
      cols[xx].appendChild(r);
    }
    well.innerHTML = "";
    well.appendChild(svg);
    return {
      size: n,
      reveal: function (p) {
        for (var i = 0; i < n; i++) {
          var local = Math.max(0, Math.min(1, p * (n + 6) / 6 - i / 6));
          cols[i].style.opacity = local.toFixed(3);
        }
      }
    };
  }

  /* A standard dark-on-light PNG of the same code, for printing. */
  function qrPng(text, px) {
    var c = document.createElement("canvas");
    c.width = c.height = px || 1024;
    global.DishQR.draw(c, text, { dark: "#131313", light: "#ffffff", quiet: 4 });
    return c.toDataURL("image/png");
  }

  function download(href, name) {
    var a = document.createElement("a");
    a.href = href; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
  }

  global.Brand = { cursor: cursor, surface: surface, qrWell: qrWell, qrPng: qrPng, download: download, reduce: reduce, fine: finePointer };
})(window);
