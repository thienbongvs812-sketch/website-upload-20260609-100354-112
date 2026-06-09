(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "").trim();
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-menu]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = selectAll("[data-hero-slide]", slider);
        var buttons = selectAll("[data-slide-button]", slider);
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            buttons.forEach(function (button, buttonIndex) {
                button.classList.toggle("is-active", buttonIndex === current);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                show(Number(button.getAttribute("data-slide-button")) || 0);
                restart();
            });
        });
        start();
    }

    function runFilter(area) {
        var input = area.querySelector("[data-filter-search]");
        var yearSelect = area.querySelector("[data-filter-year]");
        var typeSelect = area.querySelector("[data-filter-type]");
        var cards = selectAll("[data-movie-card]", area);
        var empty = area.querySelector("[data-no-result]");
        var keyword = normalize(input ? input.value : "");
        var year = yearSelect ? yearSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        var visible = 0;
        cards.forEach(function (card) {
            var searchText = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-year"),
                card.getAttribute("data-type"),
                card.getAttribute("data-region"),
                card.getAttribute("data-genre"),
                card.textContent
            ].join(" "));
            var matchedKeyword = !keyword || searchText.indexOf(keyword) !== -1;
            var matchedYear = !year || card.getAttribute("data-year") === year;
            var matchedType = !type || card.getAttribute("data-type") === type;
            var matched = matchedKeyword && matchedYear && matchedType;
            card.style.display = matched ? "" : "none";
            if (matched) {
                visible += 1;
            }
        });
        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    }

    function setupFilters() {
        selectAll("[data-filter-area]").forEach(function (area) {
            var controls = selectAll("[data-filter-search], [data-filter-year], [data-filter-type]", area);
            controls.forEach(function (control) {
                control.addEventListener("input", function () {
                    runFilter(area);
                });
                control.addEventListener("change", function () {
                    runFilter(area);
                });
            });
            if (area.hasAttribute("data-query-page")) {
                var params = new URLSearchParams(window.location.search);
                var query = params.get("q");
                var input = area.querySelector("[data-filter-search]");
                if (query && input) {
                    input.value = query;
                }
            }
            runFilter(area);
        });
    }

    window.initMoviePlayer = function (source) {
        var video = document.querySelector(".movie-video");
        var cover = document.querySelector(".player-cover");
        var trigger = document.querySelector(".play-trigger");
        var hlsInstance = null;
        var loaded = false;
        if (!video || !source) {
            return;
        }
        function loadAndPlay() {
            if (!loaded) {
                if (video.canPlayType("application/vnd.apple.mpegURL")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
                loaded = true;
            }
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }
        if (cover) {
            cover.addEventListener("click", loadAndPlay);
        }
        if (trigger) {
            trigger.addEventListener("click", function (event) {
                event.stopPropagation();
                loadAndPlay();
            });
        }
        video.addEventListener("click", function () {
            if (!loaded) {
                loadAndPlay();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupHeroSlider();
        setupFilters();
    });
})();
