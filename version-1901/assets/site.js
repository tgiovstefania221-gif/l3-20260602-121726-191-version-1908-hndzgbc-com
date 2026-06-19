(function () {
  'use strict';

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function pagePrefix() {
    return document.body.getAttribute('data-page-prefix') || '';
  }

  function withPrefix(path) {
    if (/^(https?:)?\/\//.test(path)) {
      return path;
    }
    return pagePrefix() + path.replace(/^\.\//, '');
  }

  function initMenu() {
    var toggle = qs('[data-menu-toggle]');
    if (!toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  function initHero() {
    var carousel = qs('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = qsa('[data-hero-slide]', carousel);
    var dots = qsa('[data-hero-dot]', carousel);
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  function initImageFallback() {
    qsa('img').forEach(function (image) {
      image.addEventListener('error', function () {
        var wrapper = image.closest('.poster-link, .hero-poster, .detail-cover, .rank-cover, .search-result-item');
        if (wrapper) {
          wrapper.classList.add('image-error');
        }
      }, { once: true });
    });
  }

  function initSearch() {
    var searchBox = qs('[data-search-box]');
    if (!searchBox || !window.SEARCH_INDEX) {
      return;
    }

    var input = qs('[data-search-input]', searchBox);
    var results = qs('[data-search-results]', searchBox);
    if (!input || !results) {
      return;
    }

    function closeResults() {
      results.classList.remove('is-open');
    }

    function render(items) {
      if (!items.length) {
        results.innerHTML = '<div class="search-empty">没有找到匹配内容</div>';
        results.classList.add('is-open');
        return;
      }

      results.innerHTML = items.slice(0, 30).map(function (item) {
        return [
          '<a class="search-result-item" href="' + withPrefix(item.url) + '">',
          '  <img src="' + withPrefix(item.cover) + '" alt="' + escapeHtml(item.title) + '">',
          '  <span>',
          '    <strong>' + escapeHtml(item.title) + '</strong>',
          '    <span>' + escapeHtml(item.year + ' · ' + item.category + ' · ' + item.type) + '</span>',
          '    <p>' + escapeHtml(item.oneLine) + '</p>',
          '  </span>',
          '</a>'
        ].join('');
      }).join('');
      results.classList.add('is-open');
    }

    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      if (!query) {
        closeResults();
        return;
      }

      var words = query.split(/\s+/).filter(Boolean);
      var matches = window.SEARCH_INDEX.filter(function (item) {
        var haystack = [
          item.title,
          item.year,
          item.category,
          item.type,
          item.genre,
          item.tags,
          item.oneLine
        ].join(' ').toLowerCase();
        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      });

      render(matches);
    });

    document.addEventListener('click', function (event) {
      if (!searchBox.contains(event.target)) {
        closeResults();
      }
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initFilters() {
    qsa('[data-filter-panel]').forEach(function (panel) {
      var grid = qs('[data-filter-grid]');
      if (!grid) {
        return;
      }

      var cards = qsa('[data-movie-card]', grid);
      var keywordInput = qs('[data-filter-keyword]', panel);
      var yearSelect = qs('[data-filter-year]', panel);
      var typeSelect = qs('[data-filter-type]', panel);
      var countNode = qs('[data-filter-count]', panel);

      function apply() {
        var keyword = (keywordInput && keywordInput.value || '').trim().toLowerCase();
        var year = yearSelect && yearSelect.value || '';
        var type = typeSelect && typeSelect.value || '';
        var visible = 0;

        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' ').toLowerCase();
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchYear = !year || card.getAttribute('data-year') === year;
          var matchType = !type || card.getAttribute('data-type') === type;
          var show = matchKeyword && matchYear && matchType;

          card.classList.toggle('is-hidden-by-filter', !show);
          if (show) {
            visible += 1;
          }
        });

        if (countNode) {
          countNode.textContent = visible;
        }
      }

      [keywordInput, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function initPlayers() {
    qsa('[data-player-module]').forEach(function (module) {
      var video = qs('video', module);
      var button = qs('[data-play-button]', module);
      var initialized = false;

      if (!video || !button) {
        return;
      }

      function startPlayer() {
        var source = video.getAttribute('data-src');
        if (!source) {
          return;
        }

        if (!initialized) {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else {
            video.src = source;
          }
          initialized = true;
        }

        button.classList.add('is-hidden');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      }

      button.addEventListener('click', startPlayer);
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          button.classList.remove('is-hidden');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initImageFallback();
    initSearch();
    initFilters();
    initPlayers();
  });
})();
