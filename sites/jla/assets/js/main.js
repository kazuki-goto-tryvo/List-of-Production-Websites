/* 日本字形協会（架空）— 依存なし。すべて prefers-reduced-motion で止まる */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 見出しの拭き取り／セクションの浮上 ---- */
  var targets = document.querySelectorAll('.reveal, .reveal-list, .clip');
  document.querySelectorAll('.reveal-list').forEach(function (l) {
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
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* ---- 方向感知ホバー：マウスが入ってきた辺からサムネが伸びる ---- */
  if (!reduce) {
    document.querySelectorAll('.nm').forEach(function (el) {
      var th = el.querySelector('.nm__th');
      if (th && th.dataset.src) th.style.backgroundImage = 'url("' + th.dataset.src + '")';
      // 入射／退出の辺を、要素の中心からの相対位置と縦横比で判定する
      function side(e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) / (r.width || 1);
        var y = (e.clientY - (r.top + r.height / 2)) / (r.height || 1);
        if (Math.abs(x) > Math.abs(y)) return x > 0 ? 'right' : 'left';
        return y > 0 ? 'bottom' : 'top';
      }
      el.addEventListener('mouseenter', function (e) {
        el.dataset.dir = side(e);
        // 起点を置いた次のフレームで開く（同フレームだと transition が走らない）
        requestAnimationFrame(function () { el.classList.add('is-hover'); });
      });
      el.addEventListener('mouseleave', function (e) {
        el.dataset.dir = side(e);
        el.classList.remove('is-hover');
      });
    });
  }

  /* ---- ヘッダー：下スクロールで消え、上で戻る ---- */
  var hd = document.getElementById('hd'), last = 0;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    hd.classList.toggle('is-hidden', y > 300 && y > last);
    last = y;
  }, { passive: true });

  /* ---- SPのメニュー ---- */
  var btn = document.getElementById('menubtn');
  var menu = document.getElementById('menu');
  var close = document.getElementById('menuclose');
  menu.querySelectorAll('li').forEach(function (li, i) { li.style.setProperty('--i', i); });
  function open(v) {
    btn.setAttribute('aria-expanded', String(v));
    menu.hidden = false;
    requestAnimationFrame(function () { menu.classList.toggle('is-open', v); });
    if (!v) setTimeout(function () { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 520);
    document.body.style.overflow = v ? 'hidden' : '';
  }
  btn.addEventListener('click', function () { open(btn.getAttribute('aria-expanded') !== 'true'); });
  close.addEventListener('click', function () { open(false); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) open(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) open(false); });
})();
