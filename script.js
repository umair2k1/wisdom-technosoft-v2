(function () {
  "use strict";
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  var navTimer;
  function handleNav(dy) {
    if (dy > 1 && window.scrollY > 320) {
      nav.classList.add("hide");
      clearTimeout(navTimer);
      navTimer = setTimeout(function () { nav.classList.remove("hide"); }, 600);
    } else if (dy < -1) {
      nav.classList.remove("hide");
      clearTimeout(navTimer);
    }
  }
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var sm = function (t) { return t * t * (3 - 2 * t); };
  var rgb = function (h) { return [1, 3, 5].map(function (i) { return parseInt(h.slice(i, i + 2), 16); }); };
  var hex = function (n) { return ("0" + n.toString(16)).slice(-2); };
  var mix = function (a, b, t) {
    var A = rgb(a), B = rgb(b);
    return "#" + A.map(function (v, i) { return hex(Math.round(lerp(v, B[i], t))); }).join("");
  };

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var wide = window.matchMedia("(min-width: 900px)");
  var H = window.innerHeight;

  var orb = $(".orb"), orbSvg = $(".orb svg"), orbRing = $(".o-ring");
  var bar = $(".bar i"), chap = $("#chap"), nav = $("#nav");
  var sv = $("#services"), track = $(".track"), panels = $$(".panel"), words = $$(".pword"), dots = $$(".dot");
  var heroLines = $$(".hl"), cards = $$(".card"), cardBox = $(".cards");
  var trs = $$(".tr"), strip = $("#strip");
  var vscroll = $(".vscroll"), vring = $(".vring");
  var rows = $$(".row");

  // Chapters: the fixed mark moves, scales, spreads and recolours between these states.
  var S = [
    { id: "top",      n: "Welcome",       x: 22, y: -2, s: 1,    o: 1,   sp: 0,  c: "#C9A27E" },
    { id: "services", n: "What we do",    x: 34, y: 26, s: 0.42, o: 1,   sp: 0.6, c: "#7FB0D0" },
    { id: "approach", n: "How we deliver", x: 0,  y: 0,  s: 1.7,  o: 0.13, sp: 0.2, c: "#C9A27E" },
    { id: "strip",    n: "At a glance",      x: 0,  y: 0,  s: 0.6,  o: 0,   sp: 0,  c: "#C9A27E" },
    { id: "vision",   n: "Vision",        x: 0,  y: 0,  s: 0.5,  o: 1,   sp: 0.7, c: "#C9A27E" },
    { id: "team",     n: "Team",          x: -36, y: 24, s: 0.35, o: 0.5, sp: 0.3, c: "#6E8FA8" },
    { id: "contact",  n: "Contact",       x: -29, y: 20, s: 0.62, o: 1,   sp: 0,  c: "#C9A27E" }
  ];
  var PC = ["#7FB0D0", "#D9B48F", "#8FD1B5", "#C9A27E", "#A8C0D8"];
  var PANEL_NAMES = ["Software", "Telecalling", "Data", "Business process", "Healthcare"];
  var els = S.map(function (s) { return document.getElementById(s.id); });
  var tops = [];

  var brandLogo = $(".brand-logo");
  var header_x = -44, header_y = -46, header_s = 0.11;

  // Size the vision-ring text so it spans the circle exactly, whatever font is loaded
  var ringText = $(".vring text");
  function fitRing() {
    if (!ringText || !ringText.getComputedTextLength) return;
    ringText.style.fontSize = "38px";
    var len = ringText.getComputedTextLength();
    if (len > 0) ringText.style.fontSize = (38 * 1064 / len).toFixed(2) + "px";
  }

  var M = {};
  function measure() {
    fitRing();
    H = window.innerHeight;
    var W = window.innerWidth;
    tops = els.map(function (e) { return e.getBoundingClientRect().top + window.scrollY; });

    if (cardBox) {
      M.cardsTop = cardBox.getBoundingClientRect().top + window.scrollY;
    }
    M.rowTops = rows.map(function (r) {
      return r.getBoundingClientRect().top + window.scrollY;
    });

    if (brandLogo) {
      var rect = brandLogo.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = (nav.classList.contains("hide") ? 36 : rect.top + rect.height / 2);
      header_x = ((cx - W / 2) / W) * 100;
      header_y = ((cy - H / 2) / H) * 100;
      var orbBase = Math.min(0.62 * Math.min(W, H), 640);
      var imgBaseHeight = orbBase * (162.5 / 300);
      header_s = rect.height / (imgBaseHeight || 1);
    }
  }

  var pinOn = false;
  function setMode() {
    pinOn = wide.matches && !reduce.matches;
    sv.classList.toggle("is-pin", pinOn);
    if (!pinOn) {
      track.style.transform = "";
      track.style.removeProperty("--track");
      words.forEach(function (w) { w.style.transform = ""; });
    }
    measure();
    update(cur, 0);
  }

  var target = window.scrollY, cur = target, prev = cur, raf = 0, lastT = target, lastChap = "";

  function update(y, v) {
    var d = target - y;
    var narrow = window.innerWidth < 760;
    var rm = reduce.matches;
    var introDist = Math.min(H * 0.45, 380);

    var curX, curY, curS, curO, ringOp, tiltY = 0, tiltZ = 0, ringRot = 0, sp = 0, col = S[0].c;
    var activeChapter = 0;
    var p = clamp((y - tops[1]) / Math.max(1, sv.offsetHeight - H));
    var f = p * (panels.length - 1);

    chap.style.opacity = y > introDist ? 1 : 0;
    if (y <= introDist) {
      activeChapter = 0;
      var t = sm(clamp(y / introDist));
      var handoff = y <= 0.5 ? 0 : clamp(y / 25, 0, 1);
      curX = lerp(header_x, S[0].x * (narrow ? 0.45 : 1), t);
      curY = lerp(header_y, S[0].y, t);
      curS = lerp(header_s, S[0].s, t);
      curO = handoff;
      ringOp = 0.7 * sm(clamp((t - 0.2) / 0.8));
      if (brandLogo) brandLogo.style.opacity = (1 - handoff).toFixed(3);
      tiltY = lerp(0, 15, Math.sin(t * Math.PI));
      tiltZ = lerp(0, -6, Math.sin(t * Math.PI));
      ringRot = -y * 0.12 * t;
      col = S[0].c;
    } else {
      if (brandLogo) brandLogo.style.opacity = clamp((y - introDist) / 80).toFixed(3);
      ringOp = 0.7;

      if (y < tops[1]) {
        activeChapter = 0;
        var t_serv = sm(clamp((y - introDist) / Math.max(1, tops[1] - introDist)));
        curX = lerp(S[0].x * (narrow ? 0.45 : 1), S[1].x * (narrow ? 0.45 : 1), t_serv);
        curY = lerp(S[0].y, S[1].y, t_serv);
        curS = lerp(S[0].s, S[1].s, t_serv);
        curO = lerp(S[0].o, S[1].o, t_serv) * (narrow ? 0.6 : 1);
        sp = lerp(S[0].sp, S[1].sp, t_serv);
        col = mix(S[0].c, S[1].c, t_serv);
      } else {
        var m = y + H * 0.5;
        var i = 1, k;
        for (k = 1; k < S.length; k++) if (m >= tops[k]) i = k;
        activeChapter = i;
        var j = Math.min(i + 1, S.length - 1);
        var a = S[i], b = S[j];
        var t = a === b ? 0 : sm(clamp((m - (tops[j] - H * 0.9)) / (H * 0.9)));

        // While the services track is pinned, its progress drives the mark's colour and spread
        var ca = a.c, sa = a.sp;
        if (i === 1 && pinOn) {
          var ci = Math.min(Math.floor(f), PC.length - 2);
          ca = mix(PC[ci], PC[ci + 1], f - ci);
          sa = 0.6 + p * 1.4;

          var pi = Math.round(clamp(f, 0, panels.length - 1));
          if (PANEL_NAMES[pi] !== lastChap) {
            lastChap = PANEL_NAMES[pi];
            chap.textContent = lastChap;
          }
        }

        curX = lerp(a.x, b.x, t) * (narrow ? 0.45 : 1);
        curY = lerp(a.y, b.y, t);
        curS = lerp(a.s, b.s, t);
        curO = lerp(a.o, b.o, t) * (narrow ? 0.6 : 1);
        sp = lerp(sa, b.sp, t);
        col = mix(ca, b.c, t);
      }

      var relY = y - introDist;
      tiltY = relY * 0.18;
      tiltZ = relY * 0.05;
      ringRot = -y * 0.12;

      // Ease to the nearest upright pose (a multiple of 360deg) on the way into Contact,
      // instead of unwinding every accumulated turn at once
      if (tops[6]) {
        var y0 = tops[6] - H * 0.8, cp = sm(clamp((y - y0) / (H * 0.7)));
        var up = function (v) { return Math.round(v / 360) * 360; };
        tiltY = lerp(tiltY, up((y0 - introDist) * 0.18), cp);
        tiltZ = lerp(tiltZ, up((y0 - introDist) * 0.05), cp);
        ringRot = lerp(ringRot, up(-y0 * 0.12), cp);
      }
    }

    orb.style.transform = "translate3d(" + curX.toFixed(2) + "vw," + curY.toFixed(2) + "vh,0) scale(" + curS.toFixed(3) + ")";
    orb.style.opacity = curO.toFixed(3);
    orb.style.setProperty("--sp", sp.toFixed(3));
    orb.style.setProperty("--ac", col);
    if (orbRing) orbRing.style.opacity = ringOp.toFixed(3);

    if (orbSvg) orbSvg.style.transform = rm ? "" : "rotateY(" + tiltY.toFixed(1) + "deg) rotateZ(" + tiltZ.toFixed(1) + "deg)";
    if (orbRing) orbRing.style.transform = rm ? "" : "rotate(" + ringRot.toFixed(1) + "deg)";

    var total = document.documentElement.scrollHeight - H;
    bar.style.transform = "scaleY(" + (total > 0 ? clamp(y / total) : 0).toFixed(4) + ")";
    if (activeChapter !== 1) {
      if (S[activeChapter].n !== lastChap) {
        lastChap = S[activeChapter].n;
        chap.textContent = lastChap;
      }
    }

    var dy = target - lastT;
    lastT = target;
    if (Math.abs(dy) > 1) handleNav(dy);
    if (rm) return;

    // Hero lines slide apart
    if (y < H * 1.4) heroLines.forEach(function (el) {
      el.style.transform = "translate3d(" + (el.getAttribute("data-d") * y * 0.3).toFixed(1) + "px,0,0)";
    });

    // Services track + parallax words + tabs
    if (pinOn) {
      track.style.setProperty("--track", f.toFixed(3));
      words.forEach(function (w, n) { w.style.transform = "translate3d(" + ((f - n) * -16).toFixed(2) + "vw,0,0)"; });
      dots.forEach(function (dt, n) { dt.classList.toggle("is-on", n === Math.round(f)); });
    }

    // Principle cards tilt up into place
    var Rtop = M.cardsTop - y;
    cards.forEach(function (c, n) {
      var e = sm(clamp((H - Rtop - n * H * 0.06) / (H * 0.5)));
      c.style.transform = "translate3d(0," + ((1 - e) * 90).toFixed(1) + "px,0) rotateX(" + ((1 - e) * 55).toFixed(1) + "deg) rotateZ(" + ((1 - e) * (n % 2 ? 4 : -4)).toFixed(2) + "deg)";
      c.style.opacity = (0.15 + 0.85 * e).toFixed(3);
    });

    // Strip scrolls sideways and skews with scroll speed
    var rel = y - (tops[3] - H);
    var sk = clamp(v * -0.3, -14, 14);
    trs.forEach(function (tr) {
      var dir = Number(tr.getAttribute("data-s"));
      tr.style.transform = "translate3d(" + (-dir * rel * 0.6).toFixed(1) + "px,0,0) skewX(" + sk.toFixed(2) + "deg)";
    });

    // Vision ring turns
    var vp = clamp((y - tops[4]) / Math.max(1, vscroll.offsetHeight - H));
    vring.style.transform = "rotate(" + (vp * 540).toFixed(1) + "deg) scale(" + (0.82 + 0.18 * vp).toFixed(3) + ")";

    // Team rows slide in from alternating sides
    rows.forEach(function (r, n) {
      var rcTop = M.rowTops[n] - y;
      var e = sm(clamp((H * 0.95 - rcTop) / (H * 0.4)));
      var nm = r.firstElementChild;
      nm.style.transform = "translate3d(" + ((1 - e) * (n % 2 ? 1 : -1) * 160).toFixed(1) + "px,0,0)";
      r.style.opacity = e.toFixed(3);
    });
  }

  var prevNow = performance.now();
  function tick() {
    var now = performance.now();
    var dt = Math.min(64, now - prevNow);
    prevNow = now;
    var k = reduce.matches ? 1 : 1 - Math.exp(-dt / 90);
    cur = lerp(cur, target, k);
    if (Math.abs(target - cur) < 0.5) cur = target;
    update(cur, cur - prev);
    prev = cur;
    raf = cur !== target ? requestAnimationFrame(tick) : 0;
  }
  window.addEventListener("scroll", function () {
    target = window.scrollY;
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });
  var resizeRaf = 0;
  window.addEventListener("resize", function () {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(function () { resizeRaf = 0; setMode(); });
  }, { passive: true });
  window.addEventListener("load", function () { measure(); update(cur, 0); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); update(cur, 0); });
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) { measure(); update(cur, 0); }
  });
  if (wide.addEventListener) { wide.addEventListener("change", setMode); reduce.addEventListener("change", setMode); }

  setMode();
  var ready = function () { document.body.classList.add("ready"); };
  setTimeout(ready, 1000);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(ready, 60); });

  // Contact form
  var form = $("#cform"), send = $("#send"), status = $("#status");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fd = new FormData(form), data = {};
    ["name", "email", "phone", "service", "message", "website_url"].forEach(function (n) { data[n] = String(fd.get(n) || "").trim(); });
    if (data.website_url) { status.className = "status ok"; status.textContent = "Thank you. We have your message."; form.reset(); return; }
    var label = send.textContent;
    send.disabled = true; send.textContent = "Sending…"; status.className = "status"; status.textContent = "";
    fetch(form.getAttribute("action"), { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.message || "Failed"); return j; }); })
      .then(function () {
        status.className = "status ok";
        status.textContent = "Thank you. We will be in touch shortly.";
        form.reset();
      })
      .catch(function () {
        status.className = "status err";
        status.innerHTML = "We could not send this online. Please email <a href=\"mailto:wisdomtechnosoft04@gmail.com\">wisdomtechnosoft04@gmail.com</a> or call <a href=\"tel:+917447331127\">+91 74473 31127</a>.";
      })
      .then(function () { send.disabled = false; send.textContent = label; });
  });
})();
