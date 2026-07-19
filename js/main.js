/* ==========================================================================
   SENN — Sweet Seventeen | main.js
   Handles: loading screen, role selection, page-access guarding, and
   shared navigation helpers used by every page in the invitation flow.
   ========================================================================== */

(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     Access guard
     The invitation pages (welcome, save-date, dresscode, rsvp, closing)
     may only be viewed after the secret code has been entered correctly.
     The admin dashboard may only be viewed after admin login succeeds.
  --------------------------------------------------------------------- */
  window.SennGuard = {
    INVITE_KEY: 'senn_access_granted',
    ADMIN_KEY: 'senn_admin_logged_in',

    grantInvite() { sessionStorage.setItem(this.INVITE_KEY, 'true'); },
    hasInviteAccess() { return sessionStorage.getItem(this.INVITE_KEY) === 'true'; },

    grantAdmin() { sessionStorage.setItem(this.ADMIN_KEY, 'true'); },
    hasAdminAccess() { return sessionStorage.getItem(this.ADMIN_KEY) === 'true'; },
    logoutAdmin() { sessionStorage.removeItem(this.ADMIN_KEY); },

    requireInvite(redirectTo) {
      if (!this.hasInviteAccess()) {
        window.location.replace(redirectTo || 'index.html');
      }
    },
    requireAdmin(redirectTo) {
      if (!this.hasAdminAccess()) {
        window.location.replace(redirectTo || 'admin-login.html');
      }
    }
  };

  /* ---------------------------------------------------------------------
     Smooth internal navigation with a fade-out transition
  --------------------------------------------------------------------- */
  window.SennNav = {
    go(url) {
      document.body.style.transition = 'opacity 0.5s ease';
      document.body.style.opacity = '0';
      setTimeout(() => { window.location.href = url; }, 480);
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '0';
    requestAnimationFrame(() => {
      document.body.style.transition = 'opacity 0.6s ease';
      document.body.style.opacity = '1';
    });

    /* -------------------- Loading screen (index.html only) -------------------- */
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        const roleSelect = document.getElementById('role-selection');
        if (roleSelect) roleSelect.classList.add('fade-in-up');
      }, 2000);
    }

    /* -------------------- Role selection cards -------------------- */
    const joinCard = document.getElementById('card-join');
    const adminCard = document.getElementById('card-admin');

    if (joinCard) {
      joinCard.addEventListener('click', () => SennNav.go('password.html'));
    }
    if (adminCard) {
      adminCard.addEventListener('click', () => SennNav.go('admin-login.html'));
    }

    /* -------------------- Generic "back" button -------------------- */
    document.querySelectorAll('.nav-back').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        if (target) SennNav.go(target);
        else window.history.back();
      });
    });

    /* -------------------- Generic forward-continue buttons -------------------- */
    document.querySelectorAll('[data-nav-next]').forEach((btn) => {
      btn.addEventListener('click', () => {
        SennNav.go(btn.getAttribute('data-nav-next'));
      });
    });
  });
})();
