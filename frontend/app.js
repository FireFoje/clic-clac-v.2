const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
const siteHeader = document.querySelector('.site-header');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (navToggle && nav) {
  const closeNav = () => {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    nav.querySelectorAll('.dropdown.open').forEach((dropdown) => dropdown.classList.remove('open'));
  };

  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (!isOpen) {
      nav.querySelectorAll('.dropdown.open').forEach((dropdown) => dropdown.classList.remove('open'));
    }
  });

  document.addEventListener('click', (event) => {
    if (!nav.classList.contains('open')) {
      return;
    }

    if (!event.target.closest('.site-header')) {
      closeNav();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      closeNav();
    }
  });

  const dropdownButton = nav.querySelector('.dropdown-button');
  const dropdown = nav.querySelector('.dropdown');

  if (dropdownButton && dropdown) {
    const isMobileDropdown = () => {
      const isNarrow = window.matchMedia('(max-width: 900px)').matches;
      const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
      return isNarrow || isTouch;
    };

    dropdownButton.addEventListener('click', (event) => {
      if (!isMobileDropdown()) {
        return;
      }

      event.preventDefault();
      dropdown.classList.toggle('open');
    });
  }

  nav.querySelectorAll('a[href^="#"]:not(.dropdown-button)').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 900) {
        closeNav();
      }
    });
  });
}

if (siteHeader) {
  let lastScrollY = window.scrollY;
  const scrollDeltaThreshold = 8;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY;
    const isAtTop = currentScrollY <= 24;
    const isMenuOpen = nav?.classList.contains('open');

    if (isAtTop || isMenuOpen) {
      siteHeader.classList.remove('is-hidden');
      lastScrollY = currentScrollY;
      return;
    }

    if (Math.abs(scrollDelta) < scrollDeltaThreshold) {
      lastScrollY = currentScrollY;
      return;
    }

    if (scrollDelta > 0) {
      siteHeader.classList.add('is-hidden');
    } else {
      siteHeader.classList.remove('is-hidden');
    }

    lastScrollY = currentScrollY;
  }, { passive: true });
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

    orderStatus.textContent = `Ð—Ð°ÐºÐ°Ð· Ð¿Ñ€Ð¸Ð½ÑÑ‚: ${size}, ${configuration}, Ñ‚ÐºÐ°Ð½ÑŒ ${fabric}. ÐÐ°Ñˆ Ð¼ÐµÐ½ÐµÐ´Ð¶ÐµÑ€ ÑÐ²ÑÐ¶ÐµÑ‚ÑÑ Ñ Ð²Ð°Ð¼Ð¸.`;
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

const rokiGallery = document.querySelector('[data-gallery]');

