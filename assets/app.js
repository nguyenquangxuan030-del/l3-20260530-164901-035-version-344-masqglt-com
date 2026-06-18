(function () {
    var menuButton = document.querySelector('.menu-btn');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });
    }

    var nextButton = document.querySelector('[data-hero-next]');
    var prevButton = document.querySelector('[data-hero-prev]');

    if (nextButton) {
        nextButton.addEventListener('click', function () {
            showSlide(currentSlide + 1);
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', function () {
            showSlide(currentSlide - 1);
        });
    }

    if (slides.length) {
        showSlide(0);
        setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5600);
    }

    var controlBars = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

    controlBars.forEach(function (scope) {
        var searchInput = scope.querySelector('[data-filter-input]');
        var yearSelect = scope.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-card'));
        var empty = scope.querySelector('.filter-empty');

        function applyFilter() {
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';
            var visibleCount = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-genre') || '',
                    card.getAttribute('data-category') || '',
                    card.getAttribute('data-year') || ''
                ].join(' ').toLowerCase();
                var sameYear = !year || card.getAttribute('data-year') === year;
                var matched = (!keyword || haystack.indexOf(keyword) !== -1) && sameYear;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.style.display = visibleCount ? 'none' : 'block';
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', applyFilter);
        }

        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilter);
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');
        if (initialQuery && searchInput) {
            searchInput.value = initialQuery;
        }
        applyFilter();
    });

    var playerShells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

    playerShells.forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.player-start');
        var src = shell.getAttribute('data-video');
        var ready = false;
        var hlsInstance = null;

        function attach() {
            if (ready || !video || !src) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
            } else {
                video.src = src;
            }

            ready = true;
        }

        function play() {
            attach();
            shell.classList.add('is-playing');
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    shell.classList.remove('is-playing');
                });
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (!video.seeking && video.currentTime === 0) {
                    shell.classList.remove('is-playing');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}());
