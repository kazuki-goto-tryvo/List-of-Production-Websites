/* ソクリ！（架空）— 依存なし。すべて prefers-reduced-motion で止まる */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 月桂冠（毎月4社限定バッジ）をSVGで描く ---- */
  var wg = document.querySelector('.wreath__g');
  if (wg) {
    var cx = 66, cy = 66, r = 60, col = '#B99A56', s = '';
    [-1, 1].forEach(function (side) {
      var pts = [];
      for (var i = 0; i <= 12; i++) {
        var phi = (Math.PI / 180) * (14 + i * 12);
        pts.push([cx + side * Math.sin(phi) * r, cy + Math.cos(phi) * r]);
      }
      s += '<path d="M ' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L ')
        + '" fill="none" stroke="' + col + '" stroke-width="2.6" stroke-linecap="round"/>';
      pts.forEach(function (p, i) {
        if (!i) return;
        var deg = 14 + i * 12, rot = side > 0 ? -deg + 62 : deg - 62;
        s += '<ellipse cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" rx="7.8" ry="3.3" fill="' + col
          + '" transform="rotate(' + rot.toFixed(1) + ' ' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ')"/>';
      });
    });
    wg.innerHTML = s;
  }

  /* ---- ハンバーガー ---- */
  var burger = document.getElementById('burger');
  var gnav = document.getElementById('gnav');
  if (burger && gnav) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      burger.setAttribute('aria-label', open ? 'メニューを開く' : 'メニューを閉じる');
      gnav.classList.toggle('is-open', !open);
    });
    gnav.addEventListener('click', function (e) {
      if (!e.target.closest('a')) return;
      burger.setAttribute('aria-expanded', 'false');
      gnav.classList.remove('is-open');
    });
  }

  /* ---- ヘッダー：下スクロールで隠し、上スクロールで戻す ---- */
  var hd = document.getElementById('hd'), last = 0;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    hd.classList.toggle('is-stuck', y > 8);
    if (!gnav || !gnav.classList.contains('is-open')) {
      hd.classList.toggle('is-hidden', y > 240 && y > last);
    }
    last = y;
  }, { passive: true });

  /* ---- スクロールで浮き上がる（参照元の motion-floatIn 相当） ---- */
  var targets = document.querySelectorAll('.reveal, .reveal-list');
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
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* ---- FAQ アコーディオン ---- */
  document.querySelectorAll('.qa button').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', String(!open));
      b.parentElement.classList.toggle('is-open', !open);
    });
  });

  /* ---- フォーム（デモ用。送信先は未接続） ---- */
  var form = document.querySelector('.form');
  var note = document.getElementById('formnote');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ng = ['f1', 'f2', 'f3'].filter(function (id) { return !document.getElementById(id).value.trim(); });
      note.textContent = ng.length
        ? '必須項目が未入力です。'
        : 'これはデモサイトのため、送信先は接続されていません。';
    });
  }
})();
