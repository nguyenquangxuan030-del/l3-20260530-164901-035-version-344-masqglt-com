(function() {
  "use strict";

  function mount(id, source) {
    var root = document.getElementById(id);
    if (!root) {
      return;
    }

    var video = root.querySelector("video");
    var layer = root.querySelector("[data-play-layer]");
    var started = false;
    var hls = null;

    function hideLayer() {
      if (layer) {
        layer.classList.add("hidden");
      }
    }

    function bindSource() {
      if (started || !video || !source) {
        return;
      }
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      bindSource();
      hideLayer();
      var playback = video.play();
      if (playback && typeof playback.catch === "function") {
        playback.catch(function() {
          video.controls = true;
        });
      }
    }

    if (layer) {
      layer.addEventListener("click", play);
    }

    video.addEventListener("click", function() {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", hideLayer);

    window.addEventListener("pagehide", function() {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.MoviePlayer = {
    mount: mount
  };
})();
