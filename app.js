const tags = document.querySelectorAll('.tag');
const searchInput = document.querySelector('.search-row input');
const searchButton = document.querySelector('.search-btn');

if (searchInput) {
  tags.forEach((tag) => {
    tag.addEventListener('click', () => {
      searchInput.value = tag.textContent;
      searchInput.focus();
    });
  });
}

if (searchButton) {
  searchButton.addEventListener('click', () => {
    searchButton.textContent = 'Searching...';
    window.setTimeout(() => {
      searchButton.textContent = 'Explore';
    }, 900);
  });
}
