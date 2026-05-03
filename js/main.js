/* ============================================================
   ESTRANGE STUDIO — main.js
   1. Auto-lift landing cover after page load
   2. Sticky nav: glass effect, hides on scroll down (1.1× section),
      reappears on scroll up
   3. Roman numeral local time clock
   4. Folder panel interaction (Who Are We section)
      — folder-1 partially open by default
   5. Scroll-reveal via IntersectionObserver
============================================================ */

(function () {
  'use strict';

  /* ── DOM refs ── */
  const cover   = document.getElementById('landing-cover');
  const mainNav = document.getElementById('main-nav');
  const clockEl = document.getElementById('roman-clock');

  /* ── Check if animation has already played this session ── */
  const ANIMATION_KEY = 'estrange_animation_played';
  const hasAnimationPlayed = sessionStorage.getItem(ANIMATION_KEY) === 'true';

  // Mathematical Bezier Curve equivalent (Ease In/Out Cubic)
  // Starts slow, accelerates, then softly decelerates into place
 /* ── Global scroll utilities ── */
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function customScrollTo(targetY, duration) {
    var startY = window.scrollY;
    var distance = targetY - startY;
    var startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      var timeElapsed = currentTime - startTime;
      var progress = Math.min(timeElapsed / duration, 1);
      var easeProgress = easeInOutCubic(progress);
      window.scrollTo(0, startY + (distance * easeProgress));
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        isAutoScrolling = false;
        scrollAccumulator = 0;
      }
    }
    requestAnimationFrame(animation);
  }
  var isAutoScrolling = false;
  var scrollAccumulator = 0;
  var scrollTimeout;

  /* ────────────────────────────────────────────────────────
     1. AUTO-LIFT COVER
     Lifts automatically once all resources are ready.
     800ms minimum so the blue square registers visually.
  ──────────────────────────────────────────────────────── */
  const heroOverlay = document.querySelector('.hero-overlay');
  const heroSubheading = document.querySelector('.hero-subheading');

 /* ── Logo draw animation with alphabet grid ── */
  var logoPath = document.getElementById('logo-path');
  var letterGrid = document.getElementById('letter-grid');
  var spellWord = document.getElementById('spell-word');
  var gridLetters = document.querySelectorAll('.grid-letter');
  var logoLen = 0;

  if (logoPath) {
    logoPath.style.opacity = '0';
  }

  // Spell sequence — letter, grid row, grid col, progress threshold
  var SPELL = [
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
  if (spellWord) {
    SPELL.forEach(function(item) {
      var span = document.createElement('span');
      span.textContent = item.letter;
      span.setAttribute('data-idx', SPELL.indexOf(item));
      spellWord.appendChild(span);
    });
  }

  function updateGridHighlights(progress) {
    // Reset all
    gridLetters.forEach(function(el) {
      el.classList.remove('lit');
    });

    // Light up reached letters
    SPELL.forEach(function(item, idx) {
      if (progress >= item.progress) {
        // Find the matching grid letter
        gridLetters.forEach(function(el) {
          if (el.getAttribute('data-row') === String(item.row) &&
              el.getAttribute('data-col') === String(item.col)) {
            el.classList.add('lit');
          }
        });
        // Light up .1 suffix after last letter
        var suffix = document.getElementById('spell-suffix');
        if (suffix) {
          if (progress >= 0.95) {
            suffix.classList.add('lit');
          } else {
            suffix.classList.remove('lit');
          }
        }
        // Light up spell word span
        if (spellWord) {
          var spans = spellWord.querySelectorAll('span');
          if (spans[idx]) spans[idx].classList.add('lit');
        }
      }
    });
  }

  function liftCover() {
    if (!cover) return;
    cover.classList.add('lift');
    setTimeout(function() {
      if (mainNav) mainNav.classList.add('visible');
      var heroSec = document.getElementById('sec-hero');
      if (heroSec) heroSec.classList.add('hero-active');
      cover.style.pointerEvents = 'none';

      if (heroSubheading) {
        setTimeout(function() {
          heroSubheading.classList.add('visible');
        }, 800);
      }
    }, 700);
  }
  /* ── Skip animation entirely (for return visits) ── */
function skipAnimation() {
  if (cover) {
    cover.style.transition = 'none';
    cover.classList.add('lift');
    cover.style.pointerEvents = 'none';
  }
  if (mainNav) mainNav.classList.add('visible');
  var heroSec = document.getElementById('sec-hero');
  if (heroSec) heroSec.classList.add('hero-active');
  if (logoPath) {
    logoPath.style.opacity = '1';
    logoPath.style.strokeDashoffset = '0';
  }
  if (heroSubheading) heroSubheading.classList.add('visible');
  updateGridHighlights(1);
  
  var spellWrap = document.getElementById('spell-word-wrap');
  if (spellWrap) spellWrap.classList.add('visible');
  var suffix = document.getElementById('spell-suffix');
  if (suffix) suffix.classList.add('lit');
  if (spellWord) {
    var spans = spellWord.querySelectorAll('span');
    spans.forEach(function(span) { span.classList.add('lit'); });
  }
}

  function animateLogoAndLift() {
    if (!cover || !logoPath) return;
    sessionStorage.setItem(ANIMATION_KEY, 'true');
    // Phase 1: Fade in grid
    if (letterGrid) letterGrid.style.opacity = '1';

    // Phase 2: Start drawing after grid is visible
    setTimeout(function() {
      logoLen = logoPath.getTotalLength();
      logoPath.style.strokeDasharray = logoLen;
      logoPath.style.strokeDashoffset = logoLen;
      logoPath.getBoundingClientRect();
      logoPath.style.opacity = '1';

      var spellWrap = document.getElementById('spell-word-wrap');
      if (spellWrap) spellWrap.classList.add('visible');

      var drawDuration = 2400;
      var startTime = performance.now();

      function drawFrame(now) {
        var elapsed = now - startTime;
        var p = Math.min(elapsed / drawDuration, 1);

        var eased;
        if (p < 0.3) {
          eased = 0.15 * Math.pow(p / 0.3, 2);
        } else {
          var t = (p - 0.3) / 0.7;
          eased = 0.15 + 0.85 * (1 - Math.pow(1 - t, 3));
        }

        logoPath.style.strokeDashoffset = logoLen * (1 - eased);
        updateGridHighlights(eased);

        if (p < 1) {
          requestAnimationFrame(drawFrame);
        } else {
          // Hold, then lift
          setTimeout(liftCover, 800);
        }
      }

      requestAnimationFrame(drawFrame);
    }, 700);
  }

  if (hasAnimationPlayed) {
    if (document.readyState === 'complete') {
      skipAnimation();
    } else {
      window.addEventListener('load', skipAnimation);
    }
  } else {
    if (document.readyState === 'complete') {
      setTimeout(animateLogoAndLift, 300);
    } else {
      window.addEventListener('load', function() {
        setTimeout(animateLogoAndLift, 300);
      });
    }
  }

  window.addEventListener('scroll', function onFirstScroll() {
    if (logoPath) {
      logoPath.style.opacity = '1';
      logoPath.style.strokeDashoffset = '0';
    }
    updateGridHighlights(1);
    liftCover();
    window.removeEventListener('scroll', onFirstScroll);
  }, { passive: true });
  /* ────────────────────────────────────────────────────────
     2. SCROLL-AWARE HEADER
     - Shows when cover lifts (handled above)
     - Hides when user scrolls DOWN past 1.1× viewport height
     - Reappears when user scrolls UP
  ──────────────────────────────────────────────────────── */
  let lastScrollY    = 0;
  let navIsVisible   = false;
  const HIDE_THRESHOLD = window.innerHeight * 0.8; /* 1.1× section height */

  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;

    /* Only run hide/show logic once nav has been revealed */
    if (!mainNav.classList.contains('visible')) {
      lastScrollY = currentY;
      return;
    }

    const scrollingDown = currentY > lastScrollY;
    const pastThreshold = currentY > HIDE_THRESHOLD;

    if (scrollingDown && pastThreshold) {
      /* Scrolling down past threshold — tuck nav away */
      mainNav.classList.add('nav-hidden');
    } else if (!scrollingDown) {
      /* Scrolling up — bring nav back */
      mainNav.classList.remove('nav-hidden');
    }

    lastScrollY = currentY;
  }, { passive: true });

  /* ────────────────────────────────────────────────────────
     3. ROMAN NUMERAL CLOCK
     Displays local time as  H · M · S  in Roman numerals
  ──────────────────────────────────────────────────────── */
  const toRoman = (n) => {
    if (n === 0) return 'O';
    const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
    const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
    let out = '';
    vals.forEach((v, i) => { while (n >= v) { out += syms[i]; n -= v; } });
    return out;
  };

  function updateClock() {
    if (!clockEl) return;
    const now = new Date();
    clockEl.textContent =
      toRoman(now.getHours())   + ':' +
      toRoman(now.getMinutes()) + ':' +
      toRoman(now.getSeconds());
  }

  if (clockEl) {
    updateClock();
    setInterval(updateClock, 1000);
  }

  /* ────────────────────────────────────────────────────────
     4. FOLDER PANEL INTERACTION
     Folders are 105px-wide vertical strips tucked to the right.
     Clicking one slides it fully open (full page width).
     Minimise button slides it back to resting state.

     DEFAULT STATE: folder-1 (brown) is partially open
     to hint at the content inside.
  ──────────────────────────────────────────────────────── */
  const foldersWrap = document.querySelector('.who-folders');
  const folders     = document.querySelectorAll('.folder');

  const folder1 = document.getElementById('folder-1');

  const isMobile = () => window.innerWidth <= 768;

  function openFolder(folder) {
    const isOpen = folder.classList.contains('open');

    if (isMobile()) {
      /* Mobile: accordion — toggle this folder, close others */
      if (isOpen) {
        folder.classList.remove('open');
      } else {
        folders.forEach(f => f.classList.remove('open'));
        folder.classList.add('open');
        if (foldersWrap) foldersWrap.classList.add('folders--used');
      }
      return;
    }

    /* Desktop: original behaviour — reset all, then open if it was closed */
    folders.forEach(f => f.classList.remove('open'));
    if (foldersWrap) {
      foldersWrap.classList.remove(
        'folder-1-open', 'folder-2-open', 'folder-3-open'
      );
    }

    if (!isOpen) {
      folder.classList.add('open');
      if (foldersWrap) foldersWrap.classList.add('folders--used');
      if (foldersWrap) foldersWrap.classList.add(`${folder.id}-open`);
    }
  }

  /* Attach click to each folder's TAB — opens the folder */
  folders.forEach(folder => {
    const tab = folder.querySelector('.folder-tab');
    if (tab) tab.addEventListener('click', (e) => {
      e.stopPropagation();
      openFolder(folder);
    });

    /* Clicking the whole folder when closed also opens it (desktop only) */
    folder.addEventListener('click', (e) => {
      if (!isMobile() && !folder.classList.contains('open')) openFolder(folder);
    });

    /* Minimise button — resets to resting state (desktop only) */
    const minBtn = folder.querySelector('.folder-minimise');
    if (minBtn) minBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      folders.forEach(f => f.classList.remove('open'));
      if (foldersWrap) {
        foldersWrap.classList.remove(
          'folder-1-open', 'folder-2-open', 'folder-3-open'
        );
      }
    });
  });

