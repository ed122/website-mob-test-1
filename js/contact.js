/* contact.js — Estrange.1 Contact Page */

/* ── Page fade-in & Header reveal ── */
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');
  
  // ADDED THIS: Fades in the header!
  const mainNav = document.getElementById('main-nav');
  if (mainNav) mainNav.classList.add('visible');
});

/* ── Roman numeral clock ── */
(function initClock() {
  const ROMAN = {
    M:1000, CM:900, D:500, CD:400,
    C:100,  XC:90,  L:50,  XL:40,
    X:10,   IX:9,   V:5,   IV:4, I:1
  };
  function toRoman(n) {
    let r = '';
    for (const [k, v] of Object.entries(ROMAN)) {
      while (n >= v) { r += k; n -= v; }
    }
    return r;
  }
  function tick() {
    const now = new Date();
    const h = toRoman(now.getHours())   || 'XII';
    const m = toRoman(now.getMinutes()) || 'O';
    const y = toRoman(now.getSeconds());
    
    // FIXED: Changed 'ct-clock' to 'roman-clock' to match your HTML
    const el = document.getElementById('roman-clock');
    if (el) el.textContent = `${h}:${m}:${y}`;
  }
  tick();
  setInterval(tick, 1000);
})();

/* ── Form submit — animate logo + submit to Netlify ── */
const form = document.getElementById('ct-contact-form');
const submitBtn = document.getElementById('ct-submit-btn');

if (form && submitBtn) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const logoPath = document.getElementById('ct-logo-path');
    const label = submitBtn.querySelector('.ct-submit-label');

    // Animate the logo
    if (logoPath) {
      var len = logoPath.getTotalLength();
      logoPath.style.strokeDasharray = len;
      logoPath.style.strokeDashoffset = len;
      logoPath.getBoundingClientRect();
      logoPath.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)';
      logoPath.style.strokeDashoffset = '0';
    }

    submitBtn.style.pointerEvents = 'none';

    // Submit the form data to Netlify via fetch
    const formData = new FormData(form);
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData).toString()
    })
    .then(() => {
      if (label) {
        setTimeout(() => { label.textContent = 'MESSAGE SENT ✓'; }, 1200);
      }
      form.reset();
    })
    .catch(() => {
      if (label) label.textContent = 'ERROR — TRY AGAIN';
      submitBtn.style.pointerEvents = 'auto';
    });
  });
}


/* ── Auto-scroll to Form Section (Bulletproof Version) ── */
let isAutoScrolling = false;

window.addEventListener('wheel', (e) => {
  // Only trigger if we are at the very top of the page
  if (window.scrollY === 0 && !isAutoScrolling) {
    
    // If the user scrolls downward
    if (e.deltaY > 0) {
      e.preventDefault(); // STOP the browser from fighting our animation!
      isAutoScrolling = true;
      
      const formSection = document.getElementById('ct-form-section'); 
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth' });
        
        // Reset the lock after the smooth scroll animation finishes (approx 1 second)
        // This allows them to naturally scroll back up later
        setTimeout(() => {
          isAutoScrolling = false;
        }, 1000);
      }
    }
  }
}, { passive: false }); // passive: false is required to let us use e.preventDefault()

const progressFill = document.querySelector('.scroll-progress-fill');

function updateScrollProgress() {
  if (!progressFill) return;
  const scrollTop    = window.scrollY || document.documentElement.scrollTop;
  const docHeight    = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressFill.style.height = scrollPercent + '%';
}

window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress(); // run once on load


