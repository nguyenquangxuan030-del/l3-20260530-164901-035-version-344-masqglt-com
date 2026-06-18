(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(function (frame) {
      var video = frame.querySelector("video");
      var button = frame.querySelector("button");
      var stream = frame.getAttribute("data-stream");
      var hls = null;
      var initialized = false;

      function start() {
        if (!video || !stream) {
          return;
        }

        if (!initialized) {
          initialized = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true });
            hls.loadSource(stream);
            hls.attachMedia(video);
          } else {
            video.src = stream;
          }
        }

        frame.classList.add("is-started");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", start);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (!initialized) {
            start();
          }
        });
        video.addEventListener("play", function () {
          frame.classList.add("is-started");
        });
      }

      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  });
})();
