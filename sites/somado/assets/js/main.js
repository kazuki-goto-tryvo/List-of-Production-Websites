/* 杣戸の外あそび — 依存なし。すべて prefers-reduced-motion で止まる */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var targets = document.querySelectorAll('.reveal, .reveal-list, .pop');
  document.querySelectorAll('.reveal-list').forEach(function (l) {
    Array.prototype.forEach.call(l.children, function (c, i) { c.style.setProperty('--d', i); });
  });
  // コラージュは順にポップさせる（バラバラに出ると散らかって見える）
  document.querySelectorAll('.hero__collage .pop').forEach(function (el, i) {
    el.style.transitionDelay = (i * 90) + 'ms';
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

  /* SPのメニュー（右の縦ナビ → 全画面オーバーレイ） */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('spnav');
  nav.querySelectorAll('li').forEach(function (li, i) { li.style.setProperty('--i', i); });
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
