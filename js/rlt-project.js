/* ============================================================
   REALITIES PROJECT PAGE — rlt-project.js
============================================================ */

(function () {
  'use strict';

  /* ── Roman numeral converter ── */
  var toRoman = function(n) {
    if (n === 0) return 'O';
    var vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
    var syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
    var out = '';
    vals.forEach(function(v, i) { while (n >= v) { out += syms[i]; n -= v; } });
    return out;
  };

  /* ── Clock ── */
  var clockEl = document.getElementById('roman-clock');
  function updateClock() {
    if (!clockEl) return;
    var now = new Date();
    clockEl.textContent = toRoman(now.getHours()) + ':' + toRoman(now.getMinutes()) + ':' + toRoman(now.getSeconds());
  }
  updateClock();
  setInterval(updateClock, 1000);

  /* ── Page fade-in + header ── */
  window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    if (mainNav) {
      setTimeout(function() {
        mainNav.classList.add('visible');
      }, 150);
    }
  });

  /* ── Scroll: header, back button, progress bar, footer ── */
  var mainNav = document.getElementById('main-nav');
  var backBtn = document.getElementById('rp-back');
  var progressFill = document.querySelector('.scroll-progress-fill');
  var footerWrap = document.getElementById('rp-footer-wrap');
  var lastScrollY = 0;

  window.addEventListener('scroll', function() {
    var y = window.scrollY;
    var vh = window.innerHeight;

    /* Header background swap */
    if (mainNav) {
      mainNav.classList.toggle('nav-scrolled', y > 80);
      /* Hide on scroll down, show on scroll up */
      if (y > lastScrollY && y > vh * 0.5) {
        mainNav.classList.add('nav-hidden');
      } else if (y < lastScrollY) {
        mainNav.classList.remove('nav-hidden');
      }
    }

    /* Back button */
    if (backBtn) {
      backBtn.classList.toggle('visible', y > 60);
    }

    /* Progress bar */
    if (progressFill) {
      var docHeight = document.documentElement.scrollHeight - vh;
      progressFill.style.height = (y / docHeight * 100) + '%';
    }

    /* Footer rise */
    if (footerWrap) {
      var rect = footerWrap.getBoundingClientRect();
      if (rect.top < vh * 0.7) {
        footerWrap.classList.add('footer-visible');
      }
    }

    lastScrollY = y;
  }, { passive: true });

  /* ── Auto-scroll past hero (desktop) ── */
  var infoSection = document.getElementById('rp-info');
  var isAutoScrolling = false;
  var scrollAccumulator = 0;
  var scrollTimeout;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function customScrollTo(targetY, duration) {
    var startY = window.scrollY;
    var distance = targetY - startY;
    var startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      var elapsed = currentTime - startTime;
      var progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + (distance * easeInOutCubic(progress)));
      if (elapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        isAutoScrolling = false;
        scrollAccumulator = 0;
      }
    }
    requestAnimationFrame(animation);
  }

  if (window.innerWidth > 1024 && infoSection) {
    setTimeout(function() {
      window.addEventListener('wheel', function(e) {
        if (isAutoScrolling) { e.preventDefault(); return; }

        if (window.scrollY < 10) {
          if (e.deltaY > 0) {
            e.preventDefault();
            scrollAccumulator += e.deltaY;
            clearTimeout(scrollTimeout);

            if (scrollAccumulator >= 300) {
              isAutoScrolling = true;
              var targetY = infoSection.getBoundingClientRect().top + window.scrollY;
              customScrollTo(targetY, 1200);
            } else {
              scrollTimeout = setTimeout(function() { scrollAccumulator = 0; }, 500);
            }
          } else {
            scrollAccumulator = 0;
          }
        }
      }, { passive: false });
    }, 1000);
  }

  /* ── Back button navigation ── */
  if (backBtn) {
    backBtn.addEventListener('click', function(e) {
      e.preventDefault();
      document.body.style.opacity = '0';
      setTimeout(function() {
        window.location.href = 'realities.html';
      }, 400);
    });
  }

  /* ── Scroll reveal ── */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function(el) { obs.observe(el); });
  }

})();