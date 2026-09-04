/* あおばクリニック— 依存ゼロ
   1) スクロールで要素をふわっと出す
   2) ハンバーガーでドロワーメニューを開閉する
   3) 「動きを減らす」設定では全部止める                       */
(function () {
  'use strict';
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. スクロール表示 ---------- */
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

  /* ---------- 2. ドロワーメニュー ---------- */
  var btn = document.querySelector('.menubtn');
  var drawer = document.getElementById('drawer');
  if (!btn || !drawer) return;

  var closeBtn = drawer.querySelector('.drawer__close');

  function open() {
    drawer.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'メニューをとじる');
    document.body.classList.add('is-locked');
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    drawer.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'メニューを開く');
    document.body.classList.remove('is-locked');
    btn.focus();
  }

  btn.addEventListener('click', function () {
    if (drawer.hidden) { open(); } else { close(); }
  });

  if (closeBtn) closeBtn.addEventListener('click', close);

  // 背景（パネルの外側）を押したらとじる
  drawer.addEventListener('click', function (e) {
    if (e.target === drawer) close();
  });

  // Esc でとじる
  document.addEventListener('keydown', function (e) {
    if (!drawer.hidden && (e.key === 'Escape' || e.key === 'Esc')) close();
  });

  // 同じページ内へのリンクを押したときもとじる
  Array.prototype.forEach.call(drawer.querySelectorAll('a'), function (a) {
    a.addEventListener('click', function () { if (!drawer.hidden) close(); });
  });
})();