/* ────────────────────────────────────────────────────────
     4.5 AUTO-SCROLL PAST HERO (Desktop Only)
     Requires 3-4 wheel clicks of intent.
     Custom easeInOutCubic Bezier curve animation.
  ──────────────────────────────────────────────────────── */
  const targetSection = document.getElementById('sec-who'); 

  // Only run on larger screens (Desktop/Laptop)
  if (window.innerWidth > 1024 && targetSection) {
    // Delay attaching until cover has lifted
    setTimeout(() => {
    
    window.addEventListener('wheel', (e) => {
      
      // 1. If we are currently animating, block the scroll completely
      if (isAutoScrolling) {
        e.preventDefault();
        return;
      }

      // 2. Check if the user is at the top of the page
      if (window.scrollY < 10) {
        
        if (e.deltaY > 0) { // User is scrolling DOWN
          e.preventDefault(); // Stop native choppy scrolling
          
          // Accumulate the scroll effort (1 wheel click is usually ~100 delta)
          scrollAccumulator += e.deltaY;
          
          // Clear the reset timer because the user is actively scrolling
          clearTimeout(scrollTimeout);
          
          // If they hit ~3 to 4 clicks worth of scroll intent
          if (scrollAccumulator >= 300) {
            isAutoScrolling = true;
            
            // Find exactly where Section 2 is on the page
            const targetY = targetSection.getBoundingClientRect().top + window.scrollY;
            
            // Fire the custom animation! (1200ms duration for a luxurious feel)
            customScrollTo(targetY, 1200);
            
          } else {
            // If they stop scrolling before hitting 3 clicks, reset the counter after half a second
            scrollTimeout = setTimeout(() => {
              scrollAccumulator = 0;
            }, 500);
          }
        } else {
          // If they scroll UP while at the top, just reset the counter
          scrollAccumulator = 0;
        }
      }
    }, { passive: false }); 
    }, 2000);
  }

  /* ────────────────────────────────────────────────────────
     5. SCROLL REVEAL
     Elements with .reveal class animate in on viewport entry.
  ──────────────────────────────────────────────────────── */
  document.body.classList.add('js-ready');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ── LABEL FADE-UP OBSERVER ──
     Section labels (.label-reveal) fade up into place on scroll entry.
     Threshold 0.05 so it triggers as soon as the section edge enters view.
  */
  const labelObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('label-in-view');
        labelObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });

  document.querySelectorAll('.label-reveal').forEach(el => labelObserver.observe(el));
  /* ── FOLDER SLIDE-IN OBSERVER ──
     Triggers when sec-who is 50% in view.
     Adds .folder-in-view to each folder panel.
  */
  const whoSection = document.getElementById('sec-who');
  if (whoSection) {
    const folderObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.querySelectorAll('.folder').forEach(f => {
            f.classList.add('folder-in-view');
          });
          folderObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    folderObserver.observe(whoSection);
  }

  /* ────────────────────────────────────────────────────────
     6. TYPEWRITER REVEAL (Half-Section Trigger)
     Splits text safely without breaking nested HTML tags,
     and triggers when the section is exactly 50% in view.
  ──────────────────────────────────────────────────────── */
  function applyTypewriter(element) {
    let charIndex = 0;
    
    // Safely walks through text nodes to avoid breaking <br> or <span> tags
    function wrapCharacters(node) {
      if (node.nodeType === 3) { // If it's pure text
        const text = node.nodeValue;
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < text.length; i++) {
          if (text[i] === ' ' || text[i] === '\n') {
            fragment.appendChild(document.createTextNode(text[i])); // Keep spaces normal
          } else {
            const span = document.createElement('span');
            span.className = 'char';
            span.style.setProperty('--char-index', charIndex++); // Inject the math variable!
            span.textContent = text[i];
            fragment.appendChild(span);
          }
        }
        node.parentNode.replaceChild(fragment, node);
      } else if (node.nodeType === 1) { // If it's an HTML element (like <br> or span)
        Array.from(node.childNodes).forEach(wrapCharacters); // Go deeper
      }
    }
    
    Array.from(element.childNodes).forEach(wrapCharacters);
  }

  // 1. Prep all .type-reveal elements
  document.querySelectorAll('.type-reveal').forEach(applyTypewriter);

  // 2. Create the halfway observer (threshold: 0.5)
  const halfWayObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Find all the text blocks inside this container and animate them
        entry.target.querySelectorAll('.type-reveal').forEach(el => el.classList.add('in-view'));
        halfWayObserver.unobserve(entry.target); // Run once, then stop watching
      }
    });
  }, { threshold: 0.5 }); // Triggers exactly when 50% of the text wrapper is visible

  // 3. Attach the observer to the new text wrapper
  // FIXED: Now watching the specific text container instead of the old ID
  const statementBridge = document.querySelector('.statement-bridge-wrapper');
  if (statementBridge) {
    halfWayObserver.observe(statementBridge);
  }

  /* ────────────────────────────────────────────────────────
     7. CUSTOM SCROLL PROGRESS BAR
     Calculates scroll depth and grows the orange line.
  ──────────────────────────────────────────────────────── */
  const progressFill = document.querySelector('.scroll-progress-fill');

  function updateScrollProgress() {
    if (!progressFill) return;
    
    // How far the user has scrolled down
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    
    // Total scrollable height of the page (Total height - Viewport height)
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    // Calculate percentage (0 to 100)
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    // Apply the percentage to the height of the orange bar
    progressFill.style.height = scrollPercent + '%';
  }

  // Listen for scrolling
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  
  // Run once on load just in case the user refreshes halfway down the page
  updateScrollProgress();

