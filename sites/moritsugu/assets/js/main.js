/* モリツグ — 依存ライブラリなし */
(function () {
  'use strict';

  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduce = mq.matches;

  /* ── スクロールで出す ───────────────────── */
  var targets = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ── タイプライター ─────────────────────
     CSS の width アニメーションは % だと親幅基準になってしまうので、
     実測した文字幅を --tw に入れてから .is-typing を付ける。         */
  (function typewriter() {
    var els = document.querySelectorAll('[data-type]');
    if (!els.length || reduce) return;
    // フォント読み込み後でないと幅がずれる
    var start = function () {
      els.forEach(function (el) {
        el.style.setProperty('--tw', el.getBoundingClientRect().width + 'px');
      });
      document.body.classList.add('is-typing');
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
    else window.addEventListener('load', start);
  })();

  /* ── ヒーローの視差（層ごとに速度を変える） ──────────
     scroll ごとに計算せず、rAF で1フレーム1回に間引く。            */
  (function parallax() {
    var layers = document.querySelectorAll('.scene__l[data-par]');
    var hero = document.querySelector('.hero');
    if (!layers.length || !hero || reduce) return;
    if (window.matchMedia('(max-width:900px)').matches) return;

    var ticking = false;
    function apply() {
      ticking = false;
      var y = window.pageYOffset;
      if (y > hero.offsetHeight) return;                 // ヒーローを抜けたら触らない
      layers.forEach(function (el) {
        el.style.transform = 'translate3d(0,' + (y * parseFloat(el.dataset.par)).toFixed(1) + 'px,0)';
      });
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    }, { passive: true });
    apply();
  })();

  /* ── ページトップ ───────────────────────── */
  (function pagetop() {
    var btn = document.getElementById('pagetop');
    if (!btn) return;
    var ticking = false;
    function check() {
      ticking = false;
      btn.classList.toggle('is-show', window.pageYOffset > window.innerHeight);
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(check);
    }, { passive: true });
    check();
  })();

  /* ── ハンバーガー（SP） ─────────────────── */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      burger.setAttribute('aria-label', open ? 'メニューを開く' : 'メニューを閉じる');
      nav.classList.toggle('is-open', !open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName !== 'A') return;
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'メニューを開く');
      nav.classList.remove('is-open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !nav.classList.contains('is-open')) return;
      burger.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      burger.focus();
    });
  }
})();
