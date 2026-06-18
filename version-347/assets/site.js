(function() {
  "use strict";

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function basePath() {
    return document.documentElement.getAttribute("data-base") || ".";
  }

  function resolvePath(path) {
    if (!path) {
      return "#";
    }
    if (/^(https?:)?\/\//.test(path) || path.charAt(0) === "#") {
      return path;
    }
    var base = basePath();
    return (base === "." ? "./" : base + "/") + path.replace(/^\.\//, "");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMenu() {
    var button = qs("[data-menu-toggle]");
    var nav = qs("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function() {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var slides = qsa("[data-hero-slide]");
    var dots = qsa("[data-hero-dot]");
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function(slide, position) {
        slide.classList.toggle("active", position === active);
      });
      dots.forEach(function(dot, position) {
        dot.classList.toggle("active", position === active);
      });
    }

    function play() {
      timer = window.setInterval(function() {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });

    show(0);
    play();
  }

  function initCurrentFilter() {
    var input = qs("[data-filter-input]");
    var cards = qsa("[data-movie-card]");
    if (!input || !cards.length) {
      return;
    }
    input.addEventListener("input", function() {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function(card) {
        var haystack = (card.getAttribute("data-keywords") || "").toLowerCase();
        card.style.display = !keyword || haystack.indexOf(keyword) !== -1 ? "" : "none";
      });
    });
  }

  function resultItem(item) {
    return "<a class=\"search-result\" href=\"" + escapeHtml(resolvePath(item.url)) + "\">" +
      "<img src=\"" + escapeHtml(resolvePath(item.cover)) + "\" alt=\"" + escapeHtml(item.title) + "\">" +
      "<div><strong>" + escapeHtml(item.title) + "</strong>" +
      "<p>" + escapeHtml(item.year + " · " + item.region + " · " + item.type) + "</p>" +
      "<p>" + escapeHtml(item.oneLine) + "</p></div></a>";
  }

  function initSearch() {
    var panel = qs("[data-search-panel]");
    var input = qs("[data-search-input]");
    var results = qs("[data-search-results]");
    var form = qs("[data-search-form]");
    if (!panel || !input || !results || !form) {
      return;
    }

    function open() {
      panel.hidden = false;
      document.body.style.overflow = "hidden";
      window.setTimeout(function() {
        input.focus();
      }, 30);
    }

    function close() {
      panel.hidden = true;
      document.body.style.overflow = "";
    }

    function render() {
      var query = input.value.trim().toLowerCase();
      if (!query) {
        results.innerHTML = "";
        return;
      }
      var source = window.SEARCH_INDEX || [];
      var matched = source.filter(function(item) {
        return item.searchText.indexOf(query) !== -1;
      }).slice(0, 18);
      results.innerHTML = matched.length ? matched.map(resultItem).join("") : "<p>没有找到匹配影片</p>";
    }

    qsa("[data-search-open]").forEach(function(button) {
      button.addEventListener("click", open);
    });

    qsa("[data-search-close]").forEach(function(button) {
      button.addEventListener("click", close);
    });

    input.addEventListener("input", render);

    form.addEventListener("submit", function(event) {
      event.preventDefault();
      var first = qs(".search-result", results);
      if (first) {
        window.location.href = first.href;
      }
    });

    document.addEventListener("keydown", function(event) {
      if (event.key === "Escape" && !panel.hidden) {
        close();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function() {
    initMenu();
    initHero();
    initCurrentFilter();
    initSearch();
  });
})();