/* ────────────────────────────────────────────────────────
     7.5 HOW WE WORK — Scroll-driven step animation
  ──────────────────────────────────────────────────────── */
  const bridgeSection = document.getElementById('sec-bridge');

  if (bridgeSection) {
    const stepSlides = bridgeSection.querySelectorAll('.bridge-step-slide');
    const descSlides = bridgeSection.querySelectorAll('.bridge-desc-slide');
    const indicators = bridgeSection.querySelectorAll('.bridge-ind');
    const bProgressBar = bridgeSection.querySelector('.bridge-progress-bar');
    const ringFill = bridgeSection.querySelector('.bridge-ring-fill');
    const vertLine = bridgeSection.querySelector('.bridge-vert-line');
    const bgKeywords = bridgeSection.querySelectorAll('.bridge-bg-kw');
    const totalSteps = stepSlides.length;
    const ringCircumference = 2 * Math.PI * 18;

    /* Split description text into characters */
    descSlides.forEach(slide => {
      const p = slide.querySelector('.bridge-desc-text');
      if (!p) return;
      const text = p.textContent;
      p.textContent = '';
      let charIdx = 0;
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') {
          p.appendChild(document.createTextNode(' '));
        } else {
          const span = document.createElement('span');
          span.className = 'b-char';
          span.textContent = text[i];
          span.style.transitionDelay = (0.3 + charIdx * 0.012) + 's';
          charIdx++;
          p.appendChild(span);
        }
      }
    });

    function updateBridgeSection() {
      const rect = bridgeSection.getBoundingClientRect();
      const windowH = window.innerHeight;
      const scrollableH = bridgeSection.offsetHeight - windowH;

      if (rect.top > 0 || rect.bottom < windowH) {
        return;
      }

      const scrolled = -rect.top;
      const pct = Math.min(Math.max(scrolled / scrollableH, 0), 1);
      const activeIdx = Math.min(Math.floor(pct * totalSteps), totalSteps - 1);

      /* Progress bar */
      if (bProgressBar) bProgressBar.style.width = (pct * 100) + '%';

      /* Ring */
      if (ringFill) {
        ringFill.setAttribute('stroke-dashoffset', ringCircumference - (pct * ringCircumference));
      }

      /* Vertical line */
      if (vertLine) vertLine.style.height = (pct * 70) + '%';

      /* Indicators */
      indicators.forEach((ind, i) => {
        ind.classList.toggle('active', i <= activeIdx);
      });

      /* Step slides */
      stepSlides.forEach((slide, i) => {
        slide.classList.remove('is-active', 'is-past', 'is-future');
        if (i === activeIdx) slide.classList.add('is-active');
        else if (i < activeIdx) slide.classList.add('is-past');
        else slide.classList.add('is-future');
      });

      /* Desc slides */
      descSlides.forEach((slide, i) => {
        slide.classList.remove('is-active', 'is-past', 'is-future');
        if (i === activeIdx) slide.classList.add('is-active');
        else if (i < activeIdx) slide.classList.add('is-past');
        else slide.classList.add('is-future');
      });

      /* Background keywords */
      bgKeywords.forEach((kw, i) => {
        kw.classList.toggle('active', i === activeIdx);
      });
    }

    window.addEventListener('scroll', updateBridgeSection, { passive: true });
    updateBridgeSection();
  }
  /* ────────────────────────────────────────────────────────
     8. PORTFOLIO SPLIT — Scroll-driven phase animation
  ──────────────────────────────────────────────────────── */
  var splitSection = document.getElementById('sec-split');

  if (splitSection) {
    var workLink = document.getElementById('nav-work-link');
    if (workLink) {
      workLink.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var scrollableH = splitSection.offsetHeight - window.innerHeight;
        var targetScroll = splitSection.offsetTop + (scrollableH * 0.62);
        window.scrollTo(0, targetScroll);
      });
    }
    document.getElementById('nav-work-link')?.addEventListener('click', function(e) {
      e.preventDefault();
      var scrollableH = splitSection.offsetHeight - window.innerHeight;
      var targetScroll = splitSection.offsetTop + (scrollableH * 0.62);
      window.scrollTo(0, targetScroll);
    });
    var splitMorphEl = document.getElementById('split-morph');
    var morphFrom = 'Two ways to see.';
    var morphTo = 'Explore Portfolio.';
    var lastSplitPhase = 0;
    var splitMorphDone = false;

    // Letter-by-letter morph
    function morphText(el, from, to, progress) {
      var maxLen = Math.max(from.length, to.length);
      var html = '';
      for (var i = 0; i < maxLen; i++) {
        var fc = i < from.length ? from[i] : ' ';
        var tc = i < to.length ? to[i] : ' ';
        var cp = Math.min(Math.max((progress - i * 0.04) / 0.3, 0), 1);
        var showTo = cp > 0.5;
        var ch = showTo ? tc : fc;
        var yOff = showTo ? (1 - Math.min((cp - 0.5) * 2, 1)) * 12 : Math.min(cp * 2, 1) * -12;
        var op = (cp > 0.3 && cp < 0.7) ? 0.4 : 1;
        if (ch === ' ') ch = '&nbsp;';
        html += '<span class="morph-char" style="transform:translateY(' + yOff + 'px);opacity:' + op + '">' + ch + '</span>';
      }
      el.innerHTML = html;
    }

    // Auto-morph animation
    function autoMorph() {
      if (splitMorphDone || !splitMorphEl) return;
      splitMorphDone = true;
      var start = performance.now();
      var duration = 1200;
      var delay = 800;

      function run(now) {
        var elapsed = now - start - delay;
        if (elapsed < 0) { requestAnimationFrame(run); return; }
        var p = Math.min(elapsed / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        morphText(splitMorphEl, morphFrom, morphTo, eased);
        if (p < 1) requestAnimationFrame(run);
      }
      requestAnimationFrame(run);
    }

    // Hover handlers for image reveal
    var splitLeft = document.getElementById('split-left');
    var splitRight = document.getElementById('split-right');
    var leftPanel = document.querySelector('.split-panel--left');
    var rightPanel = document.querySelector('.split-panel--right');

    if (splitLeft) {
      splitLeft.addEventListener('mouseenter', function() {
        if (splitSection.classList.contains('phase-3') || splitSection.classList.contains('phase-4') || splitSection.classList.contains('phase-5')) {
          var img = leftPanel.querySelector('.split-panel-img');
          if (img) { img.style.opacity = '0.9'; img.style.filter = 'grayscale(0%) brightness(0.7)'; }
        }
      });
      splitLeft.addEventListener('mouseleave', function() {
        var img = leftPanel.querySelector('.split-panel-img');
        if (img) { img.style.opacity = '0.7'; img.style.filter = 'grayscale(100%) brightness(0.5)'; }
      });
    }
    if (splitRight) {
      splitRight.addEventListener('mouseenter', function() {
        if (splitSection.classList.contains('phase-3') || splitSection.classList.contains('phase-4') || splitSection.classList.contains('phase-5')) {
          var img = rightPanel.querySelector('.split-panel-img');
          if (img) { img.style.opacity = '0.9'; img.style.filter = 'grayscale(0%) brightness(0.7)'; }
        }
      });
      splitRight.addEventListener('mouseleave', function() {
        var img = rightPanel.querySelector('.split-panel-img');
        if (img) { img.style.opacity = '0.7'; img.style.filter = 'grayscale(100%) brightness(0.5)'; }
      });
    }

// If arriving from stories/realities via hash, scroll to the interactive phase
    if (window.location.hash === '#sec-split') {
      // Skip the landing animation entirely
      if (cover) {
        cover.style.transition = 'none';
        cover.classList.add('lift');
        cover.style.pointerEvents = 'none';
      }
      if (mainNav) mainNav.classList.add('visible');
      var heroSec = document.getElementById('sec-hero');
      if (heroSec) heroSec.classList.add('hero-active');
      if (logoPath) {
        logoPath.style.opacity = '1';
        logoPath.style.strokeDashoffset = '0';
      }
      updateGridHighlights(1);

      // Wait for layout to settle, then scroll
      window.addEventListener('load', function() {
        requestAnimationFrame(function() {
          var scrollableH = splitSection.offsetHeight - window.innerHeight;
          var targetScroll = splitSection.offsetTop + (scrollableH * 0.62);
          window.scrollTo(0, targetScroll);
        });
      });
    }

    function updateSplitSection() {
      /* On mobile the split section is unsticky — skip phase logic */
      if (isMobile()) return;

      var rect = splitSection.getBoundingClientRect();
      var windowH = window.innerHeight;
      var scrollableH = splitSection.offsetHeight - windowH;

      if (rect.top > 0 || rect.bottom < windowH) return;

      var scrolled = -rect.top;
      var pct = Math.min(Math.max(scrolled / scrollableH, 0), 1);

      var newPhase = 0;
      if (pct >= 0.04) newPhase = 1;
      if (pct >= 0.20) newPhase = 2;
      if (pct >= 0.38) newPhase = 3;
      if (pct >= 0.55) newPhase = 4;
      if (pct >= 0.78) newPhase = 5;

      if (newPhase !== lastSplitPhase) {
        // Remove old phase classes
        for (var i = 0; i <= 5; i++) {
          splitSection.classList.remove('phase-' + i);
        }
        splitSection.classList.add('phase-' + newPhase);
        lastSplitPhase = newPhase;

        // Trigger morph when phase 3 hits
        if (newPhase >= 3 && !splitMorphDone) {
          autoMorph();
        }

        // Reset morph if scrolling back
        if (newPhase < 3) {
          splitMorphDone = false;
          if (splitMorphEl) splitMorphEl.textContent = morphFrom;
        }
      }
    }

    /* On mobile: scroll nav-work-link straight to the split section top */
    if (workLink) {
      workLink.addEventListener('click', function(eMob) {
        if (isMobile()) {
          eMob.preventDefault();
          splitSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    window.addEventListener('scroll', updateSplitSection, { passive: true });
    updateSplitSection();
  }

})();
