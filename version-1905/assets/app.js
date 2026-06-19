(function () {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    const hero = document.querySelector("[data-hero]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        let current = 0;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-current", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-current", dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                show(current + 1);
            }, 5200);
        }
    }

    document.querySelectorAll("[data-global-search-form]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            const input = form.querySelector("input[name='q']");
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = "./search.html";
            }
        });
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
        const input = panel.querySelector("[data-filter-input]");
        const yearSelect = panel.querySelector("[data-filter-year]");
        const typeSelect = panel.querySelector("[data-filter-type]");
        const list = panel.parentElement.querySelector("[data-card-list]");
        const cards = list ? Array.from(list.querySelectorAll("[data-card]")) : [];
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q") || "";

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyFilter() {
            const query = normalize(input ? input.value : "");
            const year = yearSelect ? yearSelect.value : "";
            const type = typeSelect ? typeSelect.value : "";

            cards.forEach(function (card) {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.genre,
                    card.dataset.type,
                    card.dataset.tags
                ].join(" "));
                const matchQuery = !query || haystack.indexOf(query) !== -1;
                const matchYear = !year || card.dataset.year === year;
                const matchType = !type || card.dataset.type === type;
                card.classList.toggle("is-hidden", !(matchQuery && matchYear && matchType));
            });
        }

        [input, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });

        applyFilter();
    });
}());
