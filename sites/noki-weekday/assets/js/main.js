/* NOKI 2nd Home Weekday — 依存ゼロ
   1) スクロールで要素をふわっと出す
   2) ハンバーガー（下層ページが無いのでフッターのメニューへ送るだけ）
   3) 「動きを減らす」設定では全部止める                       */
(function () {
  'use strict';
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.03 });
    Array.prototype.forEach.call(targets, function (el) {
      var sibs = el.parentElement ? el.parentElement.children : [];
      var idx = Array.prototype.indexOf.call(sibs, el);
      el.style.transitionDelay = (idx > 0 ? Math.min(idx, 4) * 0.1 : 0) + 's';
      io.observe(el);
    });
  }

  var mb = document.querySelector('.menubtn');
  if (mb) {
    mb.addEventListener('click', function () {
      var nav = document.querySelector('.ft__nav');
      if (nav) nav.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'center' });
    });
  }
})();
