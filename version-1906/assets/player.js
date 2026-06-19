(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
  players.forEach(function (shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.play-overlay');
    var hlsInstance = null;

    var attach = function () {
      if (!video || video.getAttribute('data-ready') === '1') {
        return;
      }
      var stream = video.getAttribute('data-stream');
      if (!stream) {
        return;
      }
      video.setAttribute('data-ready', '1');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
    };

    var play = function () {
      attach();
      shell.classList.add('is-playing');
      var started = video.play();
      if (started && typeof started.catch === 'function') {
        started.catch(function () {});
      }
    };

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('ended', function () {
        if (hlsInstance && typeof hlsInstance.stopLoad === 'function') {
          hlsInstance.stopLoad();
        }
      });
    }
  });
})();
