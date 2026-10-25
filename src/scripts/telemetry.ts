// Real Client Telemetry & Performance Instrumentation
// Zero fake latency. Real performance.now() timing and live RAF frame rates.

export function initRealTelemetry() {
  if (typeof window === "undefined") return;

  // 1. Real DOM Paint & Load Timing
  function measurePaint() {
    let paintTime = 0;
    const navEntries = performance.getEntriesByType("navigation");
    if (navEntries.length > 0) {
      const navEntry = navEntries[0] as PerformanceNavigationTiming;
      paintTime = Math.round(navEntry.domContentLoadedEventEnd || performance.now());
    } else {
      paintTime = Math.round(performance.now());
    }

    const paintEls = document.querySelectorAll(".real-paint-stat");
    paintEls.forEach((el) => {
      el.textContent = `${paintTime}ms`;
    });
  }

  // 2. Real Live RAF FPS Meter
  let lastTime = performance.now();
  let frameCount = 0;
  let currentFps = 60;
  const fpsEls = document.querySelectorAll(".real-fps-stat");

  function calcFps(now: number) {
    frameCount++;
    const delta = now - lastTime;
    if (delta >= 1000) {
      currentFps = Math.round((frameCount * 1000) / delta);
      frameCount = 0;
      lastTime = now;
      fpsEls.forEach((el) => {
        el.textContent = `${Math.min(currentFps, 120)} FPS`;
      });
    }
    requestAnimationFrame(calcFps);
  }

  requestAnimationFrame(calcFps);

  // 3. Real Nagpur Local Time (Asia/Kolkata)
  const clockEls = document.querySelectorAll(".live-clock");
  function updateClock() {
    try {
      const now = new Date();
      const ist = now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Kolkata",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      clockEls.forEach((el) => {
        el.textContent = `${ist} IST`;
      });
    } catch {
      // Fallback
    }
  }

  setInterval(updateClock, 1000);
  updateClock();

  if (document.readyState === "complete") {
    measurePaint();
  } else {
    window.addEventListener("load", measurePaint);
  }
}

// Backward compatibility alias for any existing caller
export const initTelemetry = initRealTelemetry;
