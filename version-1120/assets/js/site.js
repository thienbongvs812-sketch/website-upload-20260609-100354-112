(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var navMenu = document.querySelector('[data-nav-menu]');

  if (menuButton && navMenu) {
    menuButton.addEventListener('click', function () {
      navMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero-carousel]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var countBox = document.querySelector('[data-result-count]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function applyFilters() {
    if (!filterPanel || !cards.length) {
      return;
    }

    var keywordInput = filterPanel.querySelector('[data-filter="keyword"]');
    var yearSelect = filterPanel.querySelector('[data-filter="year"]');
    var regionSelect = filterPanel.querySelector('[data-filter="region"]');
    var typeSelect = filterPanel.querySelector('[data-filter="type"]');
    var categorySelect = filterPanel.querySelector('[data-filter="category"]');

    var keyword = normalize(keywordInput ? keywordInput.value : '');
    var year = normalize(yearSelect ? yearSelect.value : '');
    var region = normalize(regionSelect ? regionSelect.value : '');
    var type = normalize(typeSelect ? typeSelect.value : '');
    var category = normalize(categorySelect ? categorySelect.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.category,
        card.textContent
      ].join(' '));
      var matched = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        matched = false;
      }
      if (year && normalize(card.dataset.year) !== year) {
        matched = false;
      }
      if (region && normalize(card.dataset.region) !== region) {
        matched = false;
      }
      if (type && normalize(card.dataset.type) !== type) {
        matched = false;
      }
      if (category && normalize(card.dataset.category) !== category) {
        matched = false;
      }

      card.classList.toggle('card-hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (countBox) {
      countBox.textContent = '已匹配 ' + visible + ' 部影片';
    }
  }

  if (filterPanel) {
    var keywordInput = filterPanel.querySelector('[data-filter="keyword"]');
    var incomingQuery = getQueryParam('q');

    if (keywordInput && incomingQuery) {
      keywordInput.value = incomingQuery;
    }

    filterPanel.addEventListener('input', applyFilters);
    filterPanel.addEventListener('change', applyFilters);
    applyFilters();
  }

  var playerButtons = Array.prototype.slice.call(document.querySelectorAll('[data-play-button]'));

  playerButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var card = button.closest('.player-card');
      var video = card ? card.querySelector('video') : null;
      var state = card ? card.querySelector('[data-player-state]') : null;

      if (!video) {
        return;
      }

      var stream = video.getAttribute('data-stream');
      button.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');

      function playVideo() {
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            button.classList.remove('is-hidden');
            if (state) {
              state.textContent = '点击继续播放';
            }
          });
        }
      }

      if (stream && window.Hls && window.Hls.isSupported()) {
        if (video._movieHls) {
          video._movieHls.destroy();
        }
        video._movieHls = new window.Hls({ enableWorker: true });
        video._movieHls.loadSource(stream);
        video._movieHls.attachMedia(video);
        video._movieHls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      } else if (stream && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
      } else if (stream) {
        video.src = stream;
        playVideo();
      }

      if (state) {
        state.textContent = '正在播放';
      }
    });
  });
})();
