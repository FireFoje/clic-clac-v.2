const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach((item) => {
  item.addEventListener('click', () => {
    const isActive = item.classList.contains('active');
    faqItems.forEach((btn) => btn.classList.remove('active'));
    if (!isActive) {
      item.classList.add('active');
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
  }
}
