(function() {
  "use strict";
  if (typeof window === "undefined") return;

  var nav = document.getElementById("nav");
  var bar = document.querySelector(".bar i");
  var chap = document.getElementById("chap");
  var orb = document.querySelector(".orb");
  var orbSvg = document.querySelector(".orb svg");
  var navLinks = document.querySelectorAll(".nav-link");

  var sections = [
    { id: "top", name: "Welcome" },
    { id: "services", name: "Services" },
    { id: "approach", name: "Approach" },
    { id: "vision", name: "Vision & Values" },
    { id: "team", name: "Leadership" },
    { id: "contact", name: "Contact" }
  ];

  var sectionEls = sections.map(function(s) {
    return { id: s.id, name: s.name, el: document.getElementById(s.id) };
  });

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ticking = false;

  function update() {
    var y = window.scrollY || window.pageYOffset;
    var H = window.innerHeight;
    var docH = document.documentElement.scrollHeight - H;

    // 1. Header scroll class
    if (nav) {
      if (y > 20) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    }

    // 2. Right-edge scroll progress bar
    if (bar && docH > 0) {
      var progress = Math.min(1, Math.max(0, y / docH));
      bar.style.transform = "scaleY(" + progress.toFixed(4) + ")";
    }

    // 3. Active chapter indicator & nav link highlighting
    var currentName = "Welcome";
    var currentId = "top";
    var scrollMid = y + H * 0.35;

    for (var i = 0; i < sectionEls.length; i++) {
      var item = sectionEls[i];
      if (item.el) {
        var top = item.el.offsetTop;
        if (scrollMid >= top) {
          currentName = item.name;
          currentId = item.id;
        }
      }
    }

    if (chap) {
      chap.textContent = currentName;
      chap.style.opacity = y > 160 ? "0.85" : "0";
    }

    // Highlight desktop nav links
    navLinks.forEach(function(link) {
      var href = link.getAttribute("href") || "";
      if (href === "#" + currentId) {
        link.style.opacity = "1";
        link.style.color = "var(--tan)";
      } else {
        link.style.removeProperty("color");
        link.style.removeProperty("opacity");
      }
    });

    // 4. Subtle ambient orb float
    if (orb && !reduce) {
      var orbY = (y * 0.08) % 100;
      var orbRot = (y * 0.04) % 360;
      orb.style.transform = "translate3d(0, " + orbY.toFixed(1) + "px, 0)";
      orb.style.opacity = "0.15";
      if (orbSvg) {
        orbSvg.style.transform = "rotate(" + orbRot.toFixed(1) + "deg)";
      }
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  // Initial call
  update();

  // Mark body ready
  document.body.classList.add("ready");
})();
