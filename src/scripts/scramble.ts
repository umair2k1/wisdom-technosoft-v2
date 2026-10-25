// Kinetic Matrix / Cybernetic Text Scrambler
// Decodes text into original characters with staggered timing on scroll into view and hover.

const UPPER_GLYPHS = "0123456789ABCDEF";
const LOWER_GLYPHS = "0123456789abcdef";
const NUM_GLYPHS = "0123456789";

function getGlyph(c: string): string {
  if (/[a-z]/.test(c)) return LOWER_GLYPHS[Math.floor(Math.random() * LOWER_GLYPHS.length)];
  if (/[A-Z]/.test(c)) return UPPER_GLYPHS[Math.floor(Math.random() * UPPER_GLYPHS.length)];
  if (/[0-9]/.test(c)) return NUM_GLYPHS[Math.floor(Math.random() * NUM_GLYPHS.length)];
  return c;
}

export function initScramble() {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const elements = document.querySelectorAll<HTMLElement>("[data-scramble]");

  elements.forEach((el) => {
    const originalText = el.getAttribute("data-scramble") || el.textContent || "";
    el.setAttribute("data-scramble-orig", originalText);
    let animating = false;

    function scramble() {
      if (animating) return;
      animating = true;

      // Lock element box dimensions to prevent layout shifts/jitter in neighboring content
      const initialHeight = el.getBoundingClientRect().height;
      el.style.minHeight = `${initialHeight}px`;
      el.style.maxHeight = `${initialHeight}px`;

      const chars = originalText.split("");
      const len = chars.length;
      let frame = 0;
      const totalFrames = Math.min(32, Math.max(14, len * 2));

      function step() {
        frame++;
        const progress = frame / totalFrames;
        const revealedCount = Math.floor(progress * len);

        let output = "";
        for (let i = 0; i < len; i++) {
          if (chars[i] === " " || chars[i] === "\n") {
            output += chars[i];
          } else if (i < revealedCount) {
            output += chars[i];
          } else {
            output += getGlyph(chars[i]);
          }
        }

        el.textContent = output;

        if (frame < totalFrames) {
          requestAnimationFrame(step);
        } else {
          el.textContent = originalText;
          el.style.minHeight = "";
          el.style.maxHeight = "";
          animating = false;
        }
      }

      requestAnimationFrame(step);
    }

    // Trigger on hover
    el.addEventListener("mouseenter", scramble);

    // Trigger once on view via IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          scramble();
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(el);
  });
}
