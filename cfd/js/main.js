/* ═══════════════════════════════════════════════════════════
   CFD HOME DECO _ANTIQUES — Main JS
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Inicializar Lucide Icons ──────────────────────────────
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // ── Referencias DOM ────────────────────────────────────────
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');
  const navLinks  = navMenu.querySelectorAll('a');
  const fadeEls   = document.querySelectorAll('.fade-in');

  // ──────────────────────────────────────────────────────────
  // 1. NAVBAR — sticky + scroll effect
  // ──────────────────────────────────────────────────────────
  function handleNavbarScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  // ──────────────────────────────────────────────────────────
  // 2. MOBILE MENU — hamburger toggle
  // ──────────────────────────────────────────────────────────
  function openMenu() {
    hamburger.classList.add('open');
    navMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeMenu() : openMenu();
  });

  navLinks.forEach(link => link.addEventListener('click', closeMenu));

  document.addEventListener('click', (e) => {
    if (
      navMenu.classList.contains('open') &&
      !navMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // ──────────────────────────────────────────────────────────
  // 3. SMOOTH SCROLL — con offset del navbar
  // ──────────────────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ──────────────────────────────────────────────────────────
  // 4. FADE-IN on scroll — Intersection Observer
  // ──────────────────────────────────────────────────────────
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  fadeEls.forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.05}s`;
    observer.observe(el);
  });

  // ──────────────────────────────────────────────────────────
  // 5. MODALES — SERVICIOS
  // ──────────────────────────────────────────────────────────
  const serviceCards  = document.querySelectorAll('.service-card[data-modal]');
  const modalOverlays = document.querySelectorAll('.modal-overlay');

  function openModal(modalId) {
    const overlay = document.getElementById(modalId);
    if (!overlay) return;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    const closeBtn = overlay.querySelector('.modal__close');
    if (closeBtn) setTimeout(() => closeBtn.focus(), 50);
  }

  function closeModal(overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function closeAllModals() {
    modalOverlays.forEach(overlay => closeModal(overlay));
  }

  serviceCards.forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.modal));

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card.dataset.modal);
      }
    });
  });

  modalOverlays.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  document.querySelectorAll('.modal__close').forEach(btn => {
    btn.addEventListener('click', () => {
      const overlay = btn.closest('.modal-overlay');
      if (overlay) closeModal(overlay);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });

  // ──────────────────────────────────────────────────────────
  // 6. CARRUSEL — RESEÑAS
  // ──────────────────────────────────────────────────────────
  const track        = document.getElementById('reviewsTrack');
  const dotsContainer = document.getElementById('reviewsDots');

  if (track && dotsContainer) {
    const cards = Array.from(track.querySelectorAll('.review-card'));
    const total = cards.length;
    let current  = 0;
    let autoTimer = null;

    // Generar dots dinámicamente
    const dots = cards.map((_, i) => {
      const dot = document.createElement('button');
      dot.classList.add('reviews__dot');
      dot.setAttribute('aria-label', `Ir a reseña ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        goTo(i);
        resetAuto();
      });
      dotsContainer.appendChild(dot);
      return dot;
    });

    function getSlideOffset(index) {
      // El contenedor (overflow:hidden) marca exactamente el ancho de una card
      const cardW = track.parentElement.clientWidth;
      return index * cardW;
    }

    function goTo(index) {
      current = ((index % total) + total) % total;
      track.style.transform = `translateX(-${getSlideOffset(current)}px)`;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    }

    function next() { goTo(current + 1); }

    function startAuto() {
      autoTimer = setInterval(next, 4000);
    }

    function stopAuto() {
      clearInterval(autoTimer);
      autoTimer = null;
    }

    function resetAuto() {
      stopAuto();
      startAuto();
    }

    // Pausar al hover
    const carousel = track.closest('.reviews__carousel');
    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);

    // Soporte touch / swipe
    let touchStartX = 0;

    track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      stopAuto();
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (diff > 50)       next();
      else if (diff < -50) goTo(current - 1);
      startAuto();
    }, { passive: true });

    // Recalcular offset al cambiar tamaño de ventana
    window.addEventListener('resize', () => goTo(current), { passive: true });

    startAuto();
  }

});
