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
