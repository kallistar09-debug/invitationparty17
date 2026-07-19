/* ==========================================================================
   SENN — Sweet Seventeen | rsvp.js
   Handles the RSVP form: validation, attendance selection, submission,
   local storage persistence, and (if configured) syncing to a Google
   Sheet through the Apps Script web app defined in config.js.
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_KEY = 'senn_rsvp_guests';

  window.SennData = {
    getAll() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      } catch (e) {
        return [];
      }
    },
    saveAll(list) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    },
    add(entry) {
      const list = this.getAll();
      list.unshift(entry);
      this.saveAll(list);
      return list;
    },
    remove(id) {
      const list = this.getAll().filter((g) => g.id !== id);
      this.saveAll(list);
      return list;
    }
  };

  async function syncToSheet(entry) {
    const url = window.SENN_CONFIG && window.SENN_CONFIG.GAS_URL;
    if (!url) return;
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors', // Apps Script web apps don't return CORS headers by default
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'add', payload: entry })
      });
    } catch (err) {
      console.warn('Google Sheets sync failed, entry is still saved locally:', err);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('rsvp-form');
    if (!form) return;

    const nameInput = document.getElementById('rsvp-name');
    const phoneInput = document.getElementById('rsvp-phone');
    const messageInput = document.getElementById('rsvp-message');
    const options = Array.from(document.querySelectorAll('.rsvp-option'));
    const errorEl = document.getElementById('rsvp-error');
    const popup = document.getElementById('rsvp-popup');
    const popupContinue = document.getElementById('popup-continue');

    let selectedAttendance = null;

    options.forEach((opt) => {
      opt.addEventListener('click', () => {
        options.forEach((o) => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedAttendance = opt.getAttribute('data-value');
        errorEl.textContent = '';
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorEl.textContent = '';

      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const message = messageInput.value.trim();

      if (!name) {
        errorEl.textContent = 'Please tell me your name.';
        nameInput.focus();
        return;
      }
      if (!phone) {
        errorEl.textContent = 'Please add a phone number so I can reach you.';
        phoneInput.focus();
        return;
      }
      if (!/^[0-9+\-\s()]{6,20}$/.test(phone)) {
        errorEl.textContent = 'That phone number doesn\u2019t look right — please check it.';
        phoneInput.focus();
        return;
      }
      if (!selectedAttendance) {
        errorEl.textContent = 'Please let me know if you can come!';
        return;
      }

      const entry = {
        id: 'g_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        name,
        phone,
        attendance: selectedAttendance, // 'coming' | 'not_coming'
        message: message || '-',
        submittedAt: new Date().toISOString()
      };

      window.SennData.add(entry);
      syncToSheet(entry);

      if (window.SennConfetti) window.SennConfetti.burst();

      popup.classList.add('show');

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'SENT ✓';
    });

    if (popupContinue) {
      popupContinue.addEventListener('click', () => {
        window.SennNav.go('closing.html');
      });
    }
  });
})();
