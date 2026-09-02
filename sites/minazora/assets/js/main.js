/* みなぞら美容デザイン専門学校 — MINAZORA BEAUTY DESIGN COLLEGE */
(function () {
  'use strict';

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isSP = function () { return matchMedia('(max-width: 900px)').matches; };

  /* ---------- 見出しを1文字ずつに割る ---------- */
  function splitChars(el) {
    var step = el.classList.contains('chars--slow') ? 90 : 32;
    var i = 0, out = [];
    [].forEach.call(el.childNodes, function (node) {
      if (node.nodeType === 3) {
        node.nodeValue.split('').forEach(function (ch) {
          var w = document.createElement('span');
          w.className = 'char';
          var inner = document.createElement('span');
          inner.textContent = ch === ' ' ? ' ' : ch;
          inner.style.transitionDelay = (i * step) + 'ms';
          w.appendChild(inner);
          out.push(w);
          i++;
        });
      } else {
        out.push(node.cloneNode(true));
      }
    });
    el.textContent = '';
    out.forEach(function (n) { el.appendChild(n); });
  }
  [].forEach.call(document.querySelectorAll('[data-chars]'), splitChars);

  /* ---------- スクロールで現れる ---------- */
  var targets = document.querySelectorAll('.reveal, .chars');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) { return; }
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    [].forEach.call(targets, function (el) { io.observe(el); });
  } else {
    [].forEach.call(targets, function (el) { el.classList.add('is-in'); });
  }

  /* ---------- 読み込み明けのイントロ ---------- */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { document.body.classList.add('is-ready'); });
  });

  /* ---------- ヘッダーが下スクロールで隠れる ---------- */
  var topbar = document.getElementById('topbar');
  var last = window.pageYOffset, ticking = false;
  function onScroll() {
    var y = window.pageYOffset;
    if (!document.body.classList.contains('menu-open')) {
      if (y > 60 && y > last + 4) { topbar.classList.add('is-hidden'); }
      else if (y < last - 4 || y <= 60) { topbar.classList.remove('is-hidden'); }
    }
    last = y;
    parallax();
    ticking = false;
  }
  addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  /* ---------- s7 パララックス（スクロール量の0.85倍で動かす） ---------- */
  var field = document.getElementById('field');
  function parallax() {
    if (!field || reduce || isSP()) { return; }
    var r = field.parentNode.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) { return; }
    var mid = r.top + r.height / 2 - innerHeight / 2;
    var off = Math.max(-118, Math.min(118, mid * -0.15));
    field.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
  }
  parallax();

  /* ---------- 全画面メニュー ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.querySelector('.sr').textContent = open ? 'メニューを閉じる' : 'メニューを開く';
    document.body.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { menu.classList.add('is-open'); });
      topbar.classList.remove('is-hidden');
    } else {
      menu.classList.remove('is-open');
      setTimeout(function () { if (!menu.classList.contains('is-open')) { menu.hidden = true; } }, 900);
    }
  }
  burger.addEventListener('click', function () {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') { setMenu(false); }
  });
  [].forEach.call(menu.querySelectorAll('a'), function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });

  /* メニュー内アコーディオン（SPだけ開閉。PCは開いたまま） */
  [].forEach.call(menu.querySelectorAll('.menu__head'), function (btn) {
    var wrap = btn.nextElementSibling;
    btn.addEventListener('click', function () {
      if (!isSP()) { return; }
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      wrap.classList.toggle('is-open', !open);
    });
  });

  /* ---------- s1 新着スライダー ---------- */
  var fv = document.getElementById('fv');
  if (fv) {
    var slides = fv.querySelectorAll('.fv__slide');
    var peekL = fv.querySelector('.fv__peek--l img');
    var peekR = fv.querySelector('.fv__peek--r img');
    var numBox = document.getElementById('fvnum');
    var srcs = [].map.call(slides, function (s) { return s.querySelector('.fv__ph img').getAttribute('src'); });
    var cur = 0, timer = null;

    function go(next) {
      if (next === cur) { return; }
      slides[cur].classList.remove('is-current');
      slides[next].classList.add('is-current');
      peekL.src = srcs[(next + srcs.length - 1) % srcs.length];
      peekR.src = srcs[(next + 1) % srcs.length];

      var old = numBox.querySelector('b:not(.is-out)');
      var fresh = document.createElement('b');
      fresh.textContent = String(next + 1);
      if (reduce) {
        numBox.innerHTML = '';
        numBox.appendChild(fresh);
      } else {
        if (old) {
          old.classList.add('is-out');
          setTimeout(function () { if (old.parentNode) { old.parentNode.removeChild(old); } }, 900);
        }
        fresh.className = 'is-in-anim';
        numBox.appendChild(fresh);
      }
      cur = next;
    }
    function play() {
      if (reduce) { return; }
      stop();
      timer = setInterval(function () { go((cur + 1) % slides.length); }, 6000);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    fv.addEventListener('mouseenter', stop);
    fv.addEventListener('mouseleave', play);
    play();
  }

  /* ---------- s10 HOURS & LIGHT（アコーディオン） ---------- */
  var band = document.getElementById('band');
  if (band) {
    var items = band.querySelectorAll('.scenes__item');
    var scNo = document.getElementById('scNo');
    var scDate = document.getElementById('scDate');
    var scC1 = document.getElementById('scC1');
    var scC2 = document.getElementById('scC2');
    var idx = 0, sTimer = null, live = false;

    function open(n) {
      var vis = isSP() ? 5 : items.length;
      n = ((n % vis) + vis) % vis;
      items[idx].classList.remove('is-current');
      items[n].classList.add('is-current');
      idx = n;
      scNo.textContent = ('0' + (n + 1)).slice(-2);
      scDate.textContent = items[n].dataset.date;
      scC1.textContent = items[n].dataset.c1;
      scC2.textContent = items[n].dataset.c2;
    }
    [].forEach.call(items, function (el, i) {
      el.addEventListener('mouseenter', function () { open(i); });
      el.addEventListener('focus', function () { open(i); });
      el.addEventListener('click', function () { open(i); });
    });
    function sPlay() { if (!reduce && live && !sTimer) { sTimer = setInterval(function () { open(idx + 1); }, 4500); } }
    function sStop() { if (sTimer) { clearInterval(sTimer); sTimer = null; } }
    band.addEventListener('mouseenter', sStop);
    band.addEventListener('mouseleave', sPlay);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        live = es[0].isIntersecting;
        if (live) { sPlay(); } else { sStop(); }
      }, { threshold: 0.15 }).observe(band);
    } else { live = true; sPlay(); }
  }

  /* ---------- 行き先を持たないリンクでページを飛ばさない ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href="#"]') : null;
    if (a) { e.preventDefault(); }
  });
})();
