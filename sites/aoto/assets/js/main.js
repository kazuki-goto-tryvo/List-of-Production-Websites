/* アオト塗料（AOTO）— 依存なし。GSAP/ScrollTriggerは使わず素のCSS＋IOで代替 */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = document.querySelectorAll('.rise, .rise-list');
  document.querySelectorAll('.rise-list').forEach(function (l) {
    Array.prototype.forEach.call(l.children, function (c, i) { c.style.setProperty('--d', i); });
  });
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (t) { t.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* スクロールでヘッダーのロゴが縮む（参照元 .l-header_logo の width 遷移） */
  var hd = document.getElementById('hd');
  window.addEventListener('scroll', function () {
    hd.classList.toggle('is-min', window.scrollY > 120);
  }, { passive: true });

  /* メニュー */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  function open(v) {
    burger.setAttribute('aria-expanded', String(v));
    burger.setAttribute('aria-label', v ? 'メニューを閉じる' : 'メニューを開く');
    nav.classList.toggle('is-open', v);
    document.body.style.overflow = v ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { open(burger.getAttribute('aria-expanded') !== 'true'); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) open(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) open(false);
  });
})();
