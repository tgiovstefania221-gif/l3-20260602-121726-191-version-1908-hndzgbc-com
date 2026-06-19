(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var menu = document.querySelector('.nav-menu');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            var isOpen = menu.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('.hero-slide', hero);
        var dots = selectAll('.hero-dot', hero);
        var prev = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide')) || 0);
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function createResult(movie) {
        var link = document.createElement('a');
        link.className = 'search-result';
        link.href = movie.url;

        var image = document.createElement('img');
        image.src = movie.cover;
        image.alt = movie.title;
        image.loading = 'lazy';

        var text = document.createElement('span');
        var title = document.createElement('strong');
        title.textContent = movie.title;
        var meta = document.createElement('span');
        meta.textContent = [movie.year, movie.region, movie.genre].filter(Boolean).join(' · ');
        text.appendChild(title);
        text.appendChild(meta);

        link.appendChild(image);
        link.appendChild(text);
        return link;
    }

    function initGlobalSearch() {
        var input = document.querySelector('[data-global-search]');
        var panel = document.querySelector('[data-search-panel]');
        var data = window.MOVIE_SEARCH_INDEX || [];
        if (!input || !panel || !data.length) {
            return;
        }

        function render() {
            var query = input.value.trim().toLowerCase();
            panel.innerHTML = '';
            if (!query) {
                panel.classList.remove('show');
                return;
            }
            var hits = data.filter(function (movie) {
                return [movie.title, movie.year, movie.region, movie.genre, movie.category, movie.oneLine]
                    .join(' ')
                    .toLowerCase()
                    .indexOf(query) !== -1;
            }).slice(0, 10);
            hits.forEach(function (movie) {
                panel.appendChild(createResult(movie));
            });
            panel.classList.toggle('show', hits.length > 0);
        }

        input.addEventListener('input', render);
        input.addEventListener('focus', render);
        document.addEventListener('click', function (event) {
            if (!panel.contains(event.target) && event.target !== input) {
                panel.classList.remove('show');
            }
        });
    }

    function initPageFilter() {
        var filters = selectAll('.page-filter');
        if (!filters.length) {
            return;
        }
        filters.forEach(function (input) {
            input.addEventListener('input', function () {
                var query = input.value.trim().toLowerCase();
                selectAll('.movie-card').forEach(function (card) {
                    var text = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-year'),
                        card.textContent
                    ].join(' ').toLowerCase();
                    card.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
                });
            });
        });
    }

    function initBackTop() {
        var button = document.querySelector('.back-top');
        if (!button) {
            return;
        }
        window.addEventListener('scroll', function () {
            button.classList.toggle('show', window.scrollY > 500);
        }, { passive: true });
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initGlobalSearch();
        initPageFilter();
        initBackTop();
    });
})();
