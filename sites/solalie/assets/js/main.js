/* 株式会社ソラリエ— 依存ゼロ
   1) スクロールで要素をふわっと出す
   2) ハンバーガー（SPではグローバルナビを畳んでいる）
   3) 「動きを減らす」設定では全部止める                       */
(function () {
  'use strict';

  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1) スクロール表示 ---------- */
  var targets = document.querySelectorAll('.reveal');
  if (still || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.04 });

    Array.prototype.forEach.call(targets, function (el) {
      var sibs = el.parentElement ? el.parentElement.children : [];
      var idx = Array.prototype.indexOf.call(sibs, el);
      el.style.transitionDelay = (idx > 0 ? Math.min(idx, 4) * 0.09 : 0) + 's';
      io.observe(el);
    });
  }

  /* ---------- 2) ハンバーガー ---------- */
  var mb = document.querySelector('.menubtn');
  var nav = document.getElementById('gnav');
  if (mb && nav) {
    mb.addEventListener('click', function () {
      // SPではナビを畳んでいるので、押されたらフッターのメニューへ送る
      var open = mb.getAttribute('aria-expanded') === 'true';
      if (!nav.offsetParent) {
        var f = document.querySelector('.fnav');
        if (f) f.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' });
        return;
      }
      mb.setAttribute('aria-expanded', String(!open));
      nav.style.display = open ? '' : 'block';
    });
  }

  /* ---------- 3) 事業スライドの矢印（1枚しか無いので位置表示だけ動かす） ---------- */
  var arrows = document.querySelectorAll('.arrows button');
  var counter = document.querySelector('.bizcard .counter span');
  if (arrows.length === 2 && counter) {
    var cur = 1, max = 4;
    arrows[0].addEventListener('click', function () { cur = cur > 1 ? cur - 1 : max; counter.textContent = cur; });
    arrows[1].addEventListener('click', function () { cur = cur < max ? cur + 1 : 1; counter.textContent = cur; });
  }
})();
