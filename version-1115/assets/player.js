(function () {
    function initMoviePlayer(source) {
        var video = document.querySelector('[data-player-video]');
        var button = document.querySelector('[data-player-button]');
        if (!video || !source) {
            return;
        }
        var ready = false;
        function bindSource() {
            if (ready) {
                return;
            }
            ready = true;
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
        }
        function start() {
            bindSource();
            if (button) {
                button.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }
        if (button) {
            button.addEventListener('click', start);
        }
        video.addEventListener('click', start);
        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });
        video.addEventListener('pause', function () {
            if (button && video.currentTime === 0) {
                button.classList.remove('is-hidden');
            }
        });
        bindSource();
    }

    window.initMoviePlayer = initMoviePlayer;
})();
