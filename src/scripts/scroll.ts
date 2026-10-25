// Wisdom Technosoft — Master Client Interaction & Engineering Orchestrator
import { initScramble } from "./scramble";
import { initTelemetry } from "./telemetry";

(function initMasterRuntime() {
  if (typeof window === "undefined") return;

  // 1. Initialize Subsystem Engines
  initScramble();
  initTelemetry();

  // 2. Active Section Navigation Tracking
  const nav = document.getElementById("nav");
  const navLinks = document.querySelectorAll<HTMLAnchorElement>(".nav-link");

  const sections = [
    { id: "top", name: "Welcome" },
    { id: "services", name: "Services" },
    { id: "approach", name: "Approach" },
    { id: "vision", name: "Vision & Values" },
    { id: "team", name: "Leadership" },
    { id: "contact", name: "Contact" }
  ];

  const sectionEls = sections.map((s) => ({
    id: s.id,
    name: s.name,
    el: document.getElementById(s.id)
  }));

  let ticking = false;

  function update() {
    const y = window.scrollY || window.pageYOffset;
    const H = window.innerHeight;

    // Header scrolled state
    if (nav) {
      if (y > 20) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    }

    // Active nav link highlighting
    let currentId = "top";
    const scrollMid = y + H * 0.35;

    for (let i = 0; i < sectionEls.length; i++) {
      const item = sectionEls[i];
      if (item.el) {
        const top = item.el.offsetTop;
        if (scrollMid >= top) {
          currentId = item.id;
        }
      }
    }

    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (href === `#${currentId}`) {
        link.style.opacity = "1";
        link.style.color = "var(--tan)";
        link.style.background = "rgba(201, 162, 126, 0.12)";
      } else {
        link.style.removeProperty("color");
        link.style.removeProperty("opacity");
        link.style.removeProperty("background");
      }
    });

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
