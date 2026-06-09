(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function bindMobileNav() {
        var toggle = document.querySelector('.nav-toggle');
        var nav = document.querySelector('.site-nav');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function bindHero() {
        var slides = selectAll('.hero-slide');
        var dots = selectAll('.hero-dot');
        if (slides.length <= 1) {
            return;
        }
        var active = 0;
        var timer = null;
        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle('active', idx === active);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle('active', idx === active);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }
        dots.forEach(function (dot, idx) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(idx);
                start();
            });
        });
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function bindFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        if (!panel) {
            return;
        }
        var search = panel.querySelector('[data-search]');
        var category = panel.querySelector('[data-category]');
        var type = panel.querySelector('[data-type]');
        var year = panel.querySelector('[data-year]');
        var cards = selectAll('.movie-card');
        function apply() {
            var keyword = normalize(search && search.value);
            var categoryValue = normalize(category && category.value);
            var typeValue = normalize(type && type.value);
            var yearValue = normalize(year && year.value);
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matchKeyword = !keyword || haystack.indexOf(keyword) >= 0;
                var matchCategory = !categoryValue || normalize(card.getAttribute('data-category')) === categoryValue;
                var matchType = !typeValue || normalize(card.getAttribute('data-type')) === typeValue;
                var matchYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
                card.classList.toggle('hidden', !(matchKeyword && matchCategory && matchType && matchYear));
            });
        }
        [search, category, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        bindMobileNav();
        bindHero();
        bindFilters();
    });
})();
