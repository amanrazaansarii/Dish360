/* Dish360 QR: a small, real QR Code encoder (byte mode, ECC level L,
   versions 1 to 5, single block). Enough for a short URL, and it produces a
   genuinely scannable code, which is the point: the glass QR card on these
   pages is not a picture of a QR, it is one.

   DishQR.matrix(text) -> boolean[size][size]   (true = dark module)
   DishQR.draw(canvas, text, { dark, light, quiet })
   DishQR.cells(text) -> { size, dark: [[x, y], ...] }  (for DOM/SVG renders)

   Structure follows the ISO/IEC 18004 layout as written up in Nayuki's
   reference implementation. Mask 0 is used for every code; any mask is valid
   for a decoder. */
(function (global) {
  "use strict";

  // Data / EC codewords for ECC level L, one block each, versions 1..5.
  var L_DATA = [0, 19, 34, 55, 80, 108];
  var L_EC = [0, 7, 10, 15, 20, 26];

  function gfMul(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11d);
      z ^= ((y >>> i) & 1) * x;
    }
    return z & 0xff;
  }

  function rsDivisor(degree) {
    var r = [];
    for (var i = 0; i < degree - 1; i++) r.push(0);
    r.push(1);
    var root = 1;
    for (var k = 0; k < degree; k++) {
      for (var j = 0; j < r.length; j++) {
        r[j] = gfMul(r[j], root);
        if (j + 1 < r.length) r[j] ^= r[j + 1];
      }
      root = gfMul(root, 0x02);
    }
    return r;
  }

  function rsRemainder(data, divisor) {
    var r = divisor.map(function () { return 0; });
    data.forEach(function (b) {
      var factor = b ^ r.shift();
      r.push(0);
      divisor.forEach(function (coef, i) { r[i] ^= gfMul(coef, factor); });
    });
    return r;
  }

  function utf8(text) {
    var out = [];
    var s = unescape(encodeURIComponent(text));
    for (var i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
    return out;
  }

  function matrix(text) {
    var bytes = utf8(text);
    var ver = 0;
    for (var v = 1; v <= 5; v++) {
      if (4 + 8 + bytes.length * 8 <= L_DATA[v] * 8) { ver = v; break; }
    }
    if (!ver) throw new Error("DishQR: text too long for versions 1-5 (max 106 bytes)");

    // ---- data bits: mode, count, payload, terminator, pad
    var bits = [];
    function put(val, len) { for (var i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); }
    put(0x4, 4);
    put(bytes.length, 8);
    bytes.forEach(function (b) { put(b, 8); });
    var cap = L_DATA[ver] * 8;
    put(0, Math.min(4, cap - bits.length));
    while (bits.length % 8) bits.push(0);
    var data = [];
    for (var i = 0; i < bits.length; i += 8) {
      var byte = 0;
      for (var j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
      data.push(byte);
    }
    for (var pad = 0xec; data.length < L_DATA[ver]; pad ^= 0xec ^ 0x11) data.push(pad);
    var codewords = data.concat(rsRemainder(data, rsDivisor(L_EC[ver])));

    // ---- function patterns
    var size = ver * 4 + 17;
    var mod = [], fn = [];
    for (var y = 0; y < size; y++) {
      mod.push(new Array(size).fill(false));
      fn.push(new Array(size).fill(false));
    }
    function setFn(x, y, dark) { mod[y][x] = dark; fn[y][x] = true; }

    for (var t = 0; t < size; t++) { setFn(6, t, t % 2 === 0); setFn(t, 6, t % 2 === 0); }

    function finder(cx, cy) {
      for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
        var d = Math.max(Math.abs(dx), Math.abs(dy)), xx = cx + dx, yy = cy + dy;
        if (xx >= 0 && xx < size && yy >= 0 && yy < size) setFn(xx, yy, d !== 2 && d !== 4);
      }
    }
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);

    if (ver >= 2) {
      var a = size - 7;
      for (var ady = -2; ady <= 2; ady++) for (var adx = -2; adx <= 2; adx++) {
        setFn(a + adx, a + ady, Math.max(Math.abs(adx), Math.abs(ady)) !== 1);
      }
    }

    // Format bits: ECC L = 01, mask 000, BCH(15,5), XOR 0x5412.
    var fdata = (1 << 3) | 0;
    var rem = fdata;
    for (var fi = 0; fi < 10; fi++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    var fbits = ((fdata << 10) | rem) ^ 0x5412;
    function fb(i) { return ((fbits >>> i) & 1) !== 0; }
    for (var f0 = 0; f0 <= 5; f0++) setFn(8, f0, fb(f0));
    setFn(8, 7, fb(6)); setFn(8, 8, fb(7)); setFn(7, 8, fb(8));
    for (var f1 = 9; f1 < 15; f1++) setFn(14 - f1, 8, fb(f1));
    for (var f2 = 0; f2 < 8; f2++) setFn(size - 1 - f2, 8, fb(f2));
    for (var f3 = 8; f3 < 15; f3++) setFn(8, size - 15 + f3, fb(f3));
    setFn(8, size - 8, true);

    // ---- codeword placement, zigzag from the bottom right
    var bi = 0, total = codewords.length * 8;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) {
        for (var k = 0; k < 2; k++) {
          var x = right - k;
          var upward = ((right + 1) & 2) === 0;
          var yy2 = upward ? size - 1 - vert : vert;
          if (!fn[yy2][x] && bi < total) {
            mod[yy2][x] = ((codewords[bi >>> 3] >>> (7 - (bi & 7))) & 1) !== 0;
            bi++;
          }
        }
      }
    }

    // ---- mask 0: invert where (x + y) is even
    for (var my = 0; my < size; my++) for (var mx = 0; mx < size; mx++) {
      if (!fn[my][mx] && (mx + my) % 2 === 0) mod[my][mx] = !mod[my][mx];
    }
    return mod;
  }

  function cells(text) {
    var m = matrix(text), dark = [];
    for (var y = 0; y < m.length; y++) for (var x = 0; x < m.length; x++) if (m[y][x]) dark.push([x, y]);
    return { size: m.length, dark: dark, matrix: m };
  }

  function draw(canvas, text, o) {
    o = o || {};
    var m = matrix(text), n = m.length, quiet = o.quiet == null ? 2 : o.quiet;
    var px = canvas.width / (n + quiet * 2);
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = o.light || "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = o.dark || "#000";
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      if (m[y][x]) ctx.fillRect(Math.floor((x + quiet) * px), Math.floor((y + quiet) * px), Math.ceil(px), Math.ceil(px));
    }
    return m;
  }

  var api = { matrix: matrix, cells: cells, draw: draw };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else global.DishQR = api;
})(typeof window !== "undefined" ? window : globalThis);
