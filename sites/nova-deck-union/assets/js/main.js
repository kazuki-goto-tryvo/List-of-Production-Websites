/* NOVA DECK UNION（架空）— 依存ライブラリなし */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── スクロールで出す ─────────────────────
     ★ 横スクロールの帯（.car）の中にある要素は、画面の右外にいるあいだ
       IntersectionObserver が発火しない。帯そのものを監視して、
       中の .reveal はまとめて出す。                                    */
  var all = [].slice.call(document.querySelectorAll('.reveal'));
  var inCar = function (el) { return !!el.closest('.car'); };
  var targets = all.filter(function (el) { return !inCar(el); });
  var cars = [].slice.call(document.querySelectorAll('.car'));

  if (reduce || !('IntersectionObserver' in window)) {
    all.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.04 });
    targets.forEach(function (el) { io.observe(el); });

    var ioCar = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll('.reveal').forEach(function (el, i) {
          setTimeout(function () { el.classList.add('is-in'); }, i * 70);
        });
        ioCar.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.04 });
    cars.forEach(function (el) { ioCar.observe(el); });
  }

  /* ── ステータスバー（data-bar / data-rank を小片に展開） ── */
  document.querySelectorAll('[data-bar],[data-rank]').forEach(function (dd) {
    var rank = dd.hasAttribute('data-rank');
    var on = +(rank ? dd.dataset.rank : dd.dataset.bar);
    var total = rank ? 5 : 6;
    var html = '';
    for (var i = 0; i < total; i++) html += '<i class="' + (i < on ? 'is-on' : '') + '"></i>';
    dd.innerHTML = html;
  });

  /* ── SCHEDULE の工程アイコン ───────────────── */
  var ICONS = {
    clip: '<path d="M11 9h26v30H11Z"/><path d="M19 5h10v7H19Z"/><path d="M17 21l3 3 6-7M17 30l3 3 6-7"/>',
    people: '<circle cx="14" cy="16" r="5" fill="#C9CCD1" stroke="none"/><circle cx="24" cy="12" r="6" fill="#C9CCD1" stroke="none"/>'
      + '<circle cx="34" cy="16" r="5" fill="#C9CCD1" stroke="none"/><path d="M6 36a18 12 0 0 1 36 0Z" fill="#C9CCD1" stroke="none"/>',
    cup: '<path d="M14 8h20v12a10 10 0 0 1-20 0Z"/><path d="M14 11H7a8 8 0 0 0 8 10M34 11h7a8 8 0 0 1-8 10"/><path d="M24 30v7M15 40h18"/>',
    cast: '<path d="M9 12h30v20H9Z"/><path d="M21 18l9 4-9 4Z"/><path d="M18 40h12M24 32v8"/>',
    doc: '<path d="M12 7h17l7 7v27H12Z"/><path d="M18 22h13M18 29h13M18 36h8"/>',
  };
  document.querySelectorAll('.steps__hx[data-ic]').forEach(function (el) {
    var k = el.dataset.ic;
    if (!ICONS[k]) return;
    el.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true">' + ICONS[k] + '</svg>';
  });

  /* ── トーナメント表（SVGで描く。8→4→2→1） ────────── */
  (function bracket() {
    var box = document.getElementById('brk');
    if (!box) return;
    var gap = 42, bw = 58, bh = 28, W = 240, H = 8 * gap;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" aria-hidden="true">';
    for (var i = 0; i < 8; i++) {
      var y = i * gap;
      s += '<path d="M7 ' + y + ' H' + bw + ' V' + (y + bh - 7) + ' L' + (bw - 7) + ' ' + (y + bh)
        + ' H0 V7 Z" fill="#0C0D10" stroke="#E02010" stroke-width="1"/>';
      if (i % 2 === 0) s += '<path d="M' + bw + ' ' + (y + bh / 2) + ' h20 v' + gap + ' h-20 M' + (bw + 20)
        + ' ' + (y + bh / 2 + gap / 2) + ' h18" fill="none" stroke="#E02010" stroke-width="1.2"/>';
    }
    for (var j = 0; j < 4; j += 2) {
      var y2 = j * gap * 2 + gap / 2 + bh / 2;
      s += '<path d="M96 ' + y2 + ' h18 v' + (gap * 2) + ' h-18 M114 ' + (y2 + gap)
        + ' h18" fill="none" stroke="#E02010" stroke-width="1.2" opacity=".85"/>';
    }
    s += '<path d="M132 ' + (gap + bh / 2) + ' v' + (gap * 4) + ' M132 ' + (gap * 3 + bh / 2)
      + ' h20" fill="none" stroke="#E02010" stroke-width="1.2" opacity=".7"/>'
      + '<path d="M170 ' + (gap * 3 + bh / 2 - 18) + ' l16 9 v18 l-16 9 l-16 -9 v-18 Z" '
      + 'fill="rgba(195,35,5,.16)" stroke="#F24616" stroke-width="1.4"/></svg>';
    box.innerHTML = s;
  })();

  /* ── カルーセルのドット（枚数から作って、スクロールに同期） ──── */
  document.querySelectorAll('[data-dots]').forEach(function (box) {
    var car = document.getElementById(box.dataset.dots);
    if (!car) return;
    var items = car.querySelectorAll('li');
    var html = '';
    for (var i = 0; i < items.length; i++) html += '<i></i>';
    box.innerHTML = html;
    var dots = box.querySelectorAll('i');
    function sync() {
      var first = car.querySelector('li');
      if (!first) return;
      var step = first.getBoundingClientRect().width + 16;
      var idx = Math.min(dots.length - 1, Math.round(car.scrollLeft / step));
      dots.forEach(function (d, i) { d.classList.toggle('is-on', i === idx); });
    }
    var t = false;
    car.addEventListener('scroll', function () {
      if (t) return; t = true;
      requestAnimationFrame(function () { t = false; sync(); });
    }, { passive: true });
    sync();
  });

  /* ── カルーセル（矢印で1枚ぶんスクロール） ─────────── */
  document.querySelectorAll('.car-a').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var car = document.getElementById(btn.dataset.car);
      if (!car) return;
      var first = car.querySelector('li');
      if (!first) return;
      var step = first.getBoundingClientRect().width + 16;
      car.scrollBy({ left: step * +btn.dataset.dir, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ── タブ（見た目の切り替えだけ。中身は1種類しか無い） ── */
  function tabGroup(sel, onClass) {
    var list = document.querySelectorAll(sel);
    list.forEach(function (b) {
      b.addEventListener('click', function () {
        list.forEach(function (o) {
          o.classList.remove(onClass);
          if (o.hasAttribute('aria-selected')) o.setAttribute('aria-selected', 'false');
        });
        b.classList.add(onClass);
        if (b.hasAttribute('aria-selected')) b.setAttribute('aria-selected', 'true');
      });
    });
  }
  tabGroup('.tab', 'is-on');
  tabGroup('.vtab', 'is-on');

  /* ── FAQ の開閉 ───────────────────────── */
  document.querySelectorAll('.qa__q').forEach(function (q) {
    var a = q.nextElementSibling;
    if (q.getAttribute('aria-expanded') === 'true') a.classList.add('is-open');
    q.addEventListener('click', function () {
      var open = q.getAttribute('aria-expanded') === 'true';
      q.setAttribute('aria-expanded', String(!open));
      a.classList.toggle('is-open', !open);
    });
  });

  /* ── ヘッダーの背景（少しスクロールしたら濃くする） ──── */
  (function stick() {
    var hd = document.getElementById('hd');
    if (!hd) return;
    var t = false;
    function check() { t = false; hd.classList.toggle('is-stuck', window.pageYOffset > 40); }
    window.addEventListener('scroll', function () {
      if (t) return; t = true; requestAnimationFrame(check);
    }, { passive: true });
    check();
  })();

  /* ── ハンバーガー（SP） ─────────────────── */
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
      if (e.target.tagName !== 'A') return;
      burger.setAttribute('aria-expanded', 'false');
      gnav.classList.remove('is-open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !gnav.classList.contains('is-open')) return;
      burger.setAttribute('aria-expanded', 'false');
      gnav.classList.remove('is-open');
      burger.focus();
    });
  }
})();
