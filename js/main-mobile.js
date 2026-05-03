/* ============================================================
   ESTRANGE STUDIO — main-mobile.js
   Vanilla counterpart to the desktop main.js. Loaded only on
   viewports ≤767px (see the conditional <script> in index.html).

   Responsibilities:
   1. Cover animation (duplicated from main.js so this file is
      self-contained — the cover HTML lives in index.html)
   2. Roman numeral clock in the mobile nav
   3. Burger menu open/close (with body scroll lock)
   4. Unified sticky-stage scroll → which slide is active
   5. Per-slide state: process step, services progressive reveal,
      bridge motion graphics, progress bar, slide counter
   6. Horizontal project carousel tracking (Work slide)
============================================================ */

(function () {
  'use strict';

  // ────────────────────────────────────────────────────────
  // CONSTANTS
  // ────────────────────────────────────────────────────────
  var ANIMATION_KEY = 'estrange_animation_played';
  var NUM_SLIDES = 10;

  // Spell sequence — letter, grid row, grid col, progress threshold
  // (Same data as desktop main.js. Duplicated for self-containment.)
  var SPELL = [
    { letter: 'E', row: 1, col: 0, progress: 0.00 },
    { letter: 'S', row: 4, col: 2, progress: 0.14 },
    { letter: 'T', row: 4, col: 3, progress: 0.22 },
    { letter: 'R', row: 4, col: 1, progress: 0.35 },
    { letter: 'A', row: 0, col: 0, progress: 0.50 },
    { letter: 'N', row: 3, col: 1, progress: 0.62 },
    { letter: 'G', row: 1, col: 2, progress: 0.75 },
    { letter: 'E', row: 1, col: 0, progress: 0.92 }
  ];

  // ────────────────────────────────────────────────────────
  // STATE
  // ────────────────────────────────────────────────────────
  var slideIndex = -1;          // -1 forces first updateSlides() to run
  var slideProgress = 0;
  var carouselIndex = 0;
  var menuOpen = false;
  var stageEl = null;

  // ────────────────────────────────────────────────────────
  // COVER ANIMATION
  // Same shape as desktop main.js's cover sequence, but lives
  // here so the mobile bundle is self-contained. Drives the
  // existing #landing-cover DOM (already in index.html).
  // ────────────────────────────────────────────────────────
  function runCover() {
    var cover = document.getElementById('landing-cover');
    var logoPath = document.getElementById('logo-path');
    var letterGrid = document.getElementById('letter-grid');
    var spellWord = document.getElementById('spell-word');
    var spellSuffix = document.getElementById('spell-suffix');
    var spellWrap = document.getElementById('spell-word-wrap');
    var gridLetters = document.querySelectorAll('.grid-letter');

    if (!cover || !logoPath) return;

    // Build spell word spans dynamically (same as desktop)
    if (spellWord && spellWord.children.length === 0) {
      SPELL.forEach(function (item, i) {
        var span = document.createElement('span');
        span.textContent = item.letter;
        span.setAttribute('data-idx', i);
        spellWord.appendChild(span);
      });
    }

    function updateGrid(progress) {
      gridLetters.forEach(function (el) { el.classList.remove('lit'); });
      SPELL.forEach(function (item, idx) {
        if (progress >= item.progress) {
          gridLetters.forEach(function (el) {
            if (el.getAttribute('data-row') === String(item.row) &&
                el.getAttribute('data-col') === String(item.col)) {
              el.classList.add('lit');
            }
          });
          if (spellWord) {
            var spans = spellWord.querySelectorAll('span');
            if (spans[idx]) spans[idx].classList.add('lit');
          }
        }
      });
      if (spellSuffix) {
        if (progress >= 0.95) spellSuffix.classList.add('lit');
        else spellSuffix.classList.remove('lit');
      }
    }

    function liftCover() {
      cover.classList.add('lift');
      cover.style.pointerEvents = 'none';
      // Mark mobile-app as ready — triggers the nav/hero/counter fade-in
      var app = document.getElementById('mobile-app');
      if (app) app.classList.add('hero-ready');
    }

    function skipAndShow() {
      cover.style.transition = 'none';
      cover.classList.add('lift');
      cover.style.pointerEvents = 'none';
      logoPath.style.opacity = '1';
      logoPath.style.strokeDashoffset = '0';
      updateGrid(1);
      if (spellWrap) spellWrap.classList.add('visible');
      if (spellWord) {
        spellWord.querySelectorAll('span').forEach(function (s) { s.classList.add('lit'); });
      }
      if (spellSuffix) spellSuffix.classList.add('lit');
      var app = document.getElementById('mobile-app');
      if (app) app.classList.add('hero-ready');
    }

    function animate() {
      sessionStorage.setItem(ANIMATION_KEY, 'true');
      if (letterGrid) letterGrid.style.opacity = '1';

      // 700ms grid fade, then begin draw
      setTimeout(function () {
        var logoLen = logoPath.getTotalLength();
        logoPath.style.strokeDasharray = logoLen;
        logoPath.style.strokeDashoffset = logoLen;
        logoPath.getBoundingClientRect(); // force reflow
        logoPath.style.opacity = '1';
        if (spellWrap) spellWrap.classList.add('visible');

        var drawDuration = 2400;
        var startTime = performance.now();

        function frame(now) {
          var elapsed = now - startTime;
          var p = Math.min(elapsed / drawDuration, 1);

          // Slow start, cubic ease-out finish (matches desktop)
          var eased;
          if (p < 0.3) {
            eased = 0.15 * Math.pow(p / 0.3, 2);
          } else {
            var t = (p - 0.3) / 0.7;
            eased = 0.15 + 0.85 * (1 - Math.pow(1 - t, 3));
          }

          logoPath.style.strokeDashoffset = logoLen * (1 - eased);
          updateGrid(eased);

          if (p < 1) {
            requestAnimationFrame(frame);
          } else {
            setTimeout(liftCover, 800);
          }
        }
        requestAnimationFrame(frame);
      }, 700);
    }

    if (sessionStorage.getItem(ANIMATION_KEY) === 'true') {
      skipAndShow();
    } else {
      animate();
    }
  }

  // ────────────────────────────────────────────────────────
  // ROMAN-NUMERAL CLOCK (mobile nav)
  // ────────────────────────────────────────────────────────
  function startClock() {
    var el = document.getElementById('mobile-clock');
    if (!el) return;

    function toRoman(n) {
      if (n === 0) return 'O';
      var vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
      var syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
      var out = '';
      for (var i = 0; i < vals.length; i++) {
        while (n >= vals[i]) { out += syms[i]; n -= vals[i]; }
      }
      return out;
    }

    function tick() {
      var d = new Date();
      el.textContent = toRoman(d.getHours()) + ':' + toRoman(d.getMinutes()) + ':' + toRoman(d.getSeconds());
    }
    tick();
    setInterval(tick, 1000);
  }

  // ────────────────────────────────────────────────────────
  // BURGER MENU
  // ────────────────────────────────────────────────────────
  function setupMenu() {
    var burger = document.getElementById('mobile-burger');
    var menu = document.getElementById('mobile-menu');
    if (!burger || !menu) return;

    function setOpen(open) {
      menuOpen = open;
      burger.classList.toggle('open', open);
      menu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    }

    burger.addEventListener('click', function () { setOpen(!menuOpen); });

    // Tapping a menu link closes the menu, and if it has a
    // data-slide-target, scroll to the position in the sticky stage
    // that activates that slide. We compute scrollTop from the stage's
    // top + target * (stageHeight - viewportHeight) / (NUM_SLIDES - 1).
    // This puts the user mid-dwell on the requested slide.
    menu.querySelectorAll('.est-menu-link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var target = link.getAttribute('data-slide-target');
        if (target !== null) {
          e.preventDefault();
          var stage = document.getElementById('est-stage');
          if (stage) {
            var targetIdx = parseInt(target, 10);
            var stageRect = stage.getBoundingClientRect();
            var stageTop = stageRect.top + window.scrollY;
            var scrollableRange = stage.offsetHeight - window.innerHeight;
            // Position scroll so slideIndex === targetIdx, with a small
            // bias of +0.5 segments to land mid-slide rather than at
            // the boundary.
            var ratio = (targetIdx + 0.5) / NUM_SLIDES;
            var dest = stageTop + scrollableRange * ratio;
            window.scrollTo({ top: dest, behavior: 'smooth' });
          }
        }
        setOpen(false);
      });
    });
  }

  // ────────────────────────────────────────────────────────
  // BRIDGE MOTION GRAPHICS — populate SVG layers once,
  // then update transforms on each scroll frame.
  // ────────────────────────────────────────────────────────
  function buildBridgeGraphics() {
    var ringG = document.getElementById('bm-ring-g');
    var ringArc = document.getElementById('bm-ring-arc');
    if (!ringG || ringG.children.length > 0) return; // only build once

    var SVG_NS = 'http://www.w3.org/2000/svg';

    // 36 tick lines around the outer ring
    for (var i = 0; i < 36; i++) {
      var angle = (i * 10) * Math.PI / 180;
      var inner = 82;
      var outer = (i % 3 === 0) ? 92 : 88;
      var line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', Math.cos(angle) * inner);
      line.setAttribute('y1', Math.sin(angle) * inner);
      line.setAttribute('x2', Math.cos(angle) * outer);
      line.setAttribute('y2', Math.sin(angle) * outer);
      line.setAttribute('stroke', '#0C0C0C');
      line.setAttribute('stroke-width', i % 3 === 0 ? '0.6' : '0.3');
      line.setAttribute('opacity', i % 3 === 0 ? '0.35' : '0.2');
      ringG.appendChild(line);
    }

    // Step 1 shape — radial spokes
    var step1 = document.getElementById('bm-step-1');
    if (step1) {
      for (var s = 0; s < 12; s++) {
        var a = (s * 30) * Math.PI / 180;
        var l = document.createElementNS(SVG_NS, 'line');
        l.setAttribute('x1', 0); l.setAttribute('y1', 0);
        l.setAttribute('x2', Math.cos(a) * 50);
        l.setAttribute('y2', Math.sin(a) * 50);
        l.setAttribute('stroke', '#0C0C0C');
        l.setAttribute('stroke-width', '0.5');
        l.setAttribute('opacity', '0.3');
        step1.appendChild(l);
      }
      var dot = document.createElementNS(SVG_NS, 'circle');
      dot.setAttribute('cx', 0); dot.setAttribute('cy', 0); dot.setAttribute('r', 3);
      dot.setAttribute('fill', '#0C0C0C'); dot.setAttribute('opacity', '0.5');
      step1.appendChild(dot);
    }

    // Step 4 shape — concentric + radial spokes
    var step4 = document.getElementById('bm-step-4');
    if (step4) {
      [55, 40, 25].forEach(function (r, idx) {
        var c = document.createElementNS(SVG_NS, 'circle');
        c.setAttribute('cx', 0); c.setAttribute('cy', 0); c.setAttribute('r', r);
        c.setAttribute('fill', 'none');
        c.setAttribute('stroke', '#0C0C0C');
        c.setAttribute('stroke-width', idx === 2 ? '0.6' : '0.5');
        c.setAttribute('opacity', idx === 0 ? '0.25' : (idx === 1 ? '0.3' : '0.4'));
        step4.appendChild(c);
      });
      for (var k = 0; k < 8; k++) {
        var ka = (k * 45 - 90) * Math.PI / 180;
        var sl = document.createElementNS(SVG_NS, 'line');
        sl.setAttribute('x1', Math.cos(ka) * 25);
        sl.setAttribute('y1', Math.sin(ka) * 25);
        sl.setAttribute('x2', Math.cos(ka) * 62);
        sl.setAttribute('y2', Math.sin(ka) * 62);
        sl.setAttribute('stroke', '#0C0C0C');
        sl.setAttribute('stroke-width', '0.4');
        sl.setAttribute('opacity', '0.3');
        step4.appendChild(sl);
      }
    }

    // Initialize the progress arc dasharray
    if (ringArc) {
      ringArc.setAttribute('stroke-dasharray', 440);
      ringArc.setAttribute('stroke-dashoffset', 440);
    }
  }

  function updateBridgeGraphics(processStep, stepProgress) {
    var ringG = document.getElementById('bm-ring-g');
    var ringArc = document.getElementById('bm-ring-arc');
    var rotation = (processStep + stepProgress) * 18;

    if (ringG) {
      ringG.style.transform = 'rotate(' + rotation + 'deg)';
    }
    if (ringArc) {
      var totalProgress = (processStep + stepProgress) / 4;
      ringArc.setAttribute('stroke-dashoffset', 440 - 440 * totalProgress);
    }

    // Toggle .on class on the active step group
    for (var i = 1; i <= 4; i++) {
      var g = document.getElementById('bm-step-' + i);
      if (g) g.classList.toggle('on', processStep === (i - 1));
    }

    // Step-2 triangles rotate based on progress
    var s2outer = document.getElementById('bm-step-2-outer');
    var s2mid = document.getElementById('bm-step-2-mid');
    if (s2outer && s2mid) {
      if (processStep === 1) {
        s2outer.style.transform = 'rotate(' + (stepProgress * 360) + 'deg)';
        s2mid.style.transform = 'rotate(' + (-stepProgress * 360) + 'deg)';
      } else {
        s2outer.style.transform = 'rotate(0deg)';
        s2mid.style.transform = 'rotate(0deg)';
      }
    }

    // Update ticker
    var phaseEl = document.getElementById('bm-ticker-phase');
    var pctEl = document.getElementById('bm-ticker-pct');
    if (phaseEl) phaseEl.textContent = String(processStep + 1).padStart(2, '0') + '/04';
    if (pctEl) pctEl.textContent = Math.round(stepProgress * 100) + '%';
  }

  // ────────────────────────────────────────────────────────
  // STAGE SCROLL → derive slideIndex + slideProgress
  // ────────────────────────────────────────────────────────
  function onScroll() {
    if (!stageEl) return;
    var rect = stageEl.getBoundingClientRect();
    var vh = window.innerHeight;
    var total = rect.height - vh;
    var pct = total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0;
    var raw = pct * NUM_SLIDES;
    var idx = Math.min(NUM_SLIDES - 1, Math.floor(raw));
    var sub = Math.min(1, raw - idx);

    // Only re-render if something changed enough to matter
    if (idx !== slideIndex || Math.abs(sub - slideProgress) > 0.001) {
      slideIndex = idx;
      slideProgress = sub;
      render();
    }
  }

  // ────────────────────────────────────────────────────────
  // RENDER — apply state to DOM
  // ────────────────────────────────────────────────────────
  function render() {
    // Toggle .active on each slide
    var slides = document.querySelectorAll('#mobile-app .est-slide');
    var isProcess = slideIndex >= 4 && slideIndex <= 7;
    var processStep = Math.max(0, Math.min(3, slideIndex - 4));
    var processSubProgress = isProcess ? slideProgress : (slideIndex < 4 ? 0 : 1);

    slides.forEach(function (slide) {
      var idx = parseInt(slide.getAttribute('data-slide'), 10);
      var active;
      if (slide.classList.contains('est-slide-process')) {
        active = isProcess;
      } else {
        active = idx === slideIndex;
      }
      slide.classList.toggle('active', active);
    });

    // Process slide chrome — counter, dashes
    var counterN = document.getElementById('process-count-n');
    if (counterN) counterN.textContent = String(processStep + 1);

    var dashes = document.querySelectorAll('#mobile-app .est-bridge-dash');
    dashes.forEach(function (d, i) {
      d.classList.toggle('active', isProcess && i <= processStep);
    });

    // Process bridge slides (the 4 text panels inside the process slide)
    var bSlides = document.querySelectorAll('#mobile-app .est-bridge-slide');
    bSlides.forEach(function (b, i) {
      b.classList.toggle('active', isProcess && i === processStep);
    });

    // Bridge motion graphics state
    updateBridgeGraphics(processStep, processSubProgress);

    // Process internal progress bar
    var bridgeFill = document.getElementById('bridge-scrollbar-fill');
    if (bridgeFill) {
      bridgeFill.style.width = (((processStep + processSubProgress) / 4) * 100) + '%';
    }

    // Stage progress bar
    var fill = document.getElementById('stage-progress-fill');
    if (fill) {
      fill.style.width = (((slideIndex + slideProgress) / NUM_SLIDES) * 100) + '%';
    }

    // Stage counter (top-right)
    var counterNow = document.getElementById('stage-counter-now');
    if (counterNow) counterNow.textContent = String(slideIndex + 1).padStart(2, '0');

    // Services progressive reveal (slide 3)
    var svcRows = document.querySelectorAll('#mobile-app .est-svc-row');
    var svcProgress = slideIndex === 3 ? slideProgress : (slideIndex > 3 ? 1 : 0);
    var thresholds = [0.10, 0.35, 0.60];
    svcRows.forEach(function (row, i) {
      row.classList.toggle('revealed', svcProgress >= thresholds[i]);
    });
  }

  // ────────────────────────────────────────────────────────
  // CAROUSEL TRACKING (Work slide)
  // ────────────────────────────────────────────────────────
  function setupCarousel() {
    var track = document.getElementById('mobile-carousel');
    if (!track) return;

    var countEl = document.getElementById('carousel-count');
    var fillEl = document.getElementById('carousel-fill');
    var totalCards = track.querySelectorAll('.est-project-card').length;

    function update() {
      var cardWidth = track.offsetWidth * 0.85;
      var idx = cardWidth > 0 ? Math.round(track.scrollLeft / cardWidth) : 0;
      if (idx === carouselIndex) return;
      carouselIndex = idx;
      if (countEl) countEl.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(totalCards).padStart(2, '0');
      if (fillEl) fillEl.style.width = (((idx + 1) / totalCards) * 100) + '%';
    }

    track.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ────────────────────────────────────────────────────────
  // PROJECT DETAIL SHEET (Work slide → tap a card)
  // ────────────────────────────────────────────────────────
  // A bottom sheet that pulls its content from the tapped card's
  // data-* attributes and displays a larger image, eyebrow, title,
  // body text, and "View Project →" CTA. Opens on tap, closes on
  // backdrop tap, X button, or Escape key.
  //
  // The cards live inside a scroll-snap carousel. We rely on the
  // browser's native click semantics: a click event fires on a tap
  // (no horizontal movement) but is suppressed during a swipe-drag.
  // So a plain 'click' handler doesn't conflict with carousel
  // swiping — no manual touch tracking needed.
  function setupProjectSheet() {
    var sheet = document.getElementById('project-sheet');
    if (!sheet) return;

    var imageEl   = document.getElementById('project-sheet-image');
    var eyebrowEl = document.getElementById('project-sheet-eyebrow');
    var titleEl   = document.getElementById('project-sheet-title');
    var textEl    = document.getElementById('project-sheet-text');
    var ctaEl     = document.getElementById('project-sheet-cta');

    function openSheet(card) {
      imageEl.style.backgroundImage =
        'url("' + (card.getAttribute('data-project-image') || '') + '")';
      eyebrowEl.textContent = card.getAttribute('data-project-eyebrow') || '';
      titleEl.textContent   = card.getAttribute('data-project-title')   || '';
      textEl.textContent    = card.getAttribute('data-project-body')    || '';
      ctaEl.setAttribute('href', card.getAttribute('data-project-href') || '#');
      sheet.classList.add('open');
      sheet.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeSheet() {
      sheet.classList.remove('open');
      sheet.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    // Open on card tap
    var cards = document.querySelectorAll('#mobile-app .est-project-card');
    cards.forEach(function (card) {
      card.addEventListener('click', function (e) {
        e.preventDefault();
        openSheet(card);
      });
    });

    // Close handlers — any element with [data-sheet-close]
    sheet.querySelectorAll('[data-sheet-close]').forEach(function (el) {
      el.addEventListener('click', closeSheet);
    });

    // Esc closes the sheet
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sheet.classList.contains('open')) {
        closeSheet();
      }
    });
  }

  // ────────────────────────────────────────────────────────
  // INIT
  // ────────────────────────────────────────────────────────
  function init() {
    stageEl = document.getElementById('est-stage');
    if (!stageEl) return; // mobile DOM not present, abort silently

    runCover();
    startClock();
    setupMenu();
    buildBridgeGraphics();
    setupCarousel();
    setupProjectSheet();

    // Throttled scroll listener
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // First render
    onScroll();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();