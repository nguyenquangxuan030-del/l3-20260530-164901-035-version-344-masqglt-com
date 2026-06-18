(function () {
  const cards = document.querySelectorAll(".player-card");

  cards.forEach(function (card) {
    const video = card.querySelector("video");
    const overlay = card.querySelector(".play-overlay");
    const button = card.querySelector(".play-overlay button");
    const message = card.querySelector(".player-message");

    if (!video) {
      return;
    }

    const src = video.currentSrc || video.getAttribute("src");

    function showMessage(text) {
      if (message) {
        message.textContent = text;
        message.classList.add("show");
      }
    }

    if (src && window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showMessage("视频暂时无法播放");
        }
      });
    } else if (src && video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (!src) {
      showMessage("视频暂时无法播放");
    }

    function beginPlay() {
      if (overlay) {
        overlay.classList.add("hidden");
      }

      const action = video.play();

      if (action && typeof action.catch === "function") {
        action.catch(function () {
          if (overlay) {
            overlay.classList.remove("hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", beginPlay);
    }

    if (overlay) {
      overlay.addEventListener("click", function (event) {
        if (event.target === overlay) {
          beginPlay();
        }
      });
    }

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (video.currentTime === 0 && overlay) {
        overlay.classList.remove("hidden");
      }
    });
  });
})();
