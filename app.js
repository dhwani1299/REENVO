/**
 * REENVO: Editorial Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveals();
  initThemeChanger();
  initForm();
});

/* =========================================
   1. SCROLL REVEALS
   Smooth intersection observers simulating a GSAP scroll trigger
   ========================================= */
function initScrollReveals() {
  const elements = document.querySelectorAll('.fade-up');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Add 'visible' class when element enters viewport
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,  // Trigger when 10% visible
    rootMargin: "0px 0px -50px 0px"
  });

  elements.forEach(el => observer.observe(el));
}

/* =========================================
   2. DYNAMIC THEME SHIFTS (Scroll Storytelling)
   Changes the body class to update colors based on the section
   Most bulletproof method: Calculate middle of screen on scroll.
   ========================================= */
function initThemeChanger() {
  const sections = document.querySelectorAll('section[data-theme]');
  
  function updateTheme() {
    const scrollMiddle = window.scrollY + (window.innerHeight / 2);
    let activeTheme = 'light'; // fallback
    
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const bottom = top + sec.offsetHeight;
      
      if (scrollMiddle >= top && scrollMiddle < bottom) {
        activeTheme = sec.getAttribute('data-theme');
      }
    });

    const bodyClass = `theme-${activeTheme}`;
    if (!document.body.classList.contains(bodyClass)) {
      // Remove specifically our theme classes, keep others if any
      document.body.classList.remove('theme-light', 'theme-dark', 'theme-brand');
      document.body.classList.add(bodyClass);
    }
  }

  // Use a throttling mechanism if performance drops, 
  // but modern browsers handle this listener fine.
  window.addEventListener('scroll', updateTheme);
  window.addEventListener('resize', updateTheme);
  
  // Set initial theme on load
  updateTheme();
}

/* =========================================
   3. CONTACT FORM SIMULATION
   Creates a smooth interaction for the contact form
   ========================================= */
function initForm() {
  const form = document.getElementById('masterForm');
  const alert = document.getElementById('successAlert');
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const btn = form.querySelector('button');
      btn.innerText = 'Sending...';
      btn.disabled = true;
      btn.style.opacity = '0.7';
      
      // Simulate network
      setTimeout(() => {
        form.style.display = 'none';
        alert.style.display = 'flex';
      }, 1000);
    });
  }
}
