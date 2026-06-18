(function () {
  const onReady = function (callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  };

  const setupHeader = function () {
    const header = document.querySelector("[data-site-header]");
    const toggle = document.querySelector("[data-mobile-toggle]");
    const panel = document.querySelector("[data-mobile-panel]");

    const syncHeader = function () {
      if (header) {
        header.classList.toggle("is-scrolled", window.scrollY > 8);
      }
    };

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }
  };

  const setupGlobalSearch = function () {
    document.querySelectorAll("[data-global-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const input = form.querySelector("input[name='q']");
        const value = input ? input.value.trim() : "";
        const query = value ? "?q=" + encodeURIComponent(value) : "";
        window.location.href = "./movies.html" + query;
      });
    });
  };

  const setupLocalFilter = function () {
    const input = document.querySelector("[data-local-search]");
    const cards = Array.from(document.querySelectorAll("[data-card]"));
    const chips = Array.from(document.querySelectorAll("[data-filter-chip]"));
    const empty = document.querySelector("[data-empty-state]");

    if (!input || cards.length === 0) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const incoming = params.get("q");
    if (incoming && !input.value) {
      input.value = incoming;
    }

    let activeChip = "";

    const applyFilter = function () {
      const query = input.value.trim().toLowerCase();
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = ((card.dataset.title || "") + " " + (card.dataset.tags || "")).toLowerCase();
        const matchQuery = !query || haystack.includes(query);
        const matchChip = !activeChip || haystack.includes(activeChip.toLowerCase());
        const shouldShow = matchQuery && matchChip;
        card.classList.toggle("is-hidden", !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    };

    input.addEventListener("input", applyFilter);

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeChip = chip.dataset.filterChip || "";
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip);
        });
        applyFilter();
      });
    });

    applyFilter();
  };

  const setupHero = function () {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let index = 0;

    const show = function (nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.dataset.heroDot || 0));
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  };

  window.initMoviePlayer = function (streamUrl) {
    const video = document.querySelector("[data-movie-video]");
    const cover = document.querySelector("[data-play-cover]");
    const trigger = document.querySelector("[data-play-trigger]");

    if (!video || !streamUrl) {
      return;
    }

    let hls = null;
    let bound = false;

    const bindStream = function () {
      if (bound) {
        return;
      }

      const Hls = window.Hls;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      bound = true;
    };

    const play = function () {
      bindStream();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      video.play().catch(function () {});
    };

    if (cover) {
      cover.addEventListener("click", play);
    }

    if (trigger) {
      trigger.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };

  onReady(function () {
    setupHeader();
    setupGlobalSearch();
    setupLocalFilter();
    setupHero();
  });
})();
