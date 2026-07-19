/* ==========================================================================
   SENN — Sweet Seventeen | password.js
   Secret-code gate for the invitation. Correct code: "2009" (birth year).
   ========================================================================== */

(function () {
  'use strict';

  const SECRET_CODE = '2009';

  document.addEventListener('DOMContentLoaded', () => {
    const inputs = Array.from(document.querySelectorAll('.code-inputs input'));
    const feedback = document.getElementById('code-feedback');
    const card = document.getElementById('password-card');
    const successCheck = document.getElementById('success-check');
    const startBtn = document.getElementById('start-btn');
    if (!inputs.length) return;

    inputs[0].focus();

    inputs.forEach((input, idx) => {
      input.addEventListener('input', () => {
        input.value = input.value.replace(/[^0-9]/g, '').slice(-1);
        if (input.value && idx < inputs.length - 1) {
          inputs[idx + 1].focus();
        }
        clearFeedback();
        if (inputs.every((i) => i.value.length === 1)) {
          checkCode();
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && idx > 0) {
          inputs[idx - 1].focus();
        }
      });

      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '');
        text.split('').slice(0, inputs.length).forEach((ch, i) => {
          inputs[i].value = ch;
        });
        if (text.length >= inputs.length) checkCode();
      });
    });

    function clearFeedback() {
      feedback.textContent = '';
      feedback.className = 'code-feedback';
    }

    function checkCode() {
      const entered = inputs.map((i) => i.value).join('');

      if (entered === SECRET_CODE) {
        onSuccess();
      } else {
        onError();
      }
    }

    function onError() {
      feedback.textContent = "Oops! That's not the secret code.";
      feedback.className = 'code-feedback error';
      card.classList.remove('shake');
      void card.offsetWidth; /* restart animation */
      card.classList.add('shake');
      setTimeout(() => {
        inputs.forEach((i) => (i.value = ''));
        inputs[0].focus();
      }, 400);
    }

    function onSuccess() {
      feedback.textContent = 'Access Granted 🎉';
      feedback.className = 'code-feedback success';
      inputs.forEach((i) => (i.disabled = true));
      successCheck.classList.add('show');

      if (window.SennConfetti) window.SennConfetti.mini();

      window.SennGuard.grantInvite();

      setTimeout(() => {
        startBtn.classList.remove('hidden');
        startBtn.classList.add('fade-in-up');
      }, 500);
    }

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        window.SennNav.go('welcome.html');
      });
    }
  });
})();
