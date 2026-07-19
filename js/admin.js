/* ==========================================================================
   SENN — Sweet Seventeen | admin.js
   Admin login gate. Credentials: admin / sen1
   ========================================================================== */

(function () {
  'use strict';

  const ADMIN_USER = 'admin';
  const ADMIN_PASS = 'sen1';

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('admin-login-form');
    if (!form) return;

    const userInput = document.getElementById('admin-username');
    const passInput = document.getElementById('admin-password');
    const card = document.getElementById('admin-card');
    const feedback = document.getElementById('admin-feedback');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = userInput.value.trim();
      const pass = passInput.value;

      if (user === ADMIN_USER && pass === ADMIN_PASS) {
        feedback.textContent = 'Welcome back, Senn!';
        feedback.className = 'code-feedback success';
        window.SennGuard.grantAdmin();
        setTimeout(() => window.SennNav.go('dashboard.html'), 700);
      } else {
        feedback.textContent = 'Incorrect username or password.';
        feedback.className = 'code-feedback error';
        card.classList.remove('shake');
        void card.offsetWidth;
        card.classList.add('shake');
        passInput.value = '';
        passInput.focus();
      }
    });
  });
})();
