(function () {
    var header = document.querySelector(".site-header");
    var menuToggle = document.querySelector("[data-menu-toggle]");
    if (menuToggle && header) {
        menuToggle.addEventListener("click", function () {
            header.classList.toggle("open");
        });
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var index = 0;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
            });
        });

        show(0);

        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    function setupFilters() {
        var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        var regionSelect = document.querySelector("[data-filter-region]");
        var typeSelect = document.querySelector("[data-filter-type]");
        var yearSelect = document.querySelector("[data-filter-year]");
        var sortSelect = document.querySelector("[data-sort-select]");
        var grid = document.querySelector("[data-movie-grid]");
        var emptyState = document.querySelector("[data-empty-state]");
        var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".movie-card")) : [];

        if (!grid || !cards.length) {
            searchInputs.forEach(function (input) {
                input.addEventListener("keydown", function (event) {
                    if (event.key === "Enter" && input.value.trim()) {
                        window.location.href = "search.html?q=" + encodeURIComponent(input.value.trim());
                    }
                });
            });
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        if (initialQuery) {
            searchInputs.forEach(function (input) {
                input.value = initialQuery;
            });
        }

        function apply() {
            var query = normalize(searchInputs[0] ? searchInputs[0].value : "");
            var region = regionSelect ? regionSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var year = yearSelect ? yearSelect.value : "";
            var shown = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search"));
                var ok = true;

                if (query && haystack.indexOf(query) === -1) {
                    ok = false;
                }

                if (region && card.getAttribute("data-region") !== region) {
                    ok = false;
                }

                if (type && card.getAttribute("data-type") !== type) {
                    ok = false;
                }

                if (year && card.getAttribute("data-year") !== year) {
                    ok = false;
                }

                card.classList.toggle("hidden-card", !ok);

                if (ok) {
                    shown += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("show", shown === 0);
            }
        }

        function sortCards() {
            if (!sortSelect) {
                return;
            }

            var value = sortSelect.value;
            var sorted = cards.slice();

            sorted.sort(function (a, b) {
                if (value === "year") {
                    return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
                }

                if (value === "heat") {
                    return Number(b.getAttribute("data-heat")) - Number(a.getAttribute("data-heat"));
                }

                if (value === "score") {
                    return Number(b.getAttribute("data-score")) - Number(a.getAttribute("data-score"));
                }

                return Number(a.getAttribute("data-order")) - Number(b.getAttribute("data-order"));
            });

            sorted.forEach(function (card) {
                grid.appendChild(card);
            });

            cards = sorted;
            apply();
        }

        searchInputs.forEach(function (input) {
            input.addEventListener("input", function () {
                searchInputs.forEach(function (other) {
                    if (other !== input) {
                        other.value = input.value;
                    }
                });
                apply();
            });

            input.addEventListener("keydown", function (event) {
                if (event.key === "Enter" && input.value.trim() && !grid.hasAttribute("data-search-page")) {
                    window.location.href = "search.html?q=" + encodeURIComponent(input.value.trim());
                }
            });
        });

        [regionSelect, typeSelect, yearSelect].forEach(function (select) {
            if (select) {
                select.addEventListener("change", apply);
            }
        });

        if (sortSelect) {
            sortSelect.addEventListener("change", sortCards);
        }

        sortCards();
        apply();
    }

    function setupPlayer() {
        var player = document.querySelector("[data-player]");
        if (!player) {
            return;
        }

        var video = player.querySelector("video");
        var overlay = player.querySelector(".player-overlay");
        var playButtons = Array.prototype.slice.call(player.querySelectorAll("[data-play-toggle]"));
        var muteButton = player.querySelector("[data-mute-toggle]");
        var fullButton = player.querySelector("[data-fullscreen-toggle]");
        var source = player.getAttribute("data-src");
        var fallback = player.getAttribute("data-fallback-src") || "./assets/media/preview.mp4";
        var hls = null;
        var fallbackLoaded = false;

        if (!video) {
            return;
        }

        function loadFallback() {
            if (fallbackLoaded) {
                return;
            }

            fallbackLoaded = true;

            if (hls) {
                try {
                    hls.destroy();
                } catch (error) {}
                hls = null;
            }

            video.src = fallback;
            video.load();
        }

        function loadSource() {
            if (source && window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 60
                });

                hls.loadSource(source);
                hls.attachMedia(video);

                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        loadFallback();
                    }
                });

                return;
            }

            if (source && video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("error", loadFallback, { once: true });
                return;
            }

            loadFallback();
        }

        function setPlayingState(isPlaying) {
            if (overlay) {
                overlay.classList.toggle("hidden", isPlaying);
            }

            playButtons.forEach(function (button) {
                button.setAttribute("aria-label", isPlaying ? "暂停" : "播放");
                if (button.hasAttribute("data-control-label")) {
                    button.textContent = isPlaying ? "暂停" : "播放";
                }
            });
        }

        playButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                if (video.paused) {
                    video.play().catch(function () {
                        loadFallback();
                        video.play().catch(function () {});
                    });
                } else {
                    video.pause();
                }
            });
        });

        if (muteButton) {
            muteButton.addEventListener("click", function () {
                video.muted = !video.muted;
                muteButton.textContent = video.muted ? "取消静音" : "静音";
            });
        }

        if (fullButton) {
            fullButton.addEventListener("click", function () {
                var target = player.querySelector(".player-frame") || video;
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (target.requestFullscreen) {
                    target.requestFullscreen();
                }
            });
        }

        video.addEventListener("play", function () {
            setPlayingState(true);
        });

        video.addEventListener("pause", function () {
            setPlayingState(false);
        });

        video.addEventListener("ended", function () {
            setPlayingState(false);
        });

        video.addEventListener("error", function () {
            loadFallback();
        });

        loadSource();
    }

    setupHero();
    setupFilters();
    setupPlayer();
})();
