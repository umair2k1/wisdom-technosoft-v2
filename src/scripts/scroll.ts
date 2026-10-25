// Wisdom Technosoft — Master Client Interaction & Motion Orchestrator
// Architectural Precision: CSS Scroll-Driven Animations + GSAP ScrollTrigger
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initRealTelemetry } from "./telemetry";

gsap.registerPlugin(ScrollTrigger);

(function initMasterRuntime() {
  if (typeof window === "undefined") return;

  // 1. Initialize Real Telemetry (DOM Paint & RAF FPS)
  initRealTelemetry();

  // 2. Active Section Navigation Tracking & Header State
  const nav = document.getElementById("nav");
  const navLinks = document.querySelectorAll<HTMLAnchorElement>(".nav-link");

  const sections = [
    { id: "top", name: "Welcome" },
    { id: "services", name: "Services" },
    { id: "approach", name: "Approach" },
    { id: "vision", name: "Vision & Ethos" },
    { id: "team", name: "Leadership" },
    { id: "contact", name: "Contact" },
  ];

  const sectionEls = sections.map((s) => ({
    id: s.id,
    name: s.name,
    el: document.getElementById(s.id),
  }));

  function updateNavState() {
    const y = window.scrollY || window.pageYOffset;
    const H = window.innerHeight;

    if (nav) {
      if (y > 30) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    }

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
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  window.addEventListener("scroll", updateNavState, { passive: true });
  updateNavState();

  // 3. Fallback Synchronization for Vernier Caliper Scroll Ruler
  const runner = document.getElementById("vernier-runner");
  const pctReadout = document.getElementById("vernier-pct");

  function updateVernierRuler() {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;
    const progress = Math.min(1, Math.max(0, window.scrollY / scrollHeight));
    const pct = Math.round(progress * 100);

    if (pctReadout) {
      pctReadout.textContent = `${pct < 10 ? "0" + pct : pct}%`;
    }

    // In browsers without CSS scroll-timeline, sync runner transform manually
    if (!CSS.supports("animation-timeline", "scroll()")) {
      if (runner) {
        const minY = 32;
        const maxY = window.innerHeight - 100;
        const curY = minY + progress * (maxY - minY);
        runner.style.transform = `translateY(${curY}px)`;
      }
    }
  }

  window.addEventListener("scroll", updateVernierRuler, { passive: true });
  updateVernierRuler();

  // 4. GSAP Motion Choreography
  const mm = gsap.matchMedia();

  // Global Reduced Motion Check
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    document.body.classList.add("ready");
    return;
  }

  mm.add("(min-width: 901px)", () => {
    // -------------------------------------------------------------------------
    // A. Hero "X-Ray Blueprint" Scrub
    // Peels back the surface layer to reveal the underlying engineering nodes
    // -------------------------------------------------------------------------
    const heroLayerBlueprint = document.getElementById("hero-layer-blueprint");
    const heroStage = document.getElementById("hero-stage");

    if (heroLayerBlueprint && heroStage) {
      gsap.to(heroLayerBlueprint, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        ease: "none",
        scrollTrigger: {
          trigger: heroStage,
          start: "top 30%",
          end: "bottom top",
          scrub: 0.8,
        },
      });
    }

    // -------------------------------------------------------------------------
    // B. Hero-to-Navbar Logo Docking
    // As user scrolls past the hero reticle, scale & dock the hero mark toward nav
    // -------------------------------------------------------------------------
    const heroDockMark = document.getElementById("hero-dock-mark");
    const navDock = document.getElementById("nav-logo-dock");

    if (heroDockMark && navDock) {
      gsap.to(heroDockMark, {
        scale: 0.38,
        opacity: 0,
        y: -120,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: "#top",
          start: "top top",
          end: "+=360",
          scrub: 0.8,
        },
      });
    }

    // -------------------------------------------------------------------------
    // C. Dynamic Scroll Theme Inversion (Blueprint / Engine Room Theme)
    // Inverts theme to Deep Blueprint (#0A0D14) during Services & Approach,
    // then returns to Daylight Alabaster (#F4F1EA) for ContactForm
    // -------------------------------------------------------------------------
    ScrollTrigger.create({
      trigger: "#services",
      start: "top 55%",
      endTrigger: "#approach",
      end: "bottom 30%",
      onEnter: () => {
        document.documentElement.setAttribute("data-theme", "blueprint");
      },
      onLeave: () => {
        document.documentElement.removeAttribute("data-theme");
      },
      onEnterBack: () => {
        document.documentElement.setAttribute("data-theme", "blueprint");
      },
      onLeaveBack: () => {
        document.documentElement.removeAttribute("data-theme");
      },
    });

    // -------------------------------------------------------------------------
    // D. Pinned Horizontal Engineering Pipeline (Approach Section)
    // Vertical scroll drives horizontal panning with animated SVG payload packet
    // -------------------------------------------------------------------------
    const pinStage = document.getElementById("approach-stage-pin");
    const track = document.getElementById("approach-horizontal-track");
    const packet = document.getElementById("payload-packet");
    const fillLine = document.getElementById("bus-fill-line");
    const statusText = document.getElementById("pipeline-status-text");

    const nodes = [
      document.getElementById("node-1"),
      document.getElementById("node-2"),
      document.getElementById("node-3"),
      document.getElementById("node-4"),
    ];

    const stageDescriptions = [
      "STAGE 01 // DISCOVERY & CONSTRAINTS",
      "STAGE 02 // MILESTONES & RIGOR",
      "STAGE 03 // CLOUD-NATIVE AUTOMATION",
      "STAGE 04 // 24/7/365 SCALE LOCKED",
    ];

    if (pinStage && track) {
      const horizontalTl = gsap.timeline({
        scrollTrigger: {
          trigger: pinStage,
          pin: true,
          scrub: 1,
          start: "top 15%",
          end: () => `+=${Math.max(800, track.scrollWidth - track.clientWidth + 200)}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;

            // Move SVG packet along the bus line
            if (packet) {
              const startX = 160;
              const endX = 1360;
              const currentX = startX + p * (endX - startX);
              packet.setAttribute("transform", `translate(${currentX}, 18)`);
            }

            // Expand bus fill line
            if (fillLine) {
              const currentX = 160 + p * (1360 - 160);
              fillLine.setAttribute("x2", String(currentX));
            }

            // Activate step nodes & update status text
            const stageIndex = Math.min(3, Math.floor(p * 4));
            nodes.forEach((n, idx) => {
              if (n) {
                if (idx <= stageIndex) {
                  n.classList.add("active");
                } else {
                  n.classList.remove("active");
                }
              }
            });

            if (statusText) {
              statusText.textContent = stageDescriptions[stageIndex];
            }
          },
        },
      });

      horizontalTl.to(track, {
        x: () => -(track.scrollWidth - track.clientWidth + 60),
        ease: "none",
      });
    }
  });

  // Mobile fallback: No pinning, just theme triggering
  mm.add("(max-width: 900px)", () => {
    ScrollTrigger.create({
      trigger: "#services",
      start: "top 60%",
      endTrigger: "#approach",
      end: "bottom 30%",
      onEnter: () => document.documentElement.setAttribute("data-theme", "blueprint"),
      onLeave: () => document.documentElement.removeAttribute("data-theme"),
      onEnterBack: () => document.documentElement.setAttribute("data-theme", "blueprint"),
      onLeaveBack: () => document.documentElement.removeAttribute("data-theme"),
    });
  });

  // Mark body ready
  document.body.classList.add("ready");
})();
