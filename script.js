(function(){
  // Theme toggle
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const THEME_KEY = 'portfolio-theme';

  function applyTheme(theme){
    if(theme === 'dark') root.setAttribute('data-theme','dark');
    else root.removeAttribute('data-theme');
  }

  const saved = localStorage.getItem(THEME_KEY);
  if(saved){
    applyTheme(saved);
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  if(themeToggle){
    themeToggle.addEventListener('click', ()=>{
      const isDark = root.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
      themeToggle.setAttribute('aria-pressed', String(next === 'dark'));
    });
  }

  // Modal project details
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalStack = document.getElementById('modal-stack');
  const modalLink = document.getElementById('modal-link');
  const modalClose = document.getElementById('modal-close');
  let lastFocused = null;

  function openModalFromCard(card){
    lastFocused = document.activeElement;
    const title = card.dataset.title || card.querySelector('h4')?.textContent || '';
    const desc = card.dataset.desc || card.querySelector('p')?.textContent || '';
    const stack = card.dataset.stack || '';
    const link = card.dataset.link || '#';

    if(modalTitle) modalTitle.textContent = title;
    if(modalDesc) modalDesc.textContent = desc;
    if(modalStack) modalStack.textContent = stack;
    if(modalLink) modalLink.href = link;

    if(modal){
      modal.setAttribute('aria-hidden','false');
      if(modalClose) modalClose.focus();
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(){
    if(modal){
      modal.setAttribute('aria-hidden','true');
      document.body.style.overflow = '';
    }
    if(lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('.view-project').forEach(btn => {
    btn.addEventListener('click', (e)=>{
      const card = e.target.closest('.card');
      if(card) openModalFromCard(card);
    });
  });

  if(modalClose){
    modalClose.addEventListener('click', closeModal);
  }
  if(modal){
    modal.addEventListener('click', (e)=>{
      if(e.target === modal) closeModal();
    });
  }
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && modal && modal.getAttribute('aria-hidden') === 'false') closeModal();
  });

  // Copy email
  const copyBtn = document.getElementById('copy-email');
  const emailEl = document.getElementById('email');
  if(copyBtn && emailEl){
    copyBtn.addEventListener('click', async ()=>{
      const email = emailEl.textContent.trim();
      try{
        await navigator.clipboard.writeText(email);
        const prev = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.setAttribute('aria-live','polite');
        setTimeout(()=> copyBtn.textContent = prev, 1400);
      }catch(err){
        // fallback
        window.prompt('Copy email:', email);
      }
    });
  }

  // Smooth scrolling for internal links (same-page)
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const href = a.getAttribute('href');
      if(href === '#') return;
      const target = document.querySelector(href);
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
  });

  // Highlight active nav link: if sections exist on page use observer, otherwise mark link matching current path
  const navLinks = document.querySelectorAll('.nav-link');
  if(navLinks && navLinks.length){
    // First try to match links to sections on the same page
    const sections = Array.from(navLinks).map(a => {
      try{ return document.querySelector(a.getAttribute('href')); }catch(e){return null}
    }).filter(Boolean);

    if(sections.length){
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if(entry.isIntersecting){
            const id = '#' + entry.target.id;
            navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
          }
        });
      }, { root: null, rootMargin: '-40% 0px -40% 0px', threshold: 0 });

      sections.forEach(s => observer.observe(s));

    } else {
      // No same-page sections: set active link based on current location
      const currentPath = location.pathname.replace(/\\/g, '/');
      navLinks.forEach(a => {
        try{
          const linkUrl = new URL(a.href);
          const linkPath = linkUrl.pathname.replace(/\\/g, '/');
          a.classList.toggle('active', linkPath === currentPath || (linkPath === '/' && currentPath.endsWith('index.html')));
        }catch(e){
          // fallback simple compare
          a.classList.toggle('active', a.getAttribute('href') === location.pathname || a.getAttribute('href') === location.hash);
        }
      });
    }
  }

  // Small accessibility: focus visible outlines for keyboard users
  function handleFirstTab(e){
    if(e.key === 'Tab') document.body.classList.add('user-is-tabbing');
  }
  window.addEventListener('keydown', handleFirstTab, {once:true});

})();
