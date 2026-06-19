(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var searchForms = document.querySelectorAll('[data-global-search]');
  searchForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var target = 'search.html';
      if (query) {
        target += '?q=' + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
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

    function startHero() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startHero();
      });
    }

    showSlide(0);
    startHero();
  }

  var panels = document.querySelectorAll('[data-filter-panel]');
  panels.forEach(function (panel) {
    var section = panel.closest('section') || document;
    var input = panel.querySelector('[data-filter-input]');
    var year = panel.querySelector('[data-year-filter]');
    var type = panel.querySelector('[data-type-filter]');
    var list = section.querySelector('[data-card-list]');
    var empty = section.querySelector('[data-empty-state]');
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function filterCards() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      var t = type ? type.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region'),
          card.getAttribute('data-category'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var okQuery = !q || text.indexOf(q) !== -1;
        var okYear = !y || card.getAttribute('data-year') === y;
        var okType = !t || card.getAttribute('data-type') === t;
        var show = okQuery && okYear && okType;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });

    filterCards();
  });

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existed = document.querySelector('script[src="' + src + '"]');
      if (existed) {
        existed.addEventListener('load', resolve, { once: true });
        if (window.Hls) {
          resolve();
        }
        return;
      }
      var script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function playVideo(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var source = player.getAttribute('data-src');

    if (!video || !source) {
      return;
    }

    function begin() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
      if (button) {
        button.classList.add('is-hidden');
      }
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== source) {
        video.src = source;
      }
      begin();
      return;
    }

    function useHls() {
      if (window.Hls && window.Hls.isSupported()) {
        if (player._hls) {
          player._hls.destroy();
        }
        var hls = new window.Hls({ enableWorker: true });
        player._hls = hls;
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, begin);
      } else {
        video.src = source;
        begin();
      }
    }

    if (window.Hls) {
      useHls();
    } else {
      loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest')
        .then(useHls)
        .catch(function () {
          video.src = source;
          begin();
        });
    }
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var button = player.querySelector('[data-play-button]');
    if (button) {
      button.addEventListener('click', function () {
        playVideo(player);
      });
    }
    player.addEventListener('dblclick', function () {
      playVideo(player);
    });
  });
})();
