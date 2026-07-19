/* ==========================================================================
   SENN — Sweet Seventeen | config.js
   ---------------------------------------------------------------------
   Google Sheets backend (optional, real-time sync)

   The site works fully out of the box using the browser's own storage,
   so you can open it right now and every feature — RSVP, admin
   dashboard, search, chart, delete, export — already works.

   To make submissions land in a real Google Sheet instead (or as well),
   deploy the script in /google-apps-script/Code.gs to Google Apps
   Script (steps are in README.md) and paste the Web App URL below.
   Once GAS_URL is set, rsvp.js and dashboard.js automatically read and
   write through it instead of only using local storage.
   ========================================================================== */

window.SENN_CONFIG = {
  GAS_URL: '' // e.g. 'https://script.google.com/macros/s/AKfycb.../exec'
};
