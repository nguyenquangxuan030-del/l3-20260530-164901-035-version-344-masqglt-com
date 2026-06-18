(function () {
  document.querySelectorAll("[data-player]").forEach(function (box) {
    var video = box.querySelector("video");
    var overlay = box.querySelector(".player-overlay");
    var button = box.querySelector("[data-play-button]");
    var status = box.querySelector(".player-status");
    var stream = video ? video.getAttribute("data-stream") : "";
    var loaded = false;
    var hls = null;

    function setStatus(text) {
      if (status) {
        status.textContent = text || "";
      }
    }

    function prepare() {
      if (!video || !stream || loaded) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        loaded = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        loaded = true;
        return;
      }

      video.src = stream;
      loaded = true;
    }

    function play() {
      if (!video) {
        return;
      }

      prepare();

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      video.controls = true;
      setStatus("正在加载");

      var attempt = video.play();

      if (attempt && typeof attempt.then === "function") {
        attempt.then(function () {
          setStatus("");
        }).catch(function () {
          setStatus("点击视频继续播放");
        });
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!loaded) {
          play();
        }
      });

      video.addEventListener("playing", function () {
        setStatus("");
      });

      video.addEventListener("error", function () {
        setStatus("加载失败，请稍后重试");
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    }
  });
})();
