/* こどもウェルネスジム KURURI — 依存ゼロ
   1) スクロールで要素をふわっと出す
   2) 横並びリストをポインタでドラッグしてスクロール
   3) 「動きを減らす」設定では全部止める                       */
(function () {
  'use strict';

  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1) スクロール表示 ---------- */
  var targets = document.querySelectorAll('.reveal');
  if (still || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

    Array.prototype.forEach.call(targets, function (el, i) {
      // 同じ列に並ぶカードは少しずつ遅らせる
      var sibs = el.parentElement ? el.parentElement.children : [];
      var idx = Array.prototype.indexOf.call(sibs, el);
      el.style.transitionDelay = (idx > 0 ? Math.min(idx, 5) * 0.08 : 0) + 's';
      io.observe(el);
    });
  }

  /* ---------- 2) 横スクロールの帯にドットを付ける ----------
     SPフレームどおり。実際に溢れている帯にだけ出す（PCでは何も足さない）。 */
  var RAILS = '.pickup__list, .news__cards, .blog__list, .story__list';

  function buildDots(list) {
    if (list.__dots) return list.__dots;
    var d = document.createElement('div');
    d.className = 'dots';
    d.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < list.children.length; i++) d.appendChild(document.createElement('i'));
    (list.parentElement || list).insertBefore(d, list.nextSibling);
    list.__dots = d;
    return d;
  }

  function syncDots(list) {
    var d = list.__dots;
    if (!d) return;
    var over = list.scrollWidth - list.clientWidth;
    if (over < 8) { d.style.display = 'none'; return; }
    d.style.display = '';
    // いま真ん中に見えているカードを拾う
    var mid = list.scrollLeft + list.clientWidth / 2, best = 0, bd = Infinity;
    for (var i = 0; i < list.children.length; i++) {
      var c = list.children[i], cc = c.offsetLeft + c.offsetWidth / 2;
      var dist = Math.abs(cc - mid);
      if (dist < bd) { bd = dist; best = i; }
    }
    for (var j = 0; j < d.children.length; j++) d.children[j].classList.toggle('is-on', j === best);
  }

  Array.prototype.forEach.call(document.querySelectorAll(RAILS), function (list) {
    buildDots(list);
    syncDots(list);
    list.addEventListener('scroll', function () { syncDots(list); }, { passive: true });
  });
  window.addEventListener('resize', function () {
    Array.prototype.forEach.call(document.querySelectorAll(RAILS), syncDots);
  }, { passive: true });

  /* ---------- 3) 横スクロールのドラッグ ---------- */
  Array.prototype.forEach.call(document.querySelectorAll(RAILS), function (list) {
    var down = false, sx = 0, sl = 0, moved = 0;

    list.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;   // タッチは既定の挙動に任せる
      down = true; moved = 0;
      sx = e.clientX; sl = list.scrollLeft;
      list.style.cursor = 'grabbing';
    });
    list.addEventListener('pointermove', function (e) {
      if (!down) return;
      var d = e.clientX - sx;
      moved = Math.max(moved, Math.abs(d));
      list.scrollLeft = sl - d;
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (t) {
      list.addEventListener(t, function () { down = false; list.style.cursor = ''; });
    });
    // ドラッグした直後のクリックはリンクを開かない
    list.addEventListener('click', function (e) {
      if (moved > 6) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  });

  /* ---------- 4) メニューボタン（下層ページが無いので位置を示すだけ） ---------- */
  var mb = document.querySelector('.menubtn');
  if (mb) {
    mb.addEventListener('click', function () {
      // SPではグローバルナビを出していないので、代わりにフッターのリンク集へ送る
      var nav = document.querySelector('.gnav');
      if (!nav || !nav.offsetParent) nav = document.querySelector('.foot__links');
      if (nav) nav.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'center' });
    });
  }
})();
