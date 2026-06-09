(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var navPanel = document.querySelector('[data-nav-panel]');

  if (menuButton && navPanel) {
    menuButton.addEventListener('click', function () {
      navPanel.classList.toggle('is-open');
    });
  }

  var backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 320) {
        backTop.classList.add('is-visible');
      } else {
        backTop.classList.remove('is-visible');
      }
    });

    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var hero = document.querySelector('[data-hero-slider]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    var showSlide = function (nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    var start = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    start();
  }

  var filterGrid = document.querySelector('[data-filter-grid]');
  var searchInput = document.getElementById('movieSearchInput');
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-category]'));

  if (filterGrid && searchInput) {
    var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('[data-movie-card]'));
    var activeCategory = 'all';
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query) {
      searchInput.value = query;
    }

    var applyFilter = function () {
      var keyword = searchInput.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-category'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' ').toLowerCase();

        var cardCategory = card.getAttribute('data-category') || '';
        var cardType = haystack;
        var categoryMatched = activeCategory === 'all' || cardCategory === activeCategory || cardType.indexOf(activeCategory.toLowerCase()) !== -1;
        var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;

        card.classList.toggle('is-hidden', !(categoryMatched && keywordMatched));
      });
    };

    searchInput.addEventListener('input', applyFilter);

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (other) {
          other.classList.remove('is-active');
        });
        chip.classList.add('is-active');
        activeCategory = chip.getAttribute('data-filter-category') || 'all';
        applyFilter();
      });
    });

    applyFilter();
  }

  var hlsScriptLoading = false;
  var hlsReadyCallbacks = [];

  var loadHls = function (callback) {
    if (window.Hls) {
      callback();
      return;
    }

    hlsReadyCallbacks.push(callback);

    if (hlsScriptLoading) {
      return;
    }

    hlsScriptLoading = true;
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
    script.onload = function () {
      hlsReadyCallbacks.splice(0).forEach(function (fn) {
        fn();
      });
    };
    script.onerror = function () {
      hlsReadyCallbacks.splice(0).forEach(function (fn) {
        fn(new Error('hls'));
      });
    };
    document.head.appendChild(script);
  };

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-hls]'));

  players.forEach(function (shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');
    var url = shell.getAttribute('data-hls');
    var started = false;
    var hlsInstance = null;

    if (!video || !url) {
      return;
    }

    var begin = function () {
      if (started) {
        video.play().catch(function () {});
        return;
      }

      started = true;
      shell.classList.add('is-playing');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.play().catch(function () {});
        return;
      }

      loadHls(function (error) {
        if (!error && window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: false });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = url;
          video.play().catch(function () {});
        }
      });
    };

    if (cover) {
      cover.addEventListener('click', begin);
    }

    video.addEventListener('click', function () {
      if (!started) {
        begin();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
