/* ============================================================
   STORIES NAV — stories.js
============================================================ */

(function () {
  'use strict';

  /* ── Page loaded class for entry animations ── */
  window.addEventListener('load', function () {
    document.body.classList.add('str-loaded');
    document.querySelector('.str-layout').classList.add('str-loaded');
  });

  /* ── Back button fix: clear overlay on page restore ── */
  var overlay = document.getElementById('reveal-overlay');
  window.addEventListener('pageshow', function (e) {
    if (overlay && (e.persisted || overlay.classList.contains('active'))) {
      overlay.style.transition = 'none';
      overlay.classList.remove('active');
      overlay.style.opacity = '0';
      requestAnimationFrame(function () {
        overlay.style.transition = 'opacity 0.6s ease';
      });
    }
  });

  /* ── Row click: expand to full viewport then navigate ── */
  var rows = document.querySelectorAll('.str-row');
  var sidebar = document.querySelector('.str-sidebar');
  var header = document.querySelector('.str-header');
  var animating = false;

  rows.forEach(function (row) {
    row.addEventListener('click', function (e) {
      e.preventDefault();
      if (animating) return;
      animating = true;

      var href = row.getAttribute('href') || 'project.html';
      var rect = row.getBoundingClientRect();

      /* Hide other rows */
      rows.forEach(function (r) {
        if (r !== row) {
          r.classList.add('is-hidden');
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

      /* Detach and animate to full viewport */
      row.classList.add('is-expanding');
      row.style.top = rect.top + 'px';
      row.style.left = rect.left + 'px';
      row.style.width = rect.width + 'px';
      row.style.height = rect.height + 'px';
      row.style.transition = 'none';

      row.getBoundingClientRect(); /* force reflow */

      row.style.transition = 'top 1.2s cubic-bezier(0.76,0,0.24,1), left 1.2s cubic-bezier(0.76,0,0.24,1), width 1.2s cubic-bezier(0.76,0,0.24,1), height 1.2s cubic-bezier(0.76,0,0.24,1)';
      row.style.top = '0px';
      row.style.left = '0px';
      row.style.width = '100vw';
      row.style.height = '100vh';

      /* Reveal full image */
      var bg = row.querySelector('.str-row-bg');
      if (bg) {
        bg.style.transition = 'filter 1.2s ease';
        bg.style.filter = 'grayscale(0%) brightness(1)';
      }

      /* Fade to black then navigate */
      setTimeout(function () {
        if (overlay) overlay.classList.add('active');
        setTimeout(function () {
          window.location.href = href;
        }, 600);
      }, 1400);
    });
  });

})();