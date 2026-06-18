(function () {
  function attachStream(video, url, onReady) {
    if (!video || !url) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = url;
        video.load();
      }
      onReady();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!video.__hlsPlayer) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        video.__hlsPlayer = hls;
        hls.on(window.Hls.Events.MANIFEST_PARSED, onReady);
      } else {
        onReady();
      }
      return;
    }

    if (!video.src) {
      video.src = url;
      video.load();
    }
    onReady();
  }

  function start(shell) {
    const video = shell.querySelector('video');
    const overlay = shell.querySelector('.player-start');
    const url = video ? video.getAttribute('data-stream') : '';

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    attachStream(video, url, function () {
      video.play().catch(function () {});
    });
  }

  document.querySelectorAll('.player-shell').forEach(function (shell) {
    const overlay = shell.querySelector('.player-start');
    const video = shell.querySelector('video');

    if (overlay) {
      overlay.addEventListener('click', function () {
        start(shell);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start(shell);
        }
      });
    }
  });
})();
