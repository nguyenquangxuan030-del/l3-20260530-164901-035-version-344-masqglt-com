(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupImages() {
        document.querySelectorAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("image-missing");
            }, { once: true });
        });
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer = null;
        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }
        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(active + 1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        show(0);
        start();
    }

    function setupFeatureSlider() {
        document.querySelectorAll("[data-slider]").forEach(function (slider) {
            var track = slider.querySelector("[data-slider-track]");
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-slider-dot]"));
            if (!track || !dots.length) {
                return;
            }
            var active = 0;
            function show(index) {
                active = (index + dots.length) % dots.length;
                track.style.transform = "translateX(-" + (active * 100) + "%)";
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === active);
                });
            }
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                });
            });
            setInterval(function () {
                show(active + 1);
            }, 5600);
            show(0);
        });
    }

    function setupFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var search = scope.querySelector("[data-filter-search]");
            var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            var empty = scope.querySelector("[data-empty]");
            function apply() {
                var query = search ? search.value.trim().toLowerCase() : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-index") || "").toLowerCase();
                    var pass = !query || haystack.indexOf(query) !== -1;
                    selects.forEach(function (select) {
                        var key = select.getAttribute("data-filter-select");
                        var value = select.value;
                        if (value && card.getAttribute("data-" + key) !== value) {
                            pass = false;
                        }
                    });
                    card.classList.toggle("is-hidden", !pass);
                    if (pass) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            if (search) {
                search.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
            apply();
        });
    }

    function setupPlayer() {
        var video = document.querySelector("[data-player]");
        if (!video) {
            return;
        }
        var source = video.getAttribute("data-stream");
        var playButton = document.querySelector("[data-play]");
        var layer = document.querySelector("[data-player-layer]");
        var errorBox = document.querySelector("[data-player-error]");
        var hlsInstance = null;
        function showError() {
            if (errorBox) {
                errorBox.classList.add("is-visible");
            }
        }
        function hideLayer() {
            if (layer) {
                layer.classList.add("is-hidden");
            }
        }
        function beginPlayback() {
            if (!source) {
                showError();
                return;
            }
            hideLayer();
            if (video.getAttribute("data-ready") === "1") {
                video.play().catch(function () {});
                return;
            }
            video.setAttribute("data-ready", "1");
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal && hlsInstance) {
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hlsInstance.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hlsInstance.recoverMediaError();
                        } else {
                            showError();
                        }
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", function () {
                    video.play().catch(function () {});
                }, { once: true });
            } else {
                showError();
            }
        }
        if (playButton) {
            playButton.addEventListener("click", beginPlayback);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                beginPlayback();
            } else {
                video.pause();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        setupImages();
        setupMenu();
        setupHero();
        setupFeatureSlider();
        setupFilters();
        setupPlayer();
    });
})();
