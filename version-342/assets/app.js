(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function schedule() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        schedule();
      });
    }

    showSlide(0);
    schedule();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var year = scope.querySelector('[data-filter-year]');
    var genre = scope.querySelector('[data-filter-genre]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

    function applyFilter() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var selectedGenre = genre ? genre.value.toLowerCase() : '';

      cards.forEach(function (card) {
        var text = card.getAttribute('data-title') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var cardGenre = (card.getAttribute('data-genre') || '').toLowerCase();
        var visible = true;

        if (q && text.indexOf(q) === -1) {
          visible = false;
        }

        if (selectedYear && cardYear !== selectedYear) {
          visible = false;
        }

        if (selectedGenre && cardGenre.indexOf(selectedGenre) === -1) {
          visible = false;
        }

        card.classList.toggle('is-filter-hidden', !visible);
      });
    }

    [input, year, genre].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });

  var searchPage = document.querySelector('[data-search-page]');

  if (searchPage && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var input = searchPage.querySelector('[data-search-input]');
    var results = searchPage.querySelector('[data-search-results]');

    if (input) {
      input.value = query;
    }

    function renderSearch() {
      if (!results) {
        return;
      }

      var term = input ? input.value.trim().toLowerCase() : query.trim().toLowerCase();
      var data = window.SEARCH_MOVIES;

      if (term) {
        data = data.filter(function (item) {
          return item.search.indexOf(term) !== -1;
        });
      }

      results.innerHTML = data.slice(0, 120).map(function (item) {
        return '<article class="movie-card">' +
          '<a href="./' + item.url + '" class="card-cover" aria-label="' + item.titleEsc + '">' +
          '<img src="' + item.image + '" alt="' + item.titleEsc + '" loading="lazy" decoding="async">' +
          '<span class="card-type">' + item.categoryEsc + '</span>' +
          '<span class="card-play">▶</span>' +
          '</a>' +
          '<div class="card-body">' +
          '<h3><a href="./' + item.url + '">' + item.titleEsc + '</a></h3>' +
          '<p>' + item.oneEsc + '</p>' +
          '<div class="card-meta"><span>' + item.yearEsc + '</span><span>' + item.regionEsc + '</span><span>' + item.typeEsc + '</span></div>' +
          '</div>' +
          '</article>';
      }).join('');
    }

    renderSearch();

    if (input) {
      input.addEventListener('input', renderSearch);
    }
  }
})();

function initMoviePlayer(elementId, videoUrl) {
  var video = document.getElementById(elementId);

  if (!video) {
    return;
  }

  var wrap = video.closest('.video-wrap');
  var overlay = wrap ? wrap.querySelector('[data-play-button]') : null;
  var hlsInstance = null;
  var prepared = false;

  function prepare() {
    if (prepared) {
      return;
    }

    prepared = true;

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(videoUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal) {
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        }
      });
    } else {
      video.src = videoUrl;
    }
  }

  function start() {
    prepare();

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (overlay && video.currentTime === 0) {
      overlay.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
