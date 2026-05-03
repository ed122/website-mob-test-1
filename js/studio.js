(function () {
  'use strict';

  /* ── Roman numeral converter ── */
  function toRoman(n) {
    if (n === 0) return 'O';
    var vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
    var syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
    var out = '';
    for (var i = 0; i < vals.length; i++) {
      while (n >= vals[i]) { out += syms[i]; n -= vals[i]; }
    }
    return out;
  }

  /* ── Clock ── */
  var clockEl = document.getElementById('roman-clock');
  function updateClock() {
    if (!clockEl) return;
    var now = new Date();
    clockEl.textContent = toRoman(now.getHours()) + ':' + toRoman(now.getMinutes()) + ':' + toRoman(now.getSeconds());
  }
  updateClock();
  setInterval(updateClock, 1000);

  /* ── Header scroll hide/show ── */
  var nav = document.getElementById('main-nav');
  var lastScrollY = 0;
  var HIDE_THRESHOLD = window.innerHeight * 0.8;

  window.addEventListener('scroll', function () {
    var currentY = window.scrollY;
    if (!nav || !nav.classList.contains('visible')) {
      lastScrollY = currentY;
      return;
    }

    var scrollingDown = currentY > lastScrollY;
    var pastThreshold = currentY > HIDE_THRESHOLD;

    if (scrollingDown && pastThreshold) {
      nav.classList.add('nav-hidden');
    } else if (!scrollingDown) {
      nav.classList.remove('nav-hidden');
    }

    lastScrollY = currentY;
  }, { passive: true });

  /* ── Scroll progress bar ── */
  var progressFill = document.querySelector('.scroll-progress-fill');
  window.addEventListener('scroll', function () {
    if (!progressFill) return;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (h > 0) progressFill.style.height = (window.scrollY / h * 100) + '%';
  }, { passive: true });

  /* ── Hero word reveal ── */
  var heroSection = document.getElementById('s-hero');
  if (heroSection) {
    setTimeout(function () { heroSection.classList.add('active'); }, 300);
  }

  /* ── Scroll reveals ── */
  document.body.classList.add('js-ready');
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  }

})();