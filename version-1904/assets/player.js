(function () {
    function mountPlayer(player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.play-overlay');
        var streamUrl = player.getAttribute('data-stream');
        var ready = false;
        var hls = null;

        if (!video || !streamUrl) {
            return;
        }

        function prepare() {
            if (ready) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            ready = true;
        }

        function start() {
            prepare();
            player.classList.add('is-playing');
            if (button) {
                button.setAttribute('hidden', '');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    player.classList.remove('is-playing');
                    if (button) {
                        button.removeAttribute('hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            player.classList.add('is-playing');
            if (button) {
                button.setAttribute('hidden', '');
            }
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0 || video.ended) {
                player.classList.remove('is-playing');
                if (button) {
                    button.removeAttribute('hidden');
                }
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('.player-wrap')).forEach(mountPlayer);
    });
})();
