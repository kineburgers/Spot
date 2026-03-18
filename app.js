const spotForm = document.querySelector('#spot-form');
const nearbyFeed = document.querySelector('#nearby-feed');
const nearbyEmpty = document.querySelector('#nearby-empty');
const mapMarkers = document.querySelector('#map-markers');
const mapCard = document.querySelector('#map-card');
const clearButton = document.querySelector('#clear-spots');
const photoInput = document.querySelector('#spot-photo');
const previewCard = document.querySelector('#preview-card');
const intro = document.querySelector('#intro');
const quickCapture = document.querySelector('#quick-capture');
const quickClose = document.querySelector('#quick-close');
const cameraLauncher = document.querySelector('#camera-launcher');
const quickForm = document.querySelector('#quick-form');
const quickPhotoInput = document.querySelector('#quick-photo');
const themeButtons = document.querySelectorAll('.theme-dot');

const STORAGE_KEY = 'spot.entries';
const THEME_KEY = 'spot.theme';

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

const renderFeed = (spots) => {
  nearbyFeed.innerHTML = '';
  if (spots.length === 0) {
    nearbyEmpty.style.display = 'block';
    mapCard.querySelector('.map-title').textContent = 'No spots yet';
    mapCard.querySelector('.map-meta').textContent = 'Post your first spot to begin.';
    renderMarkers([]);
    return;
  }

  nearbyEmpty.style.display = 'none';
  mapCard.querySelector('.map-title').textContent = spots[0].title;
  mapCard.querySelector('.map-meta').textContent = `${spots[0].category}`;
  renderMarkers(spots);

  spots.forEach((spot) => {
    const card = document.createElement('article');
    card.className = 'feed-card';
    card.innerHTML = `
      ${spot.photo ? `<img class="feed-photo" src="${spot.photo}" alt="${spot.title}" />` : ''}
      <div class="feed-head">
        <div class="avatar"></div>
        <div>
          <p class="feed-name">${spot.title}</p>
          <p class="feed-handle">${spot.category}</p>
        </div>
      </div>
      <p class="feed-text">${spot.comment}</p>
    `;
    nearbyFeed.appendChild(card);
  });
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

const openQuickCapture = () => {
  if (quickCapture) {
    quickCapture.classList.add('active');
  }
};

const closeQuickCapture = () => {
  if (quickCapture) {
    quickCapture.classList.remove('active');
  }
};

if (cameraLauncher) {
  cameraLauncher.addEventListener('click', openQuickCapture);
}

if (quickClose) {
  quickClose.addEventListener('click', closeQuickCapture);
}

if (quickCapture) {
  quickCapture.addEventListener('click', (event) => {
    if (event.target === quickCapture) {
      closeQuickCapture();
    }
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

if (quickForm) {
  quickForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(quickForm);
    const file = quickPhotoInput ? quickPhotoInput.files[0] : null;

    const handleSave = (photoData) => {
      const newSpot = {
        title: formData.get('title').toString().trim(),
        category: formData.get('category').toString().trim(),
        comment: formData.get('comment').toString().trim(),
        photo: photoData
      };

      spots = [newSpot, ...spots];
      saveSpots(spots);
      renderFeed(spots);
      quickForm.reset();
      closeQuickCapture();
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

if (intro) {
  window.setTimeout(() => {
    intro.remove();
  }, 7400);
}

const setTheme = (theme) => {
  document.body.setAttribute('data-theme', theme);
  window.localStorage.setItem(THEME_KEY, theme);
};

const savedTheme = window.localStorage.getItem(THEME_KEY);
if (savedTheme) {
  setTheme(savedTheme);
}

themeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const theme = button.getAttribute('data-theme');
    if (theme) {
      setTheme(theme);
    }
  });
});
