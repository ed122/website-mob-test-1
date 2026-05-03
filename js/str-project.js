/* project.js — Estrange.1 Project Page */
(function () {
  'use strict';

  /* ── Roman numeral clock ── */
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

  /* ── Back button — show after scrolling past 60px ── */
  var backBtn = document.getElementById('rp-back');
  window.addEventListener('scroll', function () {
    if (backBtn) backBtn.classList.toggle('visible', window.scrollY > 60);
  }, { passive: true });
  
  /* ── Reveal sections on scroll ── */
  var sections = document.querySelectorAll('.proj-section');
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    sections.forEach(function (el) { obs.observe(el); });
    revealEls.forEach(function (el) { obs.observe(el); });
  }

})();