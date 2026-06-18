(function () {
  var doc = document;

  function qs(selector, scope) {
    return (scope || doc).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || doc).querySelectorAll(selector));
  }

  var menuButton = qs(".menu-toggle");
  var mobilePanel = qs(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var opened = mobilePanel.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  qsa(".site-search-form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      var value = input ? input.value.trim() : "";
      var url = form.getAttribute("data-search-url") || form.getAttribute("action") || "search.html";
      if (value) {
        event.preventDefault();
        window.location.href = url + "?q=" + encodeURIComponent(value);
      }
    });
  });

  qsa(".hero-carousel").forEach(function (carousel) {
    var slides = qsa(".hero-slide", carousel);
    var dots = qsa(".hero-dot", carousel);
    var prev = qs(".hero-arrow.prev", carousel);
    var next = qs(".hero-arrow.next", carousel);
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === active);
      });

      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === active);
      });
    }

    function autoplay() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        autoplay();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        autoplay();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        autoplay();
      });
    });

    show(0);
    autoplay();
  });

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function runFilter(scope, query, chipValue) {
    var cards = qsa(".movie-card", scope);
    var empty = qs(".empty-state", scope);
    var keywords = normalize(query);
    var filterValue = normalize(chipValue || "all");
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-tags"),
        card.textContent
      ].join(" "));

      var keywordMatched = !keywords || haystack.indexOf(keywords) !== -1;
      var chipMatched = filterValue === "all" || haystack.indexOf(filterValue) !== -1;
      var matched = keywordMatched && chipMatched;

      card.style.display = matched ? "" : "none";

      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  qsa("[data-filter-scope]").forEach(function (scope) {
    var input = qs(".movie-filter-input", scope);
    var chips = qsa(".filter-chip", scope);
    var activeChip = "all";

    function update() {
      runFilter(scope, input ? input.value : "", activeChip);
    }

    if (input) {
      input.addEventListener("input", update);

      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q");
      if (initial) {
        input.value = initial;
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        activeChip = chip.getAttribute("data-filter") || "all";
        update();
      });
    });

    update();
  });
})();
