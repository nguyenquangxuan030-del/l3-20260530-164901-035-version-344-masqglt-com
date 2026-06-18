(function () {
  const toggle = document.querySelector(".menu-toggle");
  const panel = document.querySelector(".mobile-panel");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      const open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  let active = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    active = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === active);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === active);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  const query = new URLSearchParams(window.location.search).get("q") || "";
  const searchInputs = document.querySelectorAll('input[name="q"]');

  searchInputs.forEach(function (input) {
    if (query) {
      input.value = query;
    }
  });

  const localSearch = document.querySelector("[data-local-search]");
  const scope = document.querySelector("[data-search-scope]");
  const empty = document.querySelector(".empty-state");

  function filterCards(value) {
    if (!scope) {
      return;
    }

    const cards = Array.from(scope.querySelectorAll(".movie-card"));
    const keyword = String(value || "").trim().toLowerCase();
    let visible = 0;

    cards.forEach(function (card) {
      const haystack = (card.getAttribute("data-search") || "").toLowerCase();
      const matched = !keyword || haystack.indexOf(keyword) !== -1;
      card.style.display = matched ? "" : "none";

      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("show", visible === 0);
    }
  }

  if (query) {
    filterCards(query);
  }

  if (localSearch) {
    localSearch.addEventListener("input", function () {
      filterCards(localSearch.value);
    });
  }

  const jumpButtons = document.querySelectorAll("[data-jump]");
  jumpButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const target = document.querySelector(button.getAttribute("data-jump"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
})();
