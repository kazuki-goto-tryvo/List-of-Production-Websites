/* 陶 SUE（架空）— 依存ゼロ
   1) スクロールで要素をふわっと出す
   2) 商品のフィルタ（見た目だけ。下層ページが無いので絞り込みはしない）
   3) ハンバーガー（フッターのメニューへ送る）
   4) 「動きを減らす」設定では全部止める                       */
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
    Array.prototype.forEach.call(targets, function (el) {
      var sibs = el.parentElement ? el.parentElement.children : [];
      var idx = Array.prototype.indexOf.call(sibs, el);
      el.style.transitionDelay = (idx > 0 ? Math.min(idx, 4) * 0.08 : 0) + 's';
      io.observe(el);
    });
  }

  // フィルタは選択状態を切り替えるだけ（商品ページが無いので絞り込みはしない）
  var chips = document.querySelectorAll('.chips button');
  Array.prototype.forEach.call(chips, function (b) {
    b.addEventListener('click', function () {
      Array.prototype.forEach.call(chips, function (o) { o.classList.remove('is-on'); });
      b.classList.add('is-on');
    });
  });

  var mb = document.querySelector('.menubtn');
  if (mb) {
    mb.addEventListener('click', function () {
      var nav = document.querySelector('.ft__nav');
      if (nav) nav.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' });
    });
  }
})();
