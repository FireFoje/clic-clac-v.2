const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

const faqItems = document.querySelectorAll('.faq-item');
const faqPanels = document.querySelectorAll('.faq-panel');

faqPanels.forEach((panel) => {
  panel.style.maxHeight = '0px';
});

faqItems.forEach((item) => {
  item.addEventListener('click', () => {
    const isActive = item.classList.contains('active');

    faqItems.forEach((btn) => {
      btn.classList.remove('active');
      const panel = btn.nextElementSibling;
      if (panel && panel.classList.contains('faq-panel')) {
        panel.style.maxHeight = '0px';
      }
    });

    if (!isActive) {
      item.classList.add('active');
      const panel = item.nextElementSibling;
      if (panel && panel.classList.contains('faq-panel')) {
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      }
    }
  });
});

const orderForm = document.querySelector('#order-form');
const orderStatus = document.querySelector('#order-status');

if (orderForm && orderStatus) {
  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(orderForm);
    const size = formData.get('size');
    const configuration = formData.get('configuration');
    const fabric = formData.get('fabric');

    orderStatus.textContent = `Заказ принят: ${size}, ${configuration}, ткань ${fabric}. Наш менеджер свяжется с вами.`;
  });
}

const sections = document.querySelectorAll('.section');
const staggerGroups = document.querySelectorAll('.grid-2, .grid-3, .grid-4, .specs-grid, .pricing-actions');

sections.forEach((section) => section.classList.add('reveal-init'));

staggerGroups.forEach((group) => {
  [...group.children].forEach((item, index) => {
    item.classList.add('stagger-item');
    item.style.setProperty('--stagger-delay', `${index * 70}ms`);
  });
});

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  sections.forEach((section) => revealObserver.observe(section));
  document.querySelectorAll('.stagger-item').forEach((item) => revealObserver.observe(item));
} else {
  sections.forEach((section) => section.classList.add('is-visible'));
  document.querySelectorAll('.stagger-item').forEach((item) => item.classList.add('is-visible'));
}

const navLinks = document.querySelectorAll('.nav a[href^="#"]');
const linkById = {};

navLinks.forEach((link) => {
  const id = link.getAttribute('href').slice(1);
  if (id) {
    linkById[id] = link;
  }
});

if ('IntersectionObserver' in window && Object.keys(linkById).length > 0) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      navLinks.forEach((link) => link.classList.remove('active-link'));
      const activeLink = linkById[entry.target.id];
      if (activeLink) {
        activeLink.classList.add('active-link');
      }
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0.01 });

  Object.keys(linkById).forEach((id) => {
    const section = document.getElementById(id);
    if (section) {
      sectionObserver.observe(section);
    }
  });
}

const transformationSections = document.querySelectorAll('#mechanism .card, #transformation .card');

if ('IntersectionObserver' in window && transformationSections.length > 0) {
  const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        transformationSections.forEach((card) => card.classList.remove('step-active'));
        entry.target.classList.add('step-active');
      }
    });
  }, { threshold: 0.55 });

  transformationSections.forEach((card) => stepObserver.observe(card));
}

const ctaButtons = document.querySelectorAll('.hero-actions .btn-primary, .cta .btn-primary, .pricing-actions .btn-primary');

if ('IntersectionObserver' in window && ctaButtons.length > 0) {
  const ctaObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !prefersReducedMotion) {
        entry.target.classList.add('pulse-active');
      } else {
        entry.target.classList.remove('pulse-active');
      }
    });
  }, { threshold: 0.65 });

  ctaButtons.forEach((button) => {
    ctaObserver.observe(button);
    button.addEventListener('mouseenter', () => button.classList.remove('pulse-active'));
    button.addEventListener('mouseleave', () => {
      if (!prefersReducedMotion) {
        button.classList.add('pulse-active');
      }
    });
    button.addEventListener('focus', () => button.classList.remove('pulse-active'));
    button.addEventListener('blur', () => {
      if (!prefersReducedMotion) {
        button.classList.add('pulse-active');
      }
    });
  });
}

const ratings = document.querySelectorAll('.rating');