if (rokiGallery) {
  const mainImage = rokiGallery.querySelector('[data-gallery-main]');
  const thumbs = [...rokiGallery.querySelectorAll('.roki-gallery-thumb')];
  const prevArrow = rokiGallery.querySelector('.roki-gallery-arrow-prev');
  const nextArrow = rokiGallery.querySelector('.roki-gallery-arrow-next');
  const progressFill = rokiGallery.querySelector('[data-gallery-progress]');
  let activeGalleryIndex = thumbs.findIndex((thumb) => thumb.classList.contains('is-active'));
  let galleryAutoplayId = null;
  let gallerySwipeId = null;
  let touchStartX = 0;
  let touchEndX = 0;
  const galleryAutoplayDelay = 4800;
  const gallerySwipeClasses = [
    'is-swipe-out-left',
    'is-swipe-out-right',
    'is-swipe-in-left',
    'is-swipe-in-right'
  ];

  if (mainImage && thumbs.length > 0) {
    if (activeGalleryIndex < 0) {
      activeGalleryIndex = 0;
      thumbs[0].classList.add('is-active');
    }

    const resetGalleryProgress = () => {
      if (!progressFill || thumbs.length < 2) {
        return;
      }

      progressFill.style.transition = 'none';
      progressFill.style.transform = 'scaleX(0)';
      void progressFill.offsetWidth;
      progressFill.style.transition = `transform ${galleryAutoplayDelay}ms linear`;
      progressFill.style.transform = 'scaleX(1)';
    };

    const stopGalleryAutoplay = () => {
      if (galleryAutoplayId) {
        clearInterval(galleryAutoplayId);
        galleryAutoplayId = null;
      }

      if (progressFill) {
        progressFill.style.transition = 'none';
        progressFill.style.transform = 'scaleX(0)';
      }
    };

    const startGalleryAutoplay = () => {
      if (thumbs.length < 2) {
        return;
      }

      if (galleryAutoplayId) {
        clearInterval(galleryAutoplayId);
      }

      resetGalleryProgress();
      galleryAutoplayId = setInterval(() => {
        setActiveGalleryImage(activeGalleryIndex + 1, 1, true, false);
      }, galleryAutoplayDelay);
    };

    const setActiveGalleryImage = (index, direction = 1, animated = true, restartAutoplay = true) => {
      const nextIndex = (index + thumbs.length) % thumbs.length;
      const shouldAnimate = animated && !prefersReducedMotion && nextIndex !== activeGalleryIndex;
      activeGalleryIndex = nextIndex;
      const activeThumb = thumbs[activeGalleryIndex];
      const nextSrc = activeThumb.dataset.gallerySrc || '';
      const nextAlt = activeThumb.dataset.galleryAlt || '';

      if (gallerySwipeId) {
        clearTimeout(gallerySwipeId);
        gallerySwipeId = null;
      }

      mainImage.classList.remove(...gallerySwipeClasses);

      if (shouldAnimate) {
        const outClass = direction >= 0 ? 'is-swipe-out-left' : 'is-swipe-out-right';
        const inClass = direction >= 0 ? 'is-swipe-in-right' : 'is-swipe-in-left';
        mainImage.classList.add(outClass);

        gallerySwipeId = window.setTimeout(() => {
          mainImage.src = nextSrc;
          mainImage.alt = nextAlt;
          mainImage.classList.remove(outClass);
          mainImage.classList.add(inClass);

          requestAnimationFrame(() => {
            mainImage.classList.remove(inClass);
          });
        }, 170);
      } else {
        mainImage.src = nextSrc;
        mainImage.alt = nextAlt;
      }

      if (restartAutoplay) {
        startGalleryAutoplay();
      } else {
        resetGalleryProgress();
      }

      thumbs.forEach((thumb, thumbIndex) => {
        thumb.classList.toggle('is-active', thumbIndex === activeGalleryIndex);
      });
    };

    thumbs.forEach((thumb, thumbIndex) => {
      thumb.addEventListener('click', () => {
        const direction = thumbIndex >= activeGalleryIndex ? 1 : -1;
        setActiveGalleryImage(thumbIndex, direction, true);
      });
    });

    if (prevArrow) {
      prevArrow.addEventListener('click', () => setActiveGalleryImage(activeGalleryIndex - 1, -1, true));
    }

    if (nextArrow) {
      nextArrow.addEventListener('click', () => setActiveGalleryImage(activeGalleryIndex + 1, 1, true));
    }

    rokiGallery.addEventListener('touchstart', (event) => {
      touchStartX = event.changedTouches[0].clientX;
      stopGalleryAutoplay();
    }, { passive: true });

    rokiGallery.addEventListener('touchend', (event) => {
      touchEndX = event.changedTouches[0].clientX;
      const swipeDistance = touchStartX - touchEndX;
      const swipeThreshold = 35;

      if (swipeDistance > swipeThreshold) {
        setActiveGalleryImage(activeGalleryIndex + 1, 1, true);
      } else if (swipeDistance < -swipeThreshold) {
        setActiveGalleryImage(activeGalleryIndex - 1, -1, true);
      } else {
        startGalleryAutoplay();
      }
    }, { passive: true });

    setActiveGalleryImage(activeGalleryIndex, 1, false, false);
    startGalleryAutoplay();
  }
}

const whyRokiCarousel = document.querySelector('#why-roki .why-roki-carousel');

if (whyRokiCarousel) {
  const whyRokiTrack = whyRokiCarousel.querySelector('.why-roki-track');
  const sourceCards = whyRokiTrack ? [...whyRokiTrack.children] : [];

  if (whyRokiTrack && sourceCards.length > 1) {
    const originalCount = sourceCards.length;
    const fragment = document.createDocumentFragment();
    const makeSet = (isClone) => sourceCards.map((card) => {
      const node = card.cloneNode(true);
      if (isClone) {
        node.setAttribute('aria-hidden', 'true');
      }
      return node;
    });

    [...makeSet(true), ...makeSet(false), ...makeSet(true)].forEach((card) => fragment.appendChild(card));
    whyRokiTrack.innerHTML = '';
    whyRokiTrack.appendChild(fragment);

    let setWidth = 0;
    let trackPosition = 0;
    let frameId = null;
    let lastTimestamp = 0;
    let isHovered = false;
    const autoVelocity = -36;

    const applyTransform = () => {
      whyRokiTrack.style.transform = `translate3d(${trackPosition}px, 0, 0)`;
    };

    const wrapPosition = () => {
      if (!setWidth) {
        return;
      }

      while (trackPosition <= -2 * setWidth) {
        trackPosition += setWidth;
      }

      while (trackPosition >= 0) {
        trackPosition -= setWidth;
      }
    };

    const updateMeasurements = () => {
      const firstMiddle = whyRokiTrack.children[originalCount];
      const lastMiddle = whyRokiTrack.children[originalCount * 2 - 1];
      if (!firstMiddle || !lastMiddle) {
        return;
      }

      const nextSetWidth = (lastMiddle.offsetLeft + lastMiddle.offsetWidth) - firstMiddle.offsetLeft;
      if (!nextSetWidth) {
        return;
      }

      if (setWidth) {
        const phase = ((trackPosition + setWidth) % setWidth + setWidth) % setWidth;
        trackPosition = -nextSetWidth + phase;
      } else {
        trackPosition = -nextSetWidth;
      }

      setWidth = nextSetWidth;
      wrapPosition();
      applyTransform();
    };

    const shouldAutoMove = () => !isHovered;

    const tick = (timestamp) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      const deltaSeconds = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (shouldAutoMove() && setWidth) {
        trackPosition += autoVelocity * deltaSeconds;
        wrapPosition();
        applyTransform();
      }

      frameId = window.requestAnimationFrame(tick);
    };

    whyRokiCarousel.addEventListener('mouseenter', () => {
      isHovered = true;
    });

    whyRokiCarousel.addEventListener('mouseleave', () => {
      isHovered = false;
    });

    whyRokiCarousel.addEventListener('wheel', (event) => {
      const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!dominantDelta || !setWidth) {
        return;
      }

      event.preventDefault();
      trackPosition -= dominantDelta * 1.1;
      wrapPosition();
      applyTransform();
    }, { passive: false });

    window.addEventListener('resize', updateMeasurements, { passive: true });
    window.addEventListener('load', updateMeasurements, { once: true, passive: true });
    updateMeasurements();
    frameId = window.requestAnimationFrame(tick);

    window.addEventListener('beforeunload', () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    }, { once: true });
  }
}
const API_BASE_URL = 'http://localhost:3000';

