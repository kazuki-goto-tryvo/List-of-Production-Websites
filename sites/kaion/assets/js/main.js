/* KAION — 動き一式。ライブラリなし、素の CSS と IntersectionObserver だけで組む。 */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* ---------- 読み込み直後の入り ---------- */
  requestAnimationFrame(function () { document.body.classList.add('is-ready'); });

  /* ---------- スクロールで現れる（リストは 80ms ずつ遅らせる） ---------- */
  (function () {
    var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!items.length) return;

    // 同じ親の中の並び順で遅延を決める
    var seen = new Map();
    items.forEach(function (el) {
      var p = el.parentNode;
      var n = seen.get(p) || 0;
      seen.set(p, n + 1);
      if (n) el.style.transitionDelay = (n * 80) + 'ms';
    });

    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
    items.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- 画面の外では流し続けない（差分撮影が壊れるので） ---------- */
  (function () {
    var loops = document.querySelectorAll('.band, .look');
    if (!loops.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('is-off', !e.isIntersecting); });
    }, { rootMargin: '120px 0px' });
    Array.prototype.forEach.call(loops, function (el) {
      el.classList.add('is-off');
      io.observe(el);
    });
  })();

  /* ---------- コンセプト：sticky ステージの上で写真A→Bをクロスフェード ---------- */
  var cpt1 = document.querySelector('.cpt--1');

  function crossfade() {
    if (!cpt1 || reduce) return;
    var r = cpt1.getBoundingClientRect();
    var p = r.height ? (-r.top) / r.height : 0;          // 0 → 1
    var t = (p - 0.55) / 0.45;                            // 後半だけ使う
    root.style.setProperty('--p2', String(Math.min(1, Math.max(0, t))));
  }

  /* ---------- 白いセクションに入るとヘッダーを黒に（出たら戻す） ---------- */
  var hd = document.getElementById('hd');
  var feat = document.getElementById('feature');

  function headerTone() {
    if (!hd || !feat) return;
    var r = feat.getBoundingClientRect();
    hd.classList.toggle('is-dark', r.top <= 42 && r.bottom >= 42);
  }

  /* ---------- 現在地のナビに下線 ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.gnav__list a[data-spy]'));
  var spots = links.map(function (a) {
    return { a: a, el: document.getElementById(a.getAttribute('data-spy')) };
  }).filter(function (s) { return s.el; });

  function spy() {
    if (!spots.length) return;
    var line = window.innerHeight * 0.34;
    var cur = spots[0];
    spots.forEach(function (s) {
      var r = s.el.getBoundingClientRect();
      if (r.top <= line) cur = s;
    });
    spots.forEach(function (s) { s.a.classList.toggle('is-active', s === cur); });
  }

  /* ---------- スクロール ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      crossfade(); headerTone(); spy();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', onScroll);
  onScroll();

  /* ---------- ハンバーガー ---------- */
  (function () {
    var btn = document.getElementById('burger');
    var menu = document.getElementById('spmenu');
    if (!btn || !menu) return;

    function setOpen(open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.classList.toggle('is-open', open);
      menu.classList.toggle('is-open', open);
      if (open) { menu.removeAttribute('inert'); } else { menu.setAttribute('inert', ''); }
      document.body.style.overflow = open ? 'hidden' : '';
    }
    btn.addEventListener('click', function () {
      setOpen(btn.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setOpen(false); btn.focus(); }
    });
  })();

  /* ---------- SHOP のアコーディオン（＋ が − になる） ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.acc__btn'), function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      if (panel) panel.classList.toggle('is-open', !open);
    });
  });

})();
