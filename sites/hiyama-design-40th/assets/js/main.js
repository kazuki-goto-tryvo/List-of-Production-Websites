/* 灯山デザイン室 40th（架空）— 動きは全部CSSキーフレーム。JSは発火と進捗だけ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- スクロールで出す ---------- */
  var targets = document.querySelectorAll('.reveal, .burst');
  if (reduce || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  }

  /* ---------- ヘッダー：下で隠れ、上で戻る／ヒーローを抜けたら地を敷く ---------- */
  var hd = document.getElementById('hd');
  var burger = document.getElementById('burger');
  var last = window.scrollY;

  function onScroll() {
    var y = window.scrollY;
    var open = hd.classList.contains('is-open');
    hd.classList.toggle('is-solid', y > 40);
    if (!open) hd.classList.toggle('is-hidden', y > 200 && y > last);
    last = y;
    logoProgress();
  }

  burger.addEventListener('click', function () {
    var open = hd.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    if (open) hd.classList.remove('is-hidden');
  });
  hd.querySelectorAll('.hd__nav a').forEach(function (a) {
    a.addEventListener('click', function () {
      hd.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- s9：スクロール率 0→1 を --p に流してロゴを組み上げる ---------- */
  var logo = document.querySelector('.logo');
  var logoP = 0;
  function logoProgress() {
    if (!logo) return;
    if (reduce) { logo.style.setProperty('--p', 1); return; }
    var r = logo.getBoundingClientRect();
    var vh = window.innerHeight;
    // 下から入ってきて、中央に来るまでで 0→1。組み上がったら戻さない（＝単調増加）
    var p = (vh - r.top) / (vh * 0.5 + r.height * 0.5);
    p = Math.max(0, Math.min(1, p));
    if (p <= logoP) return;
    logoP = p;
    logo.style.setProperty('--p', p.toFixed(3));
  }

  /* ---------- s8：フロアマップのドット ---------- */
  document.querySelectorAll('.spot').forEach(function (b) {
    b.addEventListener('click', function () {
      var on = b.getAttribute('aria-pressed') === 'true';
      document.querySelectorAll('.spot').forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', on ? 'false' : 'true');
    });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', logoProgress);
  onScroll();
})();
