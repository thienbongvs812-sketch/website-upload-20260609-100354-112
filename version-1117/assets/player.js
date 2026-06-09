(function () {
  var video = document.querySelector('[data-player-video]');
  var trigger = document.querySelector('[data-player-trigger]');
  var wrap = document.querySelector('[data-player-wrap]');
  var hlsInstance = null;

  if (!video || !trigger) {
    return;
  }

  function hideTrigger() {
    trigger.classList.add('is-hidden');
  }

  function attachSource() {
    var source = video.getAttribute('data-src');

    if (!source) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (hlsInstance) {
        hlsInstance.destroy();
      }

      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {});
      }, { once: true });
    } else {
      video.src = source;
      video.play().catch(function () {});
    }
  }

  function startPlayback() {
    hideTrigger();

    if (!video.src && !hlsInstance) {
      attachSource();
      return;
    }

    video.play().catch(function () {});
  }

  trigger.addEventListener('click', startPlayback);

  if (wrap) {
    wrap.addEventListener('click', function (event) {
      if (event.target === trigger || event.target === video) {
        return;
      }

      startPlayback();
    });
  }

  video.addEventListener('play', hideTrigger);
  video.addEventListener('pause', function () {
    if (video.currentTime === 0) {
      trigger.classList.remove('is-hidden');
    }
  });
})();
