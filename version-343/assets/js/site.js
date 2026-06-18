(function () {
  const toggle = document.querySelector('.menu-toggle');
  const panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      const opened = panel.hasAttribute('hidden');
      if (opened) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  const carousel = document.querySelector('.hero-carousel');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
    let index = 0;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-target')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 6200);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter(input) {
    const list = document.querySelector('.js-filter-list');
    if (!list || !input) {
      return;
    }
    const cards = Array.from(list.querySelectorAll('.movie-card'));
    const query = normalize(input.value);
    cards.forEach(function (card) {
      const searchable = normalize(card.getAttribute('data-search'));
      const matched = !query || searchable.includes(query);
      card.classList.toggle('is-hidden', !matched);
    });
  }

  const filterInput = document.querySelector('.js-filter-input');
  if (filterInput) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query) {
      filterInput.value = query;
    }
    applyFilter(filterInput);
    filterInput.addEventListener('input', function () {
      applyFilter(filterInput);
    });
  }

  const clearButton = document.querySelector('.js-clear-filter');
  if (clearButton && filterInput) {
    clearButton.addEventListener('click', function () {
      filterInput.value = '';
      applyFilter(filterInput);
      filterInput.focus();
    });
  }
})();
