(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[type='search']");
        if (input && input.value.trim() === "") {
          event.preventDefault();
          input.focus();
        }
      });
    });

    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-missing");
      }, { once: true });
    });

    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var nextButton = slider.querySelector("[data-hero-next]");
    var prevButton = slider.querySelector("[data-hero-prev]");
    var dotHost = slider.querySelector("[data-hero-dots]");
    var active = 0;
    var timer = null;

    function drawDots() {
      if (!dotHost) {
        return;
      }
      dotHost.innerHTML = "";
      slides.forEach(function (_, index) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "切换到第" + (index + 1) + "屏");
        dot.addEventListener("click", function () {
          show(index);
          restart();
        });
        dotHost.appendChild(dot);
      });
    }

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      if (dotHost) {
        Array.prototype.slice.call(dotHost.children).forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === active);
        });
      }
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    drawDots();
    show(0);
    restart();

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        show(active + 1);
        restart();
      });
    }

    if (prevButton) {
      prevButton.addEventListener("click", function () {
        show(active - 1);
        restart();
      });
    }
  });
})();
