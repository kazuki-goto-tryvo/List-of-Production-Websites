/* 榑木工芸 塗装部 — 依存なし。参照元のGSAP+ScrollTriggerはscrubを使っていないのでCSSで代替 */
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

  /* メニュー */
  var btn = document.getElementById('menubtn');
  var nav = document.getElementById('nav');
  function open(v) {
    btn.setAttribute('aria-expanded', String(v));
    btn.setAttribute('aria-label', v ? 'メニューを閉じる' : 'メニューを開く');
    nav.classList.toggle('is-open', v);
    document.body.style.overflow = v ? 'hidden' : '';
  }
  btn.addEventListener('click', function () { open(btn.getAttribute('aria-expanded') !== 'true'); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) open(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) open(false);
  });

  /* ギャラリー：5秒で自動送り（参照元 activeGalleryPage） */
  var CAPS = ['集合住宅のエントランス造作', '飲食店のカウンター天板', '個人邸の書斎の壁面収納',
              'ギャラリーの可動什器', 'オフィスのエントランスサイン'];
  var cap = document.getElementById('galcap');
  var now = document.getElementById('galnow');
  var bar = document.getElementById('galbar');
  var th = document.getElementById('galth');
  var i = 0, timer = null;
  function draw() {
    cap.textContent = CAPS[i];
    now.textContent = ('0' + (i + 1)).slice(-2);
    bar.style.width = ((i + 1) / CAPS.length * 100) + '%';
    Array.prototype.forEach.call(th.children, function (li, k) {
      li.classList.toggle('is-on', k === i % th.children.length);
    });
  }
  function go(d) { i = (i + d + CAPS.length) % CAPS.length; draw(); restart(); }
  function restart() {
    if (reduce) return;
    clearInterval(timer);
    timer = setInterval(function () { i = (i + 1) % CAPS.length; draw(); }, 5000);
  }
  document.getElementById('galprev').addEventListener('click', function () { go(-1); });
  document.getElementById('galnext').addEventListener('click', function () { go(1); });
  draw(); restart();
})();
