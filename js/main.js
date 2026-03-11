/* ============================================
   NH1 MOTO — Main JavaScript Engine
   Scroll reveals, ripple, gamification, quiz
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // =====================
  // 1. NAVBAR SCROLL
  // =====================
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const isHome = navbar.classList.contains('transparent');
    const handleScroll = () => {
      if (window.scrollY > 60) navbar.classList.add('scrolled');
      else if (isHome) navbar.classList.remove('scrolled');
    };
    if (!isHome) navbar.classList.add('scrolled');
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    document.addEventListener('click', e => {
      if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) navLinks.classList.remove('open');
    });
  }

  // =====================
  // 2. SCROLL REVEAL
  // =====================
  // First, initialize staggered children with base classes and delay
  document.querySelectorAll('.reveal-stagger').forEach(parent => {
    Array.from(parent.children).forEach((child, i) => {
      child.classList.add('reveal');
      child.style.transitionDelay = `${i * 100}ms`;
    });
  });

  // Then observe all .reveal elements
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => revealObs.observe(el));
  }

  // =====================
  // 3. STATS COUNTER
  // =====================
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (statNumbers.length) {
    const countObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target);
          const suffix = el.dataset.suffix || '';
          const duration = 2000;
          const start = performance.now();
          const animate = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(target * eased).toLocaleString() + suffix;
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          countObs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    statNumbers.forEach(s => countObs.observe(s));
  }

  // =====================
  // 4. RIPPLE EFFECT
  // =====================
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  // =====================
  // 5. FAQ ACCORDION
  // =====================
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  // =====================
  // 6. FLEET FILTER
  // =====================
  const filterTabs = document.querySelectorAll('.filter-tab');
  const fleetCards = document.querySelectorAll('.fleet-card[data-category]');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.filter;
      fleetCards.forEach(card => {
        if (cat === 'all' || card.dataset.category === cat) {
          card.style.display = '';
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => { card.style.display = 'none'; }, 300);
        }
      });
    });
  });

  // =====================
  // 7. GAMIFICATION ENGINE
  // =====================
  const STAMPS = [
    { id: 'first_ride', name: 'First Ride', icon: '🏠', desc: 'Opened the website' },
    { id: 'gearhead', name: 'Gearhead', icon: '🏍️', desc: 'Explored the fleet' },
    { id: 'route_scout', name: 'Route Scout', icon: '🗺️', desc: 'Checked routes' },
    { id: 'road_diary', name: 'Road Diary', icon: '📝', desc: 'Read the blog' },
    { id: 'curious_rider', name: 'Curious Rider', icon: '❓', desc: 'Visited FAQ' },
    { id: 'connected', name: 'Connected', icon: '📞', desc: 'Visited contact' },
    { id: 'quiz_champion', name: 'Quiz Champion', icon: '🎯', desc: 'Completed the quiz' },
    { id: 'night_rider', name: 'Night Rider', icon: '🌙', desc: 'Visited at night' },
  ];

  function getUnlocked() {
    try { return JSON.parse(localStorage.getItem('nh1_stamps') || '[]'); } catch { return []; }
  }
  function saveUnlocked(arr) { localStorage.setItem('nh1_stamps', JSON.stringify(arr)); }

  function unlockStamp(id) {
    const unlocked = getUnlocked();
    if (unlocked.includes(id)) return;
    unlocked.push(id);
    saveUnlocked(unlocked);
    const stamp = STAMPS.find(s => s.id === id);
    if (stamp) showToast(`${stamp.icon} Stamp Unlocked: ${stamp.name}!`);
    updatePassportUI();
    if (unlocked.length === 1) fireConfetti();
  }

  function showToast(message) {
    const container = document.querySelector('.toast-container') || (() => {
      const c = document.createElement('div');
      c.className = 'toast-container';
      document.body.appendChild(c);
      return c;
    })();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">🏆</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  function fireConfetti() {
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const pieces = [];
    const colors = ['#E67E22', '#2C3E50', '#27ae60', '#e74c3c', '#f39c12', '#9b59b6'];
    for (let i = 0; i < 120; i++) {
      pieces.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.5) * 16 - 6,
        w: Math.random() * 8 + 4,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * 360,
        rotV: (Math.random() - 0.5) * 12,
        gravity: 0.25,
      });
    }
    let frame = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rot += p.rotV;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - frame / 90);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      frame++;
      if (frame < 90) requestAnimationFrame(animate);
      else canvas.remove();
    }
    animate();
  }

  // Passport Drawer
  const fab = document.querySelector('.passport-fab');
  const drawer = document.querySelector('.passport-drawer');
  const overlay = document.querySelector('.passport-overlay');
  const passportClose = document.querySelector('.passport-close');

  function openPassport() { drawer?.classList.add('open'); overlay?.classList.add('open'); }
  function closePassport() { drawer?.classList.remove('open'); overlay?.classList.remove('open'); }
  fab?.addEventListener('click', openPassport);
  overlay?.addEventListener('click', closePassport);
  passportClose?.addEventListener('click', closePassport);

  function updatePassportUI() {
    const unlocked = getUnlocked();
    const badge = document.querySelector('.passport-badge');
    if (badge) badge.textContent = unlocked.length;
    const fill = document.querySelector('.passport-progress-fill');
    if (fill) fill.style.width = ((unlocked.length / STAMPS.length) * 100) + '%';
    const progressText = document.querySelector('.passport-progress-text');
    if (progressText) progressText.textContent = `${unlocked.length} / ${STAMPS.length} stamps`;
    STAMPS.forEach(s => {
      const el = document.querySelector(`.stamp[data-stamp="${s.id}"]`);
      if (el && unlocked.includes(s.id)) el.classList.add('unlocked');
    });
  }

  // Auto-unlock page stamps
  const pageStamps = {
    'index': 'first_ride',
    'fleet': 'gearhead',
    'routes': 'route_scout',
    'blog': 'road_diary',
    'faq': 'curious_rider',
    'contact': 'connected',
  };
  const path = window.location.pathname;
  const pageName = path.split('/').pop().replace('.html', '') || 'index';
  if (pageStamps[pageName]) {
    setTimeout(() => unlockStamp(pageStamps[pageName]), 1500);
  }

  // Night rider
  const hour = new Date().getHours();
  if (hour >= 21 || hour < 6) {
    setTimeout(() => unlockStamp('night_rider'), 3000);
  }

  updatePassportUI();

  // =====================
  // 8. BIKE FINDER QUIZ
  // =====================
  const quizModal = document.querySelector('.quiz-modal');
  const quizSteps = document.querySelectorAll('.quiz-step');
  const quizDots = document.querySelectorAll('.quiz-dot');
  const quizResult = document.querySelector('.quiz-result');
  let currentStep = 0;
  const answers = [];

  document.querySelectorAll('[data-open-quiz]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (quizModal) {
        quizModal.classList.add('active');
        resetQuiz();
      }
    });
  });
  document.querySelector('.quiz-close')?.addEventListener('click', () => quizModal?.classList.remove('active'));
  quizModal?.addEventListener('click', e => { if (e.target === quizModal) quizModal.classList.remove('active'); });

  document.querySelectorAll('.quiz-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const step = opt.closest('.quiz-step');
      step.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      answers[currentStep] = opt.dataset.value;

      setTimeout(() => {
        if (currentStep < quizSteps.length - 1) {
          quizSteps[currentStep].classList.remove('active');
          quizDots[currentStep]?.classList.remove('active');
          quizDots[currentStep]?.classList.add('done');
          currentStep++;
          quizSteps[currentStep].classList.add('active');
          quizDots[currentStep]?.classList.add('active');
        } else {
          showQuizResult();
        }
      }, 400);
    });
  });

  function resetQuiz() {
    currentStep = 0;
    answers.length = 0;
    quizSteps.forEach((s, i) => { s.classList.toggle('active', i === 0); });
    quizDots.forEach((d, i) => { d.classList.remove('done'); d.classList.toggle('active', i === 0); });
    if (quizResult) quizResult.classList.remove('active');
    document.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
    document.querySelector('.quiz-steps-wrap')?.style.setProperty('display', '');
  }

  function showQuizResult() {
    const bikes = {
      'himalayan_452': { name: 'Royal Enfield Himalayan 452', icon: '🏔️', tagline: 'The ultimate mountain beast — built for passes above 15,000 ft.' },
      'scram_411': { name: 'RE Himalayan Scram 411', icon: '⛰️', tagline: 'Light, versatile, and ready for anything the trail throws at you.' },
      'hunter_350': { name: 'Royal Enfield Hunter 350', icon: '🏙️', tagline: 'Nimble city escapes with serious style.' },
      'classic_350': { name: 'Royal Enfield Classic 350', icon: '🛣️', tagline: 'Highway cruising in timeless comfort.' },
      'yezdi_adv': { name: 'Yezdi Adventure', icon: '🧭', tagline: 'Bold, capable, and born for the unknown.' },
      'access_125': { name: 'Suzuki Access 125', icon: '🛵', tagline: 'Easy rides and scenic scoots around town.' },
    };

    let bikeKey = 'scram_411'; // default
    const [terrain, exp, style] = answers;
    if (terrain === 'high_altitude' && exp === 'experienced') bikeKey = 'himalayan_452';
    else if (terrain === 'high_altitude') bikeKey = 'scram_411';
    else if (terrain === 'offroad') bikeKey = exp === 'experienced' ? 'yezdi_adv' : 'scram_411';
    else if (terrain === 'highway') bikeKey = style === 'comfort' ? 'classic_350' : 'hunter_350';
    else if (terrain === 'city') bikeKey = style === 'comfort' ? 'access_125' : 'hunter_350';

    const bike = bikes[bikeKey];
    const resultEl = document.querySelector('.quiz-result');
    if (resultEl) {
      resultEl.querySelector('.result-bike').textContent = bike.icon;
      resultEl.querySelector('.result-name').textContent = bike.name;
      resultEl.querySelector('.result-tagline').textContent = bike.tagline;
      resultEl.classList.add('active');
    }
    document.querySelector('.quiz-steps-wrap')?.style.setProperty('display', 'none');
    unlockStamp('quiz_champion');
  }

  // =====================
  // 9. PARALLAX (subtle)
  // =====================
  const hero = document.querySelector('.hero');
  if (hero) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        const video = hero.querySelector('.hero-video');
        if (video) video.style.transform = `translateY(${y * 0.3}px)`;
      }
    }, { passive: true });
  }

  // =====================
  // 10. BLOG LIBRARY
  // =====================

  // Blog Search & Filter (hub page)
  const blogSearch = document.querySelector('.blog-search');
  const blogFilterTabs = document.querySelectorAll('.blog-filter-tab');
  const blogPreviewCards = document.querySelectorAll('.blog-preview-card');
  const blogPartHeaders = document.querySelectorAll('.blog-part-header');
  const blogNoResults = document.querySelector('.blog-no-results');

  if (blogSearch) {
    blogSearch.addEventListener('input', () => {
      const q = blogSearch.value.toLowerCase().trim();
      filterBlogs(q, getActiveFilter());
    });
  }

  blogFilterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      blogFilterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const q = blogSearch ? blogSearch.value.toLowerCase().trim() : '';
      filterBlogs(q, tab.dataset.filter);
    });
  });

  function getActiveFilter() {
    const active = document.querySelector('.blog-filter-tab.active');
    return active ? active.dataset.filter : 'all';
  }

  function filterBlogs(query, category) {
    let visibleCount = 0;
    const visibleParts = new Set();

    blogPreviewCards.forEach(card => {
      const matchesCategory = category === 'all' || card.dataset.category === category;
      const text = (card.dataset.title || '').toLowerCase() + ' ' + (card.dataset.keywords || '').toLowerCase();
      const matchesQuery = !query || text.includes(query);
      const show = matchesCategory && matchesQuery;

      card.style.display = show ? '' : 'none';
      if (show) {
        visibleCount++;
        visibleParts.add(card.dataset.part);
      }
    });

    // Show/hide part headers
    blogPartHeaders.forEach(header => {
      header.style.display = visibleParts.has(header.dataset.part) ? '' : 'none';
    });

    // Show/hide no results message
    if (blogNoResults) {
      blogNoResults.classList.toggle('show', visibleCount === 0);
    }
  }

  // Blog Article Accordion (part pages)
  document.querySelectorAll('.blog-article-header').forEach(header => {
    header.addEventListener('click', () => {
      const article = header.closest('.blog-article');
      const wasOpen = article.classList.contains('open');
      // Close all open articles
      document.querySelectorAll('.blog-article.open').forEach(a => a.classList.remove('open'));
      if (!wasOpen) {
        article.classList.add('open');
        // Scroll into view smoothly
        setTimeout(() => {
          article.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    });
  });

  // Deep link to specific blog from URL hash
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target && target.classList.contains('blog-article')) {
      setTimeout(() => {
        target.classList.add('open');
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }

  // Scroll-to-top button
  const scrollTopBtn = document.querySelector('.scroll-top-btn');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Blog part nav active state
  const blogPartLinks = document.querySelectorAll('.blog-part-link');
  if (blogPartLinks.length) {
    const blogArticles = document.querySelectorAll('.blog-article');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          blogPartLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.2, rootMargin: '-100px 0px -60% 0px' });
    blogArticles.forEach(article => observer.observe(article));
  }

});
