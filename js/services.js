/* ============================================================
   SERVICES PAGE — services.js
   1. Page fade-in
   2. Roman numeral clock
   3. Horizontal scroll — mouse wheel, touch, keyboard arrows
   4. Panel tracking — in-view class, counter, progress bar
   5. Scroll hint — fades out on first interaction
   6. Back button — visible after first panel advance
   7. Footer logo animation — matches landing page exactly
============================================================ */

(function () {
  'use strict';

  /* ── Roman numeral converter ── */
  const toRoman = (n) => {
    if (n === 0) return 'O';
    const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
    const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
    let out = '';
    vals.forEach((v, i) => { while (n >= v) { out += syms[i]; n -= v; } });
    return out;
  };

  /* ── Clock ── */
  const clockEl = document.getElementById('roman-clock');
  function updateClock() {
    if (!clockEl) return;
    const now  = new Date();
    const h    = toRoman(now.getHours());
    const m    = toRoman(now.getMinutes());
    const s    = toRoman(now.getSeconds());
    clockEl.textContent = h + ':' + m + ':' + s;
  }
  updateClock();
  setInterval(updateClock, 1000);

  /* ── Page fade-in ── */
  window.addEventListener('load', () => {
    document.body.classList.add('loaded');
  });

  /* ── Elements ── */
  const track       = document.getElementById('svc-scroll-track');
  const panels      = Array.from(document.querySelectorAll('.svc-panel'));
  const footer      = document.getElementById('svc-footer');
  const progressBar = document.getElementById('svc-progress-bar');
  const counterCur  = document.getElementById('svc-counter-current');
  const scrollHint  = document.getElementById('svc-scroll-hint');
  const backBtn     = document.getElementById('svc-back');

  /* Total slides = panels + footer */
  const totalSlides = panels.length + 1;
  let currentIndex  = 0;
  let isAnimating   = false;

  /* ── Pad index to 2 digits ── */
  const pad = (n) => String(n).padStart(2, '0');

  /* ══════════════════════════════════════════════════════════
     FOOTER LOGO ANIMATION (matches landing page exactly)
  ══════════════════════════════════════════════════════════ */
  const footerLogoAnim   = document.getElementById('footer-logo-anim');
  const footerLogoPath   = document.getElementById('footer-logo-path');
  const footerLetterGrid = document.getElementById('footer-letter-grid');
  const footerSpellWord  = document.getElementById('footer-spell-word');
  const footerSpellWrap  = document.getElementById('footer-spell-wrap');
  const footerSpellSuffix = document.getElementById('footer-spell-suffix');
  const footerContent    = document.getElementById('footer-content');
  const footerGridLetters = document.querySelectorAll('.footer-grid-letter');
  
  let footerAnimationPlayed = false;

  // Spell sequence — letter, grid row, grid col, progress threshold (matches landing page)
  const SPELL = [
    { letter: 'E', row: 1, col: 0, progress: 0.00 },
    { letter: 'S', row: 4, col: 2, progress: 0.14 },
    { letter: 'T', row: 4, col: 3, progress: 0.22 },
    { letter: 'R', row: 4, col: 1, progress: 0.35 },
    { letter: 'A', row: 0, col: 0, progress: 0.50 },
    { letter: 'N', row: 3, col: 1, progress: 0.62 },
    { letter: 'G', row: 1, col: 2, progress: 0.75 },
    { letter: 'E', row: 1, col: 0, progress: 0.92 },
  ];

  // Build spell word spans
  if (footerSpellWord) {
    SPELL.forEach(function(item) {
      var span = document.createElement('span');
      span.textContent = item.letter;
      span.setAttribute('data-idx', SPELL.indexOf(item));
      footerSpellWord.appendChild(span);
    });
  }

  function updateFooterGridHighlights(progress) {
    // Reset all
    footerGridLetters.forEach(function(el) {
      el.classList.remove('lit');
    });

    // Light up reached letters
    SPELL.forEach(function(item, idx) {
      if (progress >= item.progress) {
        // Find the matching grid letter
        footerGridLetters.forEach(function(el) {
          if (el.getAttribute('data-row') === String(item.row) &&
              el.getAttribute('data-col') === String(item.col)) {
            el.classList.add('lit');
          }
        });
        // Light up .1 suffix after last letter
        if (footerSpellSuffix) {
          if (progress >= 0.95) {
            footerSpellSuffix.classList.add('lit');
          } else {
            footerSpellSuffix.classList.remove('lit');
          }
        }
        // Light up spell word span
        if (footerSpellWord) {
          var spans = footerSpellWord.querySelectorAll('span');
          if (spans[idx]) spans[idx].classList.add('lit');
        }
      }
    });
  }

  function animateFooterLogo() {
    if (footerAnimationPlayed || !footerLogoPath || !footerLogoAnim || !footerContent) return;
    footerAnimationPlayed = true;

    // Phase 1: Fade in grid
    if (footerLetterGrid) footerLetterGrid.style.opacity = '1';

    // Phase 2: Start drawing after grid is visible
    setTimeout(function() {
      var logoLen = footerLogoPath.getTotalLength();
      footerLogoPath.style.strokeDasharray = logoLen;
      footerLogoPath.style.strokeDashoffset = logoLen;
      footerLogoPath.getBoundingClientRect(); // Force reflow
      footerLogoPath.style.opacity = '1';

      if (footerSpellWrap) footerSpellWrap.classList.add('visible');

      var drawDuration = 2400;
      var startTime = performance.now();

      function drawFrame(now) {
        var elapsed = now - startTime;
        var p = Math.min(elapsed / drawDuration, 1);

        // Easing (matches landing page exactly)
        var eased;
        if (p < 0.3) {
          eased = 0.15 * Math.pow(p / 0.3, 2);
        } else {
          var t = (p - 0.3) / 0.7;
          eased = 0.15 + 0.85 * (1 - Math.pow(1 - t, 3));
        }

        footerLogoPath.style.strokeDashoffset = logoLen * (1 - eased);
        updateFooterGridHighlights(eased);

        if (p < 1) {
          requestAnimationFrame(drawFrame);
        } else {
          // Hold, then reveal content
          setTimeout(function() {
            footerLogoAnim.classList.add('complete');
            footerContent.classList.add('visible');
          }, 800);
        }
      }

      requestAnimationFrame(drawFrame);
    }, 700);
  }

  /* ── Update UI for current index ── */
  function updateUI(idx) {
    /* Progress bar */
    const pct = ((idx + 1) / totalSlides) * 100;
    if (progressBar) progressBar.style.width = pct + '%';

    /* Counter — only for panels, not footer */
    if (counterCur) {
      counterCur.textContent = idx < panels.length ? pad(idx + 1) : pad(panels.length);
    }

    /* in-view class */
    panels.forEach((p, i) => {
      p.classList.toggle('in-view', i === idx);
    });

    /* Back button — visible after first panel */
    if (backBtn) backBtn.classList.toggle('visible', idx > 0);

    /* Trigger footer animation when footer is reached */
    if (idx === totalSlides - 1) {
      setTimeout(animateFooterLogo, 300);
    }
  }

  /* ── Navigate to a specific slide index ── */
  function goTo(idx) {
    if (isAnimating) return;
    idx = Math.max(0, Math.min(totalSlides - 1, idx));
    if (idx === currentIndex) return;

    isAnimating = true;
    currentIndex = idx;

    /* Translate the track */
    track.style.transform = `translateX(${-idx * 100}vw)`;

    updateUI(idx);

    /* Hide scroll hint on first move */
    if (scrollHint) scrollHint.classList.add('hidden');

    setTimeout(() => { isAnimating = false; }, 900);
  }

  /* ── Mouse wheel ── */
  let wheelAccum = 0;
  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    wheelAccum += e.deltaY + e.deltaX;
    if (Math.abs(wheelAccum) > 60) {
      goTo(currentIndex + (wheelAccum > 0 ? 1 : -1));
      wheelAccum = 0;
    }
  }, { passive: false });

  /* ── Keyboard arrows ── */
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(currentIndex + 1);
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goTo(currentIndex - 1);
  });

  /* ── Touch swipe ── */
  let touchStartX = 0;
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchend', (e) => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    const dy = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      goTo(currentIndex + (dx > 0 ? 1 : -1));
    }
  }, { passive: true });

  /* ── Add footer to track ── */
  if (footer && track) {
    track.appendChild(footer);
  }

  /* ── Initial state ── */
  updateUI(0);
  panels[0].classList.add('in-view');

  /* ── DEEP LINK: jump to panel from hash ── */
  const hash = window.location.hash;
  if (hash) {
    const targetIndex = panels.findIndex(p => p.id === hash.replace('#', ''));
    if (targetIndex > 0) {
      setTimeout(() => goTo(targetIndex), 500);
    }
  }

})();