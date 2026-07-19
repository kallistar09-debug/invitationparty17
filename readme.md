# SENN — Sweet Seventeen Invitation Website

A fully responsive, premium interactive birthday invitation site built with
plain HTML, CSS, and JavaScript (no frameworks or build step required).

## How to open it
Just open `index.html` in any modern browser — double-click it, or right
click → "Open with" → your browser. No server or install step is needed.
(For the best experience, and so `fetch` calls to Google Sheets work
smoothly, you can also serve the folder with any static server, e.g.
`npx serve .` or the VS Code "Live Server" extension.)

## The full flow
```
index.html (loading screen → role selection)
 ├─ Join Invitation → password.html (code: 2009)
 │     → welcome.html → save-date.html → dresscode.html → rsvp.html → closing.html
 └─ Admin → admin-login.html (admin / sen1) → dashboard.html
```

## Credentials
| Gate | Value |
|---|---|
| Secret invitation code | `2009` |
| Admin username | `admin` |
| Admin password | `sen1` |

## Project structure
```
/assets
  /images   → decorative images you add (site currently uses CSS/SVG art, no image files required)
  /icons    → optional custom icons
  /audio    → put your ambient-ocean-piano.mp3 track here (see note below)
  /fonts    → optional self-hosted fonts (Google Fonts are loaded via CDN by default)
/css
  style.css        → design tokens, layout, components
  animations.css   → all @keyframes + reduced-motion support
  responsive.css   → breakpoints for tablet/mobile
/js
  config.js     → Google Sheets endpoint configuration
  main.js       → loading screen, role selection, access guard, page nav
  password.js   → secret-code gate logic
  countdown.js  → live countdown on the closing page
  rsvp.js       → RSVP form + local storage + optional Sheets sync
  admin.js      → admin login gate
  dashboard.js  → stats, table, search, pie chart, Excel export
  effects.js    → ocean waves, bubbles, sparkles, ripple, music toggle, confetti
/google-apps-script
  Code.gs       → paste into Google Apps Script to enable the Google Sheets backend
index.html, password.html, welcome.html, save-date.html, dresscode.html,
rsvp.html, closing.html, admin-login.html, dashboard.html
```

## Background music
The site is wired to play `assets/audio/ambient-ocean-piano.mp3` and includes
a floating mute/unmute button, with autoplay deferred until the guest's
first tap/click (to respect browser autoplay policies). Add your own
royalty-free "soft ocean waves + piano" track at that exact path and it
will just work — no code changes needed. If the file is missing, the
button still renders correctly and simply has nothing to play yet.

## RSVP data storage
**Works immediately, no setup:** every RSVP submission is saved in the
guest's browser (`localStorage`) and instantly appears in the Admin
Dashboard — searchable, chartable, exportable to Excel.

**Optional — sync to a real Google Sheet in real time:**
1. Create a Google Sheet.
2. Extensions → Apps Script → paste in `google-apps-script/Code.gs`.
3. Deploy → New deployment → Web app → Execute as "Me", access "Anyone".
4. Copy the deployment URL into `js/config.js`:
   ```js
   window.SENN_CONFIG = { GAS_URL: 'https://script.google.com/macros/s/XXXX/exec' };
   ```
5. Reload the site. New RSVPs now write to the sheet, and the dashboard
   reads live from it (falling back to local data if the sheet is ever
   unreachable).

## Libraries used (via CDN, no install step)
- **AOS** — scroll reveal
- **GSAP** — hero entrance animations (welcome & closing pages)
- **Typed.js** — typing animation on the welcome page
- **canvas-confetti** — password success, RSVP submit, and closing celebration
- **SheetJS (xlsx)** — "Download Excel" export on the dashboard

Ocean waves, floating bubbles, sparkles, and the palm-leaf sway are all
rendered with lightweight canvas/CSS in `effects.js` — no image or Lottie
assets required, so the site stays fast and fully self-contained.

## Notes on the code
- Every page is already wired to the correct CSS/JS files — nothing to
  connect manually.
- Invitation pages (`welcome.html` → `closing.html`) redirect back to
  `index.html` if opened directly without the code being entered first.
  `dashboard.html` redirects to `admin-login.html` the same way.
- All copy, colors, and fonts follow the brief's palette (Ivory, Soft
  Pink, Sand Beige, Baby Blue, Gold Accent) and type system (Cormorant
  Garamond, Poppins, Parisienne).
