(function () {
    var header = document.getElementById('site-header');
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 20) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var active = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === active);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === active);
        });
    }

    if (slides.length) {
        showSlide(0);
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(active - 1);
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                showSlide(active + 1);
            });
        }
        window.setInterval(function () {
            showSlide(active + 1);
        }, 5000);
    }

    var searchInput = document.querySelector('[data-search-input]');
    var searchCards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
    var activeFilter = 'all';

    function applySearch() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        searchCards.forEach(function (card) {
            var text = (card.getAttribute('data-search-card') || '').toLowerCase();
            var group = card.getAttribute('data-group') || '';
            var matchedText = !query || text.indexOf(query) !== -1;
            var matchedGroup = activeFilter === 'all' || group === activeFilter;
            card.classList.toggle('hidden-by-search', !(matchedText && matchedGroup));
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', applySearch);
    }

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            activeFilter = chip.getAttribute('data-filter-chip') || 'all';
            chips.forEach(function (item) {
                item.classList.toggle('is-active', item === chip);
            });
            applySearch();
        });
    });
})();

function initMoviePlayer(videoId, buttonId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.querySelector('[data-player-overlay="' + videoId + '"]');
    var prepared = false;
    var hls = null;

    function prepare() {
        if (!video || prepared) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
        prepared = true;
    }

    function play() {
        prepare();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        if (video) {
            video.play().catch(function () {});
        }
    }

    if (button) {
        button.addEventListener('click', play);
    }
    if (overlay) {
        overlay.addEventListener('click', play);
    }
    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
    }
}

(function () {
    var copies = Array.prototype.slice.call(document.querySelectorAll('[data-hero-copy]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!copies.length || !dots.length) {
        return;
    }
    function syncCopies() {
        var activeIndex = dots.findIndex(function (dot) {
            return dot.classList.contains('is-active');
        });
        if (activeIndex < 0) {
            activeIndex = 0;
        }
        copies.forEach(function (copy, index) {
            copy.style.display = index === activeIndex ? '' : 'none';
        });
    }
    window.setInterval(syncCopies, 250);
    syncCopies();
})();
