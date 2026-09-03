/* 熾 -蕗原サウナ- */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* ---- 読み込み直後にロゴを押す ---- */
  addEventListener('load', function () { document.body.classList.add('is-ready'); });
  setTimeout(function () { document.body.classList.add('is-ready'); }, 700);

  /* ---- 出現（ScrollTrigger.batch のかわり） ---- */
  var groups = document.querySelectorAll('[data-g]');
  for (var g = 0; g < groups.length; g++) {
    var kids = groups[g].querySelectorAll('.reveal');
    for (var k = 0; k < kids.length; k++) {
      kids[k].style.transitionDelay = (k * 80) + 'ms';
    }
  }

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -20% 0px' });

  document.querySelectorAll('.reveal, .vt, .foo, .acc__map').forEach(function (el) { io.observe(el); });

  /* ---- スクロール量をCSS変数に流す（ヘッダーの縮みとヒーローのパララックス） ---- */
  var hero = document.querySelector('.hero__photo');
  var small = matchMedia('(max-width: 1024px)');
  var ticking = false;

  function onScroll() {
    var y = scrollY;
    root.style.setProperty('--hp', Math.min(1, Math.max(0, y / 110)).toFixed(3));
    if (!reduce && small.matches && hero) {
      var r = hero.getBoundingClientRect();
      var start = innerHeight * 0.8, end = innerHeight * 0.2;
      var p = (start - r.top) / (start - end);
      root.style.setProperty('--scrub', Math.min(1, Math.max(0, p)).toFixed(3));
    } else {
      root.style.setProperty('--scrub', '0');
    }
    ticking = false;
  }
  addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onScroll);
  }, { passive: true });
  onScroll();

  /* ---- ギャラリー帯 ---- */
  var strip = document.getElementById('galStrip');
  if (strip) {
    document.querySelectorAll('[data-gal]').forEach(function (b) {
      b.addEventListener('click', function () {
        var d = Number(b.dataset.gal);
        strip.scrollBy({ left: d * 360, behavior: reduce ? 'auto' : 'smooth' });
      });
    });
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('is-active', e.isIntersecting); });
    }, { root: strip, rootMargin: '0px -40% 0px -40%' });
    strip.querySelectorAll('.gal__it').forEach(function (el) { cio.observe(el); });
  }

  /* ---- 季節タブ ---- */
  var tabs = [].slice.call(document.querySelectorAll('.tab'));
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (o) {
        var on = o === t;
        o.classList.toggle('is-active', on);
        o.setAttribute('aria-selected', on ? 'true' : 'false');
        var pn = document.getElementById(o.getAttribute('aria-controls'));
        if (pn) pn.hidden = !on;
      });
    });
  });

  /* ---- 地図の切り替え ---- */
  var mbtns = [].slice.call(document.querySelectorAll('[data-map]'));
  var layers = [].slice.call(document.querySelectorAll('.mp-l'));
  mbtns.forEach(function (b, i) {
    b.addEventListener('click', function () {
      mbtns.forEach(function (o, j) {
        o.classList.toggle('is-active', j === i);
        o.setAttribute('aria-pressed', j === i ? 'true' : 'false');
      });
      layers.forEach(function (l, j) { l.classList.toggle('is-on', j === i); });
    });
  });

  /* ---- ページ内リンクはJSでなめらかに ----
     （CSSの scroll-behavior:smooth は使わない。プログラムからの scrollTo まで滑ってしまう） */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var t = document.getElementById(id);
      if (!t) return;
      ev.preventDefault();
      t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', '#' + id);
    });
  });

  /* ---- ティッカーは画面の外では止める ---- */
  var hd = document.querySelector('.hd');
  var pill = document.querySelector('.pill');
  if (hd && pill) {
    new IntersectionObserver(function (es) {
      hd.classList.toggle('is-out', !es[0].isIntersecting);
    }).observe(pill);
  }
})();