const REVIEWS_PREVIEW_LIMIT = 5;
const REVIEW_PREVIEW_MAX_CHARS = 260;

function formatReviewDate(createdAt) {
  const parsedDate = new Date(createdAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Publication date unavailable';
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(parsedDate);
}

function createReviewCard(review) {
  const card = document.createElement('article');
  card.className = 'homepage-review-card';

  const name = document.createElement('p');
  name.className = 'homepage-review-name';
  name.textContent = (review.username || 'Anonymous').trim();

  const text = document.createElement('p');
  text.className = 'homepage-review-text';
  const fullText = (review.text || review.review_text || '').trim();
  const hasText = fullText.length > 0;
  const isLong = fullText.length > REVIEW_PREVIEW_MAX_CHARS;
  const previewText = isLong
    ? `${fullText.slice(0, REVIEW_PREVIEW_MAX_CHARS).trimEnd()}...`
    : fullText;
  text.textContent = hasText ? previewText : 'No review text.';

  if (isLong) {
    const readMoreButton = document.createElement('button');
    readMoreButton.type = 'button';
    readMoreButton.className = 'homepage-review-read-more';
    readMoreButton.textContent = 'Read more';
    readMoreButton.setAttribute('aria-expanded', 'false');
    readMoreButton.addEventListener('click', () => {
      const isExpanded = readMoreButton.getAttribute('aria-expanded') === 'true';
      readMoreButton.setAttribute('aria-expanded', String(!isExpanded));
      readMoreButton.textContent = isExpanded ? 'Read more' : 'Show less';
      text.textContent = isExpanded ? previewText : fullText;
    });
    card.append(name, text, readMoreButton);
  } else {
    card.append(name, text);
  }

  const date = document.createElement('p');
  date.className = 'homepage-review-date';
  date.textContent = formatReviewDate(review.created_at);
  card.appendChild(date);

  return card;
}

const reviewStatus = document.getElementById('reviewStatus');
const reviewForm = document.getElementById('reviewForm');
const reviewFormStatus = document.getElementById('reviewFormStatus');
const reviewNameInput = document.getElementById('reviewName');
const reviewContentInput = document.getElementById('reviewContent');

async function loadReviews() {
  const container = document.getElementById('reviewsContainer');
  if (!container) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews?page=1&limit=${REVIEWS_PREVIEW_LIMIT}`);
    if (!response.ok) {
      throw new Error('Failed to load reviews');
    }

    const responseData = await response.json();
    const latestReviews = Array.isArray(responseData.items)
      ? responseData.items.slice(0, REVIEWS_PREVIEW_LIMIT)
      : [];

    container.replaceChildren(...latestReviews.map((review) => createReviewCard(review)));
    if (reviewStatus) {
      reviewStatus.textContent = latestReviews.length ? '' : 'No reviews yet.';
    }
  } catch (error) {
    container.replaceChildren();
    if (reviewStatus) {
      reviewStatus.textContent = 'Failed to load reviews.';
    }
    console.error(error);
  }
}

async function submitReview(name, content) {
  const response = await fetch(`${API_BASE_URL}/api/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, content })
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = typeof payload.error === 'string' ? payload.error : 'Failed to add review.';
    throw new Error(message);
  }
}

if (reviewForm && reviewNameInput && reviewContentInput) {
  reviewForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = reviewNameInput.value.trim();
    const content = reviewContentInput.value.trim();

    if (!name || !content) {
      if (reviewFormStatus) {
        reviewFormStatus.textContent = 'Name and review are required.';
      }
      return;
    }

    if (content.length > 2000) {
      if (reviewFormStatus) {
        reviewFormStatus.textContent = 'Review is too long.';
      }
      return;
    }

    try {
      await submitReview(name, content);
      reviewForm.reset();
      if (reviewFormStatus) {
        reviewFormStatus.textContent = 'Review added.';
      }
      await loadReviews();
    } catch (error) {
      if (reviewFormStatus) {
        reviewFormStatus.textContent = error.message || 'Failed to add review.';
      }
      console.error(error);
    }
  });
}

loadReviews();
