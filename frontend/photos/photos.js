const API_BASE_URL =
  window.location.origin && window.location.origin.startsWith('http')
    ? window.location.origin
    : 'http://localhost:3000';

const photosGrid = document.getElementById('photosGrid');
const photosEmpty = document.getElementById('photosEmpty');
const lightbox = document.getElementById('photosLightbox');
const lightboxImage = document.getElementById('photosLightboxImage');
const lightboxCounter = document.getElementById('photosLightboxCounter');

let photosList = [];
let currentIndex = 0;

function isLightboxOpen() {
  return lightbox && lightbox.classList.contains('is-open');
}

function setLightboxOpen(nextOpen) {
  if (!lightbox) {
    return;
  }

  lightbox.classList.toggle('is-open', nextOpen);
  lightbox.setAttribute('aria-hidden', nextOpen ? 'false' : 'true');
  document.body.classList.toggle('is-lightbox-open', nextOpen);
}

function updateLightbox() {
  if (!lightboxImage || photosList.length === 0) {
    return;
  }

  const photo = photosList[currentIndex];
  lightboxImage.src = photo.url;
  lightboxImage.alt = 'Фото дивана Рокки';

  if (lightboxCounter) {
    lightboxCounter.textContent = `${currentIndex + 1} / ${photosList.length}`;
  }

  if (lightbox) {
    const prevBtn = lightbox.querySelector('[data-lightbox-prev]');
    const nextBtn = lightbox.querySelector('[data-lightbox-next]');
    if (prevBtn) {
      prevBtn.disabled = photosList.length <= 1;
    }
    if (nextBtn) {
      nextBtn.disabled = photosList.length <= 1;
    }
  }
}

function openLightbox(index) {
  if (!lightbox || photosList.length === 0) {
    return;
  }

  currentIndex = index;
  updateLightbox();
  setLightboxOpen(true);
}

function closeLightbox() {
  setLightboxOpen(false);
}

function showNext(delta) {
  if (photosList.length <= 1) {
    return;
  }
  currentIndex = (currentIndex + delta + photosList.length) % photosList.length;
  updateLightbox();
}

function renderPhotos(photos) {
  photosGrid.innerHTML = '';
  photosList = Array.isArray(photos) ? photos : [];

  if (photosList.length === 0) {
    photosEmpty.hidden = false;
    return;
  }

  photosEmpty.hidden = true;

  photosList.forEach((photo, index) => {
    const figure = document.createElement('figure');
    figure.className = 'photos-card';

    const img = document.createElement('img');
    img.src = photo.url;
    img.alt = 'Фото дивана Рокки';
    img.loading = 'lazy';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'photos-card-button';
    button.setAttribute('data-index', String(index));
    button.setAttribute('aria-label', `Открыть фото ${index + 1}`);
    button.appendChild(img);

    figure.appendChild(button);
    photosGrid.appendChild(figure);
  });
}

async function loadPhotos() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/photos`);
    if (!response.ok) {
      throw new Error('Failed to fetch photos');
    }
    const data = await response.json();
    renderPhotos(data);
  } catch (error) {
    photosGrid.innerHTML = '';
    photosEmpty.hidden = false;
    photosEmpty.textContent = 'Не удалось загрузить фотографии.';
    console.error(error);
  }
}

loadPhotos();

if (photosGrid) {
  photosGrid.addEventListener('click', (event) => {
    const button = event.target.closest('.photos-card-button');
    if (!button) {
      return;
    }
    const index = Number.parseInt(button.getAttribute('data-index'), 10);
    if (Number.isNaN(index)) {
      return;
    }
    openLightbox(index);
  });
}

if (lightbox) {
  lightbox.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.matches('[data-lightbox-close]')) {
      closeLightbox();
      return;
    }

    if (target.matches('[data-lightbox-prev]')) {
      showNext(-1);
      return;
    }

    if (target.matches('[data-lightbox-next]')) {
      showNext(1);
    }
  });
}

document.addEventListener('keydown', (event) => {
  if (!isLightboxOpen()) {
    return;
  }

  if (event.key === 'Escape') {
    closeLightbox();
  }

  if (event.key === 'ArrowLeft') {
    showNext(-1);
  }

  if (event.key === 'ArrowRight') {
    showNext(1);
  }
});
