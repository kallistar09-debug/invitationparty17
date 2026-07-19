/* ==========================================================================
   SENN — Sweet Seventeen | countdown.js
   Live countdown to 15 August 2026, 12:40 WIB (UTC+7)
   ========================================================================== */

(function () {
  'use strict';

  /* Event date expressed with an explicit UTC+7 offset so it is correct
     regardless of the guest's own timezone. */
  const EVENT_DATE = new Date('2026-08-15T12:40:00+07:00');

  document.addEventListener('DOMContentLoaded', () => {
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minsEl = document.getElementById('cd-mins');
    const secsEl = document.getElementById('cd-secs');
    const endedEl = document.getElementById('cd-ended-msg');
    const grid = document.getElementById('countdown-grid');

    if (!daysEl) return;

    function pad(n) { return String(n).padStart(2, '0'); }

    function tick() {
      const now = new Date();
      const diff = EVENT_DATE.getTime() - now.getTime();

      if (diff <= 0) {
        if (grid) grid.classList.add('hidden');
        if (endedEl) endedEl.classList.remove('hidden');
        clearInterval(timer);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      daysEl.textContent = pad(days);
      hoursEl.textContent = pad(hours);
      minsEl.textContent = pad(mins);
      secsEl.textContent = pad(secs);
    }

    tick();
    const timer = setInterval(tick, 1000);
  });
})();