if ('IntersectionObserver' in window && ratings.length > 0) {
  const ratingObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const endValue = Number.parseFloat(entry.target.textContent) || 0;
      const duration = prefersReducedMotion ? 0 : 900;
      const startTime = performance.now();

      const tick = (now) => {
        const elapsed = now - startTime;
        const progress = duration ? Math.min(elapsed / duration, 1) : 1;
        const current = (endValue * progress).toFixed(1);
        entry.target.textContent = current;
        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.6 });

  ratings.forEach((rating) => ratingObserver.observe(rating));
}

const reviewGroups = document.querySelectorAll('.grid-3');

reviewGroups.forEach((group) => {
  const reviewCards = group.querySelectorAll('.review-card');
  if (reviewCards.length < 2) {
    return;
  }

  let reviewIndex = 0;
  let reviewTimer = null;

  const setActiveReview = (index) => {
    reviewIndex = (index + reviewCards.length) % reviewCards.length;
    reviewCards.forEach((card, i) => {
      card.classList.toggle('is-dimmed', i !== reviewIndex);
    });
  };

  const startReviewCycle = () => {
    if (prefersReducedMotion) {
      return;
    }

    if (reviewTimer) {
      clearInterval(reviewTimer);
    }

    reviewTimer = setInterval(() => {
      setActiveReview(reviewIndex + 1);
    }, 4200);
  };

  const stopReviewCycle = () => {
    if (reviewTimer) {
      clearInterval(reviewTimer);
      reviewTimer = null;
    }
  };

  setActiveReview(0);
  startReviewCycle();

  group.addEventListener('mouseenter', stopReviewCycle);
  group.addEventListener('mouseleave', startReviewCycle);
  group.addEventListener('touchstart', stopReviewCycle, { passive: true });
  group.addEventListener('touchend', startReviewCycle);

  reviewCards.forEach((card, index) => {
    card.addEventListener('click', () => {
      setActiveReview(index);
      startReviewCycle();
    });
  });
});

const carousel = document.querySelector('#product-carousel');

if (carousel) {
  const track = carousel.querySelector('.carousel-track');
  const images = carousel.querySelectorAll('.carousel-image');
  const dots = carousel.querySelectorAll('.carousel-dot');
  const prevBtn = carousel.querySelector('.carousel-btn-prev');
  const nextBtn = carousel.querySelector('.carousel-btn-next');
  let activeIndex = 0;
  let autoplayId = null;
  let touchStartX = 0;
  let touchEndX = 0;

  const renderSlide = (nextIndex) => {
    activeIndex = (nextIndex + images.length) % images.length;
    track.style.transform = `translateX(-${activeIndex * 100}%)`;

    dots.forEach((dot) => dot.classList.remove('active'));
    dots[activeIndex].classList.add('active');
  };

  if (track && prevBtn && nextBtn && images.length > 0 && dots.length === images.length) {
    prevBtn.addEventListener('click', () => renderSlide(activeIndex - 1));
    nextBtn.addEventListener('click', () => renderSlide(activeIndex + 1));

    const startAutoplay = () => {
      if (autoplayId) {
        clearInterval(autoplayId);
      }
      autoplayId = setInterval(() => {
        renderSlide(activeIndex + 1);
      }, 4000);
    };

    const stopAutoplay = () => {
      if (autoplayId) {
        clearInterval(autoplayId);
        autoplayId = null;
      }
    };

    startAutoplay();
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);

    carousel.addEventListener('touchstart', (event) => {
      touchStartX = event.changedTouches[0].clientX;
      stopAutoplay();
    });

    carousel.addEventListener('touchend', (event) => {
      touchEndX = event.changedTouches[0].clientX;
      const swipeDistance = touchStartX - touchEndX;
      const swipeThreshold = 35;

      if (swipeDistance > swipeThreshold) {
        renderSlide(activeIndex + 1);
      } else if (swipeDistance < -swipeThreshold) {
        renderSlide(activeIndex - 1);
      }

      startAutoplay();
    });

    carousel.addEventListener('mousemove', (event) => {
      if (prefersReducedMotion) {
        return;
      }

      const activeImage = images[activeIndex];
      if (!activeImage) {
        return;
      }

      const bounds = carousel.getBoundingClientRect();
      const offsetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 8;
      const offsetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 8;
      activeImage.style.transform = `scale(1.03) translate(${offsetX}px, ${offsetY}px)`;
    });

    carousel.addEventListener('mouseleave', () => {
      const activeImage = images[activeIndex];
      if (activeImage) {
        activeImage.style.transform = '';
      }
    });
  }
}
