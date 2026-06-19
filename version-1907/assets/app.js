(function () {
  var header = document.querySelector('.site-header');
  var nav = document.querySelector('.main-nav');
  var toggle = document.querySelector('.nav-toggle');

  function setHeaderState() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  }

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restart();
      });
    });

    showSlide(0);
    restart();
  }

  var filterForm = document.querySelector('[data-filter-form]');
  if (filterForm) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var keyword = filterForm.querySelector('[data-filter-keyword]');
    var region = filterForm.querySelector('[data-filter-region]');
    var type = filterForm.querySelector('[data-filter-type]');
    var year = filterForm.querySelector('[data-filter-year]');
    var count = document.querySelector('[data-result-count]');
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery && keyword) {
      keyword.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var q = normalize(keyword && keyword.value);
      var selectedRegion = normalize(region && region.value);
      var selectedType = normalize(type && type.value);
      var selectedYear = normalize(year && year.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-summary'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var ok = true;

        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (selectedRegion && cardRegion !== selectedRegion) {
          ok = false;
        }
        if (selectedType && cardType !== selectedType) {
          ok = false;
        }
        if (selectedYear && cardYear !== selectedYear) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前筛选结果：' + visible + ' 部';
      }
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    filterForm.addEventListener('input', applyFilters);
    filterForm.addEventListener('change', applyFilters);
    applyFilters();
  }
})();
