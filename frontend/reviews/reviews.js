const REVIEWS_PER_PAGE = 10;
const allReviewsContainer = document.getElementById('allReviewsContainer');
const allReviewsStatus = document.getElementById('allReviewsStatus');
const reviewsPagination = document.getElementById('reviewsPagination');
const reviewForm = document.getElementById('reviewForm');
const reviewFormStatus = document.getElementById('reviewFormStatus');
const reviewNameInput = document.getElementById('reviewName');
const reviewContentInput = document.getElementById('reviewContent');
let currentPage = 1;

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
  text.textContent = (review.text || review.review_text || '').trim() || 'No review text.';

  const date = document.createElement('p');
  date.className = 'homepage-review-date';
  date.textContent = formatReviewDate(review.created_at);

  card.append(name, text, date);
  return card;
}

function createPageButton(label, page, activePage) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'reviews-pagination-btn';
  button.textContent = label;
  button.disabled = page === activePage;
  if (page === activePage) {
    button.classList.add('is-active');
    button.setAttribute('aria-current', 'page');
  }

  button.addEventListener('click', () => {
    void loadReviewsPage(page);
  });

  return button;
}

function renderPagination(activePage, totalPages) {
  reviewsPagination.replaceChildren();
  if (totalPages <= 1) {
    return;
  }

  const prevButton = createPageButton('Prev', Math.max(1, activePage - 1), activePage);
  prevButton.disabled = activePage === 1;
  reviewsPagination.appendChild(prevButton);

  for (let page = 1; page <= totalPages; page += 1) {
    reviewsPagination.appendChild(createPageButton(String(page), page, activePage));
  }

  const nextButton = createPageButton('Next', Math.min(totalPages, activePage + 1), activePage);
  nextButton.disabled = activePage === totalPages;
  reviewsPagination.appendChild(nextButton);
}

async function loadReviewsPage(page) {
  if (!allReviewsContainer || !allReviewsStatus || !reviewsPagination) {
    return;
  }

  try {
    const response = await fetch(`/api/reviews?page=${page}&limit=${REVIEWS_PER_PAGE}`);
    if (!response.ok) {
      throw new Error('Failed to load reviews');
    }

    const data = await response.json();
    const items = Array.isArray(data.items) ? data.items : [];
    const total = Number.isFinite(data.total) ? data.total : 0;
    const totalPages = Math.max(1, Math.ceil(total / REVIEWS_PER_PAGE));
    const safePage = Math.min(Math.max(1, page), totalPages);
    currentPage = safePage;

    allReviewsContainer.replaceChildren(...items.map((review) => createReviewCard(review)));
    allReviewsStatus.textContent = items.length ? '' : 'No reviews found.';
    renderPagination(safePage, totalPages);
  } catch (error) {
    allReviewsContainer.replaceChildren();
    reviewsPagination.replaceChildren();
    allReviewsStatus.textContent = 'Failed to load reviews.';
    console.error(error);
  }
}

async function submitReview(name, content) {
  const response = await fetch('/api/reviews', {
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
        reviewFormStatus.textContent = 'Отзыв добавлен.';
      }
      await loadReviewsPage(1);
    } catch (error) {
      if (reviewFormStatus) {
        reviewFormStatus.textContent = error.message || 'Failed to add review.';
      }
      console.error(error);
    }
  });
}

void loadReviewsPage(currentPage);
