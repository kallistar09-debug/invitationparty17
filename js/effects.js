/* ==========================================================================
   SENN — Sweet Seventeen | effects.js
   Shared ambient visual effects used across every page:
   - Animated ocean wave canvas background
   - Floating bubbles
   - Ambient sparkles
   - Button ripple micro-interaction
   - Desktop cursor sparkle trail
   - Background music toggle (autoplay-safe)
   ========================================================================== */

(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     1. Animated ocean waves — rendered on a full-viewport canvas so it
        can sit behind every glass card without needing an image asset.
  --------------------------------------------------------------------- */
  function initWaveCanvas() {
    const canvas = document.getElementById('wave-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, t = 0;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const layers = [
      { amp: 18, freq: 0.010, speed: 0.014, offset: 0, color: 'rgba(223, 245, 255, 0.55)' },
      { amp: 26, freq: 0.007, speed: 0.010, offset: 60, color: 'rgba(255, 231, 239, 0.45)' },
      { amp: 34, freq: 0.005, speed: 0.007, offset: 120, color: 'rgba(207, 175, 134, 0.18)' }
    ];

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const baseline = height - 60;

      layers.forEach((layer, i) => {
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 10) {
          const y = baseline - layer.offset * 0.3 +
            Math.sin(x * layer.freq + t * layer.speed + i) * layer.amp;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = layer.color;
        ctx.fill();
      });

      t += 1;
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ---------------------------------------------------------------------
     2. Floating bubbles — lightweight DOM elements, spawned on interval
  --------------------------------------------------------------------- */
  function initBubbles() {
    const layer = document.getElementById('bubble-layer');
    if (!layer) return;

    function spawnBubble() {
      const b = document.createElement('span');
      const size = 6 + Math.random() * 20;
      b.style.cssText = `
        position:absolute;
        left:${Math.random() * 100}%;
        bottom:-40px;
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        background:radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(223,245,255,0.15));
        pointer-events:none;
        animation: floatUp ${8 + Math.random() * 6}s linear forwards;
      `;
      layer.appendChild(b);
      setTimeout(() => b.remove(), 15000);
    }

    for (let i = 0; i < 6; i++) setTimeout(spawnBubble, i * 900);
    setInterval(spawnBubble, 1600);
  }

  /* ---------------------------------------------------------------------
     3. Ambient sparkles
  --------------------------------------------------------------------- */
  function initSparkles() {
    const layer = document.getElementById('sparkle-layer');
    if (!layer) return;

    function spawnSparkle() {
      const s = document.createElement('span');
      const size = 3 + Math.random() * 4;
      s.style.cssText = `
        position:absolute;
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        background:#CFAF86;
        box-shadow:0 0 8px 2px rgba(207,175,134,0.8);
        pointer-events:none;
        animation: sparkleTwinkle ${2 + Math.random() * 2}s ease-in-out forwards;
      `;
      layer.appendChild(s);
      setTimeout(() => s.remove(), 4000);
    }

    setInterval(spawnSparkle, 500);
  }

  /* ---------------------------------------------------------------------
     4. Palm leaf sway (decorative corner element)
  --------------------------------------------------------------------- */
  function initPalm() {
    document.querySelectorAll('.palm-leaf').forEach((leaf) => {
      leaf.style.animation = 'palmSway 4.5s ease-in-out infinite';
      leaf.style.transformOrigin = 'bottom center';
    });
  }

  /* ---------------------------------------------------------------------
     5. Button ripple effect — attaches to any .btn
  --------------------------------------------------------------------- */
  function initRipple() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'btn-ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  }

  /* ---------------------------------------------------------------------
     6. Desktop cursor sparkle trail (skipped on touch devices)
  --------------------------------------------------------------------- */
  function initCursorSparkle() {
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (isTouch) return;

    let last = 0;
    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - last < 60) return;
      last = now;
      const dot = document.createElement('span');
      dot.style.cssText = `
        position:fixed;
        left:${e.clientX}px;
        top:${e.clientY}px;
        width:5px;
        height:5px;
        border-radius:50%;
        background:#CFAF86;
        box-shadow:0 0 6px 2px rgba(207,175,134,0.7);
        pointer-events:none;
        z-index:9999;
        transform:translate(-50%,-50%);
        animation: sparkleTwinkle 0.8s ease-out forwards;
      `;
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 800);
    });
  }

  /* ---------------------------------------------------------------------
     7. Background music — autoplay only after first user interaction
  --------------------------------------------------------------------- */
  function initMusic() {
    const toggle = document.getElementById('music-toggle');
    const audio = document.getElementById('bg-audio');
    if (!toggle || !audio) return;

    audio.volume = 0.35;
    let userStarted = sessionStorage.getItem('senn_music_on') === 'true';

    function play() {
      audio.play().then(() => {
        toggle.classList.add('playing');
        sessionStorage.setItem('senn_music_on', 'true');
      }).catch(() => {
        /* Autoplay blocked — will retry on next interaction */
      });
    }

    function pause() {
      audio.pause();
      toggle.classList.remove('playing');
      sessionStorage.setItem('senn_music_on', 'false');
    }

    toggle.addEventListener('click', () => {
      if (audio.paused) play(); else pause();
    });

    if (userStarted) {
      const startOnce = () => {
        play();
        document.removeEventListener('click', startOnce);
        document.removeEventListener('touchstart', startOnce);
      };
      document.addEventListener('click', startOnce, { once: true });
      document.addEventListener('touchstart', startOnce, { once: true });
    }
  }

  /* ---------------------------------------------------------------------
     8. Global confetti helper (wraps canvas-confetti CDN library)
  --------------------------------------------------------------------- */
  window.SennConfetti = {
    burst(opts) {
      if (typeof confetti !== 'function') return;
      confetti(Object.assign({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#CFAF86', '#FFE7EF', '#DFF5FF', '#F3E4CF']
      }, opts || {}));
    },
    mini() {
      this.burst({ particleCount: 40, spread: 50, scalar: 0.7 });
    },
    grand() {
      if (typeof confetti !== 'function') return;
      const duration = 2500;
      const end = Date.now() + duration;
      (function frame() {
        confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#CFAF86', '#FFE7EF', '#DFF5FF'] });
        confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#CFAF86', '#FFE7EF', '#DFF5FF'] });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    initWaveCanvas();
    initBubbles();
    initSparkles();
    initPalm();
    initRipple();
    initCursorSparkle();
    initMusic();

    if (window.AOS) AOS.init({ duration: 900, once: true, easing: 'ease-out-cubic' });
  });
})();
