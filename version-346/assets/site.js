function setupNavigation() {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.mobile-nav');
  if (!toggle || !menu) {
    return;
  }
  toggle.addEventListener('click', function () {
    var opened = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
  });
}

function setupHero() {
  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  if (!slides.length) {
    return;
  }
  var index = 0;
  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  }
  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      show(dotIndex);
    });
  });
  setInterval(function () {
    show(index + 1);
  }, 5200);
}

function escapeHTML(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function setupSearch() {
  var form = document.querySelector('[data-search-form]');
  var results = document.querySelector('[data-search-results]');
  var summary = document.querySelector('[data-search-summary]');
  if (!form || !results || !summary || !window.SEARCH_MOVIES) {
    return;
  }
  var keywordInput = form.querySelector('[name="keyword"]');
  var categoryInput = form.querySelector('[name="category"]');
  var yearInput = form.querySelector('[name="year"]');
  function render() {
    var keyword = (keywordInput.value || '').trim().toLowerCase();
    var category = categoryInput.value || '';
    var year = yearInput.value || '';
    var data = window.SEARCH_MOVIES.filter(function (movie) {
      var keywordText = [movie.title, movie.text, movie.tags, movie.region, movie.type, movie.category].join(' ').toLowerCase();
      var keywordOk = !keyword || keywordText.indexOf(keyword) !== -1;
      var categoryOk = !category || movie.category === category;
      var yearOk = !year || movie.year === year;
      return keywordOk && categoryOk && yearOk;
    }).slice(0, 60);
    summary.textContent = data.length ? '已找到 ' + data.length + ' 部相关影片' : '没有找到相关影片';
    results.innerHTML = data.map(function (movie) {
      return '<article class="movie-card grid">' +
        '<a class="poster-link" href="' + escapeHTML(movie.url) + '">' +
        '<img src="' + escapeHTML(movie.image) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy">' +
        '<span class="year-badge">' + escapeHTML(movie.year) + '</span>' +
        '<span class="play-badge">播放</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
        '<h3><a href="' + escapeHTML(movie.url) + '">' + escapeHTML(movie.title) + '</a></h3>' +
        '<p>' + escapeHTML(movie.text) + '</p>' +
        '<div class="movie-meta"><span>' + escapeHTML(movie.region) + '</span><span>' + escapeHTML(movie.type) + '</span></div>' +
        '<div class="tag-row"><span>' + escapeHTML(movie.category) + '</span></div>' +
        '</div>' +
        '</article>';
    }).join('');
  }
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    render();
  });
  keywordInput.addEventListener('input', render);
  categoryInput.addEventListener('change', render);
  yearInput.addEventListener('change', render);
  render();
}

function bindMoviePlayer(options) {
  var video = document.getElementById(options.videoId);
  var cover = document.getElementById(options.coverId);
  if (!video || !cover || !options.source) {
    return;
  }
  var started = false;
  var hls = null;
  function begin() {
    cover.classList.add('is-hidden');
    if (!started) {
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = options.source;
        video.play().catch(function () {});
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(options.source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = options.source;
        video.play().catch(function () {});
      }
    } else if (video.paused) {
      video.play().catch(function () {});
    }
  }
  cover.addEventListener('click', begin);
  video.addEventListener('play', function () {
    cover.classList.add('is-hidden');
  });
  video.addEventListener('click', function () {
    if (video.paused) {
      video.play().catch(function () {});
    } else {
      video.pause();
    }
  });
  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  setupNavigation();
  setupHero();
  setupSearch();
});
