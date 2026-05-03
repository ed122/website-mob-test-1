/* ============================================================
   STORIES PAGE — MOBILE INTERACTIONS
   Pairs with: css/stories-mobile.css
   - Roman-numeral clock in nav (matches home)
   - Burger toggles full-screen menu
   - Menu link tap closes menu
   No scroll-stage / sticky logic — this is a normal page.
   No row-expand animation — that's desktop-only. On mobile each
   .str-mob-row is a plain <a> link; the browser handles navigation.
============================================================ */

(function () {
  'use strict';

  // ────────────────────────────────────────────────────────
  // ROMAN-NUMERAL CLOCK
  // ────────────────────────────────────────────────────────
  function startClock() {
    var el = document.getElementById('mobile-clock');
    if (!el) return;
    var ROMAN = [
      '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
      'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX',
      'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX',
      'XXXI', 'XXXII', 'XXXIII', 'XXXIV', 'XXXV', 'XXXVI', 'XXXVII', 'XXXVIII', 'XXXIX', 'XL',
      'XLI', 'XLII', 'XLIII', 'XLIV', 'XLV', 'XLVI', 'XLVII', 'XLVIII', 'XLIX', 'L',
      'LI', 'LII', 'LIII', 'LIV', 'LV', 'LVI', 'LVII', 'LVIII', 'LIX'
    ];
    function tick() {
      var d = new Date();
      el.textContent = ROMAN[d.getHours() % 24 || 0] + ':' +
                       ROMAN[d.getMinutes()] + ':' +
                       ROMAN[d.getSeconds()];
    }
    tick();
    setInterval(tick, 1000);
  }

  // ────────────────────────────────────────────────────────
  // BURGER + MENU TOGGLE
  // ────────────────────────────────────────────────────────
  function setupMenu() {
    var burger = document.getElementById('mobile-burger');
    var menu   = document.getElementById('mobile-menu');
    if (!burger || !menu) return;

    var open = false;
    function setOpen(state) {
      open = state;
      burger.classList.toggle('open', open);
      menu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    }

    burger.addEventListener('click', function () { setOpen(!open); });

    // Tap on a menu link closes the menu (browser then follows the href)
    menu.querySelectorAll('.est-menu-link').forEach(function (link) {
      link.addEventListener('click', function () { setOpen(false); });
    });
  }

  // ────────────────────────────────────────────────────────
  // INIT
  // ────────────────────────────────────────────────────────
  function init() {
    if (!document.getElementById('mobile-stories')) return;
    startClock();
    setupMenu();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();