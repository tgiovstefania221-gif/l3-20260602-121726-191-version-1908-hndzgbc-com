(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
      document.body.classList.toggle('menu-open', mobileNav.classList.contains('open'));
    });
  }

  all('[data-hero]').forEach(function (hero) {
    var slides = all('.hero-slide', hero);
    var dots = all('.hero-dot', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) return;
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function move(step) {
      show(index + step);
    }

    function start() {
      stop();
      timer = setInterval(function () {
        move(1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        move(-1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        move(1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  var searchInput = document.querySelector('[data-search-input]');
  var yearSelect = document.querySelector('[data-year-filter]');
  var categorySelect = document.querySelector('[data-category-filter]');
  var emptyResult = document.querySelector('[data-empty-result]');

  function filterCards() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    var category = categorySelect ? categorySelect.value : '';
    var visible = 0;

    all('[data-search]').forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var cardCategory = card.getAttribute('data-category') || '';
      var ok = true;

      if (query && text.indexOf(query) === -1) ok = false;
      if (year && cardYear !== year) ok = false;
      if (category && cardCategory !== category) ok = false;

      card.classList.toggle('hidden-card', !ok);
      if (ok) visible += 1;
    });

    if (emptyResult) {
      emptyResult.classList.toggle('show', visible === 0);
    }
  }

  if (searchInput) searchInput.addEventListener('input', filterCards);
  if (yearSelect) yearSelect.addEventListener('change', filterCards);
  if (categorySelect) categorySelect.addEventListener('change', filterCards);
  filterCards();
})();

function initPlayer(videoId, overlayId, streamUrl) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var started = false;
  var hlsInstance = null;

  function attach() {
    if (!video || started) return;
    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls();
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    if (overlay) {
      overlay.classList.add('hidden');
    }

    var action = video.play();
    if (action && typeof action.catch === 'function') {
      action.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', attach);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!started) attach();
    });
    video.addEventListener('play', function () {
      if (overlay) overlay.classList.add('hidden');
    });
    video.addEventListener('emptied', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }
}
