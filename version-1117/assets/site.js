(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero-slider]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      showSlide(active + 1);
    }, 5600);
  }

  var input = document.querySelector('[data-search-input]');
  var clearButton = document.querySelector('[data-clear-search]');
  var regionSelect = document.querySelector('[data-filter-region]');
  var typeSelect = document.querySelector('[data-filter-type]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var state = document.querySelector('[data-search-state]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterCards() {
    if (!input && !regionSelect && !typeSelect) {
      return;
    }

    var keyword = normalize(input ? input.value : '');
    var region = normalize(regionSelect ? regionSelect.value : '');
    var type = normalize(typeSelect ? typeSelect.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-category'),
        card.getAttribute('data-tags')
      ].join(' '));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var cardType = normalize(card.getAttribute('data-type'));
      var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchRegion = !region || cardRegion === region;
      var matchType = !type || cardType === type;
      var show = matchKeyword && matchRegion && matchType;

      card.hidden = !show;

      if (show) {
        visible += 1;
      }
    });

    if (state) {
      state.textContent = keyword || region || type ? '当前筛选到 ' + visible + ' 部影片' : '';
    }
  }

  if (input) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q) {
      input.value = q;
    }

    input.addEventListener('input', filterCards);
  }

  if (regionSelect) {
    regionSelect.addEventListener('change', filterCards);
  }

  if (typeSelect) {
    typeSelect.addEventListener('change', filterCards);
  }

  if (clearButton) {
    clearButton.addEventListener('click', function () {
      if (input) {
        input.value = '';
      }

      if (regionSelect) {
        regionSelect.value = '';
      }

      if (typeSelect) {
        typeSelect.value = '';
      }

      filterCards();
    });
  }

  filterCards();
})();
