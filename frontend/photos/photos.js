const API_BASE_URL =
  window.location.origin && window.location.origin.startsWith('http')
    ? window.location.origin
    : 'http://localhost:3000';

const photosGrid = document.getElementById('photosGrid');
const photosEmpty = document.getElementById('photosEmpty');

function renderPhotos(photos) {
  photosGrid.innerHTML = '';

  if (!Array.isArray(photos) || photos.length === 0) {
    photosEmpty.hidden = false;
    return;
  }

  photosEmpty.hidden = true;

  photos.forEach((photo) => {
    const figure = document.createElement('figure');
    figure.className = 'photos-card';

    const img = document.createElement('img');
    img.src = photo.url;
    img.alt = 'Фото дивана Рокки';
    img.loading = 'lazy';

    figure.appendChild(img);
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
