const ADMIN_KEY_STORAGE_KEY = 'admin_panel_key';
const API_BASE_URL =
  window.location.origin && window.location.origin.startsWith('http')
    ? window.location.origin
    : 'http://localhost:3000';

const adminKeyInput = document.getElementById('adminKey');
const loadBtn = document.getElementById('loadBtn');
const clearBtn = document.getElementById('clearBtn');
const statusEl = document.getElementById('status');
const reviewsBody = document.getElementById('reviewsBody');

function setStatus(message) {
  statusEl.textContent = message;
}

function getAdminKey() {
  return adminKeyInput.value.trim();
}

function saveAdminKey(key) {
  // Store only for current browser tab session (not in HTML/source code).
  sessionStorage.setItem(ADMIN_KEY_STORAGE_KEY, key);
}

function clearAdminKey() {
  sessionStorage.removeItem(ADMIN_KEY_STORAGE_KEY);
  adminKeyInput.value = '';
}

async function fetchAdminReviews(adminKey) {
  const response = await fetch(`${API_BASE_URL}/admin/reviews`, {
    headers: {
      'X-Admin-Key': adminKey
    }
  });

  if (!response.ok) {
    throw new Error(response.status === 403 ? 'Forbidden: invalid admin key' : 'Failed to fetch reviews');
  }

  return response.json();
}

async function deleteAdminReview(id, adminKey) {
  const response = await fetch(`${API_BASE_URL}/admin/reviews/${id}`, {
    method: 'DELETE',
    headers: {
      'X-Admin-Key': adminKey
    }
  });

  if (!response.ok) {
    throw new Error(response.status === 403 ? 'Forbidden: invalid admin key' : 'Failed to delete review');
  }
}

async function updateAdminReview(id, payload, adminKey) {
  const response = await fetch(`${API_BASE_URL}/admin/reviews/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Key': adminKey
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const payloadError = await response.json().catch(() => ({}));
    const fallback = response.status === 403 ? 'Forbidden: invalid admin key' : 'Failed to update review';
    throw new Error(typeof payloadError.error === 'string' ? payloadError.error : fallback);
  }

  return response.json();
}

function createCell(text) {
  const cell = document.createElement('td');
  cell.textContent = text;
  return cell;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString || '';
  }
  return date.toLocaleString();
}

function renderReviews(reviews, adminKey) {
  reviewsBody.innerHTML = '';

  if (!Array.isArray(reviews) || reviews.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.textContent = 'No reviews found.';
    row.appendChild(cell);
    reviewsBody.appendChild(row);
    return;
  }

  reviews.forEach((review) => {
    const row = document.createElement('tr');
    row.appendChild(createCell(String(review.id ?? '')));
    row.appendChild(createCell(review.username ?? ''));
    row.appendChild(createCell(review.text ?? ''));
    row.appendChild(createCell(String(review.rating ?? '')));
    row.appendChild(createCell(formatDate(review.created_at)));

    const actionsCell = document.createElement('td');
    actionsCell.className = 'actions';
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.textContent = 'Edit';
    editBtn.className = 'btn-primary';

    editBtn.addEventListener('click', async () => {
      const nextUsername = window.prompt('Edit username', review.username ?? '');
      if (nextUsername === null) {
        return;
      }

      const nextText = window.prompt('Edit review text', review.text ?? '');
      if (nextText === null) {
        return;
      }

      const nextRatingRaw = window.prompt('Edit rating (1-5)', String(review.rating ?? 5));
      if (nextRatingRaw === null) {
        return;
      }

      const username = nextUsername.trim();
      const text = nextText.trim();
      const rating = Number.parseInt(nextRatingRaw, 10);

      if (!username || !text) {
        setStatus('Username and review text are required.');
        return;
      }

      if (Number.isNaN(rating) || rating < 1 || rating > 5) {
        setStatus('Rating must be between 1 and 5.');
        return;
      }

      try {
        await updateAdminReview(review.id, { username, text, rating }, adminKey);
        setStatus(`Review #${review.id} updated.`);
        await loadReviews(adminKey);
      } catch (error) {
        setStatus(error.message);
      }
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'btn-danger';

    deleteBtn.addEventListener('click', async () => {
      const confirmed = window.confirm(`Delete review #${review.id}?`);
      if (!confirmed) {
        return;
      }

      try {
        await deleteAdminReview(review.id, adminKey);
        await loadReviews(adminKey);
      } catch (error) {
        setStatus(error.message);
      }
    });

    actionsCell.append(editBtn, deleteBtn);
    row.appendChild(actionsCell);
    reviewsBody.appendChild(row);
  });
}

async function loadReviews(adminKeyFromArg) {
  const adminKey = (adminKeyFromArg || getAdminKey()).trim();
  if (!adminKey) {
    setStatus('Admin key is required.');
    return;
  }

  setStatus('Loading...');

  try {
    const reviews = await fetchAdminReviews(adminKey);
    saveAdminKey(adminKey);
    renderReviews(reviews, adminKey);
    setStatus(`Loaded ${reviews.length} review(s).`);
  } catch (error) {
    reviewsBody.innerHTML = '';
    setStatus(error.message);
  }
}

loadBtn.addEventListener('click', () => loadReviews());

clearBtn.addEventListener('click', () => {
  clearAdminKey();
  reviewsBody.innerHTML = '';
  setStatus('Admin key cleared.');
});

const savedKey = sessionStorage.getItem(ADMIN_KEY_STORAGE_KEY) || '';
if (savedKey) {
  adminKeyInput.value = savedKey;
  loadReviews(savedKey);
}
