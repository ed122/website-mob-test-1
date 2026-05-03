/* ============================================================
   REALITIES NAV — realities.js
============================================================ */

(function () {
  'use strict';

  /* ── Page loaded class for entry animations ── */
  window.addEventListener('load', function () {
    document.querySelector('.rlt-layout').classList.add('rlt-loaded');
  });

  /* ── Back button fix: clear overlay on page restore ── */
  var overlay = document.getElementById('rlt-overlay');
  window.addEventListener('pageshow', function (e) {
    if (overlay && (e.persisted || overlay.classList.contains('active'))) {
      overlay.style.transition = 'none';
      overlay.classList.remove('active');
      overlay.style.opacity = '0';
      requestAnimationFrame(function () {
        overlay.style.transition = 'opacity 0.55s ease';
      });
    }
  });

  /* ── Card click: fade to white then navigate ── */
  var cards = document.querySelectorAll('.rlt-card');
  var sidebar = document.querySelector('.rlt-sidebar');
  var header = document.querySelector('.rlt-header');
  var animating = false;

  cards.forEach(function (card) {
    card.addEventListener('click', function (e) {
      e.preventDefault();
      if (animating) return;
      animating = true;

      var href = card.getAttribute('href') || 'project.html';

      /* Scale up clicked card image */
      var img = card.querySelector('.rlt-card-img');
      if (img) {
        img.style.transition = 'transform 0.5s ease';
        img.style.transform = 'scale(1.06)';
      }

      /* Hide other cards */
      cards.forEach(function (c) {
        if (c !== card) {
          c.classList.add('is-hidden');
        }
      });

      /* Hide sidebar and header */
      if (sidebar) {
        sidebar.style.transition = 'opacity 0.5s ease';
        sidebar.style.opacity = '0';
      }
      if (header) {
        header.style.transition = 'opacity 0.5s ease';
        header.style.opacity = '0';
      }

      /* Fade to white then navigate */
      setTimeout(function () {
        if (overlay) overlay.classList.add('active');
        setTimeout(function () {
          window.location.href = href;
        }, 550);
      }, 550);
    });
  });

})();