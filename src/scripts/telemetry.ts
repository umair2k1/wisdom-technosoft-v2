// Live Nagpur HQ Telemetry & Clock Controller

export function initTelemetry() {
  if (typeof window === "undefined") return;

  // 1. Live Nagpur HQ Clock (Asia/Kolkata)
  const clockEls = document.querySelectorAll(".live-clock");
  const latencyEls = document.querySelectorAll(".live-latency");

  function updateClock() {
    try {
      const now = new Date();
      const istTime = now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Kolkata",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });

      clockEls.forEach((el) => {
        el.textContent = `${istTime} IST`;
      });
    } catch {
      // Fallback
    }
  }

  setInterval(updateClock, 1000);
  updateClock();

  // Dynamic Ping Simulation (16ms to 24ms jitter)
  function updateLatency() {
    const ping = Math.floor(16 + Math.random() * 8);
    latencyEls.forEach((el) => {
      el.textContent = `${ping}ms`;
    });
  }

  setInterval(updateLatency, 3200);
  updateLatency();
}
