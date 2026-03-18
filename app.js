const chips = document.querySelectorAll('.chip');
const searchInput = document.querySelector('#search-input');
const searchButton = document.querySelector('#search-btn');
const scrollCaptureButton = document.querySelector('#scroll-capture');
const spotForm = document.querySelector('#spot-form');
const nearbyFeed = document.querySelector('#nearby-feed');
const nearbyEmpty = document.querySelector('#nearby-empty');
const mapMarkers = document.querySelector('#map-markers');
const mapCard = document.querySelector('#map-card');
const clearButton = document.querySelector('#clear-spots');
const photoInput = document.querySelector('#spot-photo');
const previewCard = document.querySelector('#preview-card');
const matchCount = document.querySelector('#match-count');
const matchText = document.querySelector('#match-text');
const matchFill = document.querySelector('#match-fill');

const STORAGE_KEY = 'spot.entries';

const loadSpots = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
};

const saveSpots = (spots) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(spots));
};

const parseTags = (value) => {
  if (!value) return [];
  return value
    .split(/\s+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`));
};

const markerPositions = [
  { top: 28, left: 22 },
  { top: 46, left: 52 },
  { top: 32, left: 68 },
  { top: 62, left: 36 },
  { top: 54, left: 76 },
  { top: 40, left: 35 }
];

const renderMarkers = (spots) => {
  mapMarkers.innerHTML = '';
  spots.forEach((spot, index) => {
    const marker = document.createElement('span');
    marker.className = 'marker';
    const position = markerPositions[index % markerPositions.length];
    marker.style.top = `${position.top}%`;
    marker.style.left = `${position.left}%`;
    marker.title = spot.title;
    marker.addEventListener('click', () => {
      mapCard.querySelector('.map-title').textContent = spot.title;
      mapCard.querySelector('.map-meta').textContent = `${spot.category} · ${spot.chat}`;
    });
    mapMarkers.appendChild(marker);
  });
};

const updateMatch = (spots) => {
  const count = spots.length;
  const progress = Math.min(count / 3, 1);
  matchCount.textContent = count.toString();
  matchFill.style.width = `${progress * 100}%`;

  if (count >= 3) {
    matchText.textContent = 'Matches unlocked. We are ready to suggest friends.';
  } else {
    matchText.textContent = `Share ${3 - count} more spot${count === 2 ? '' : 's'} to unlock your first suggested friends.`;
  }
};

const renderFeed = (spots) => {
  nearbyFeed.innerHTML = '';
  if (spots.length === 0) {
    nearbyEmpty.style.display = 'block';
    mapCard.querySelector('.map-title').textContent = 'No spots yet';
    mapCard.querySelector('.map-meta').textContent = 'Post your first spot to begin.';
    renderMarkers([]);
    updateMatch([]);
    return;
  }

  nearbyEmpty.style.display = 'none';
  mapCard.querySelector('.map-title').textContent = spots[0].title;
  mapCard.querySelector('.map-meta').textContent = `${spots[0].category} · ${spots[0].chat}`;
  renderMarkers(spots);
  updateMatch(spots);

  spots.forEach((spot) => {
    const card = document.createElement('article');
    card.className = 'feed-card';
    card.innerHTML = `
      ${spot.photo ? `<img class="feed-photo" src="${spot.photo}" alt="${spot.title}" />` : ''}
      <div class="feed-head">
        <div class="avatar"></div>
        <div>
          <p class="feed-name">${spot.title}</p>
          <p class="feed-handle">${spot.category} · ${spot.chat}</p>
        </div>
      </div>
      <p class="feed-text">${spot.comment}</p>
      <div class="feed-tags">
        ${spot.tags.map((tag) => `<span>${tag}</span>`).join('')}
      </div>
    `;
    nearbyFeed.appendChild(card);
  });
};

const filterSpots = (query, spots) => {
  if (!query) return spots;
  const value = query.toLowerCase();
  return spots.filter((spot) =>
    [spot.title, spot.category, spot.comment, spot.tags.join(' '), spot.chat]
      .join(' ')
      .toLowerCase()
      .includes(value)
  );
};

const previewImage = (file) => {
  if (!file) {
    previewCard.innerHTML = '<p>No photo yet.</p>';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    previewCard.innerHTML = `<img src="${reader.result}" alt="Preview" />`;
  };
  reader.readAsDataURL(file);
};

let spots = loadSpots();
renderFeed(spots);

if (photoInput) {
  photoInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    previewImage(file);
  });
}

if (searchInput) {
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const value = chip.textContent.replace('#', '');
      searchInput.value = value;
      renderFeed(filterSpots(value, spots));
      searchInput.focus();
    });
  });

  searchInput.addEventListener('input', (event) => {
    renderFeed(filterSpots(event.target.value, spots));
  });
}

if (searchButton) {
  searchButton.addEventListener('click', () => {
    const value = searchInput ? searchInput.value : '';
    renderFeed(filterSpots(value, spots));
    searchButton.textContent = 'Searching...';
    window.setTimeout(() => {
      searchButton.textContent = 'Explore';
    }, 900);
  });
}

if (scrollCaptureButton) {
  scrollCaptureButton.addEventListener('click', () => {
    document.querySelector('#capture').scrollIntoView({ behavior: 'smooth' });
  });
}

if (spotForm) {
  spotForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(spotForm);
    const file = photoInput.files[0];

    const handleSave = (photoData) => {
      const newSpot = {
        title: formData.get('title').toString().trim(),
        category: formData.get('category').toString().trim(),
        comment: formData.get('comment').toString().trim(),
        tags: parseTags(formData.get('tags').toString().trim()),
        chat: formData.get('chat').toString().trim(),
        photo: photoData
      };

      spots = [newSpot, ...spots];
      saveSpots(spots);
      renderFeed(spots);
      spotForm.reset();
      previewImage(null);
    };

    if (file) {
      const reader = new FileReader();
      reader.onload = () => handleSave(reader.result);
      reader.readAsDataURL(file);
    } else {
      handleSave('');
    }
  });
}

if (clearButton) {
  clearButton.addEventListener('click', () => {
    spots = [];
    saveSpots(spots);
    renderFeed(spots);
    previewImage(null);
  });
}
