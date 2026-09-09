/* 株式会社百歩堂 — 動き。外部ライブラリなし */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 見出しを1文字ずつに割る（左から順に入る） ───────────── */
  Array.prototype.forEach.call(document.querySelectorAll('[data-split]'), function (el) {
    var txt = el.textContent;
    var out = '';
    for (var i = 0; i < txt.length; i++) {
      var c = txt.charAt(i);
      out += '<i class="ch" style="--i:' + i + '">' + (c === ' ' ? '&nbsp;' : c) + '</i>';
    }
    el.innerHTML = out;
  });

  /* ── 読み込み直後の入り ──────────────────────────── */
  requestAnimationFrame(function () { document.body.classList.add('is-ready'); });

  /* ── スクロールで現れる（一度出たら出っぱなし） ───────────── */
  var revs = document.querySelectorAll('.reveal, .ft');
  if (reduce || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revs, function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(revs, function (el) { io.observe(el); });
  }

  /* ── 流れ続ける帯は、画面の中にいるときだけ動かす ─────────── */
  if ('IntersectionObserver' in window) {
    var loopIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('is-run', e.isIntersecting); });
    }, { threshold: 0 });
    Array.prototype.forEach.call(document.querySelectorAll('.mq, .strip'), function (el) {
      loopIO.observe(el);
    });
  }

  /* ── 横スクロールの帯：PREV / NEXT ─────────────────── */
  Array.prototype.forEach.call(document.querySelectorAll('[data-car]'), function (b) {
    b.addEventListener('click', function () {
      var car = document.getElementById(b.dataset.car);
      if (!car) return;
      var first = car.querySelector('li');
      var step = first ? first.getBoundingClientRect().width + 22 : 300;
      car.scrollBy({ left: step * Number(b.dataset.dir), behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ── 帯の中の写真は、帯が見えた時点でまとめて読む ────────── */
  Array.prototype.forEach.call(document.querySelectorAll('.car'), function (car) {
    function load() {
      Array.prototype.forEach.call(car.querySelectorAll('img[loading="lazy"]'), function (im) {
        im.loading = 'eager';
      });
    }
    if (!('IntersectionObserver' in window)) return load();
    var cio = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      load(); cio.disconnect();
    }, { rootMargin: '200px 0px' });
    cio.observe(car);
  });

  /* ── お知らせの絞り込み ─────────────────────────── */
  var chips = document.querySelectorAll('.fchip');
  var rows = document.querySelectorAll('.news__list li');
  Array.prototype.forEach.call(chips, function (c) {
    c.setAttribute('aria-pressed', c.classList.contains('is-on') ? 'true' : 'false');
    c.addEventListener('click', function () {
      Array.prototype.forEach.call(chips, function (o) {
        var on = o === c;
        o.classList.toggle('is-on', on);
        o.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      var cat = c.dataset.cat;
      Array.prototype.forEach.call(rows, function (r) {
        r.hidden = !(cat === 'all' || r.dataset.cat === cat);
      });
    });
  });

  /* ── SPのハンバーガー ──────────────────────────── */
  var ham = document.getElementById('ham');
  var drawer = document.getElementById('drawer');
  if (ham && drawer) {
    ham.addEventListener('click', function () {
      var open = ham.getAttribute('aria-expanded') === 'true';
      ham.setAttribute('aria-expanded', open ? 'false' : 'true');
      ham.querySelector('.sr').textContent = open ? 'メニューを開く' : 'メニューを閉じる';
      drawer.classList.toggle('is-open', !open);
    });
    Array.prototype.forEach.call(drawer.querySelectorAll('a'), function (a) {
      a.addEventListener('click', function () {
        ham.setAttribute('aria-expanded', 'false');
        drawer.classList.remove('is-open');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || ham.getAttribute('aria-expanded') !== 'true') return;
      ham.setAttribute('aria-expanded', 'false');
      drawer.classList.remove('is-open');
      ham.focus();
    });
  }
})();
