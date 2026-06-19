(function () {
  var frame = document.querySelector('.js-player');
  if (!frame) {
    return;
  }

  var video = frame.querySelector('video');
  var cover = frame.querySelector('.js-play-toggle');
  var status = frame.querySelector('.js-player-status');
  var hls = null;
  var prepared = false;
  var source = video ? video.getAttribute('data-video') : '';

  function setStatus(text) {
    if (status) {
      status.textContent = text;
    }
  }

  function prepare() {
    if (!video || !source || prepared) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          setStatus('暂时无法播放，请稍后再试');
          hls.destroy();
        }
      });
      return;
    }

    setStatus('暂时无法播放，请稍后再试');
  }

  function startPlay() {
    prepare();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      });
    }
  }

  prepare();

  if (cover) {
    cover.addEventListener('click', startPlay);
  }

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
