/* 社会福祉法人 陽凪会 */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var body = document.body;

  /* ---------- 読み込み直後のイントロ ---------- */
  function ready() { body.classList.add('is-ready'); }
  if (document.readyState === 'complete') ready();
  else addEventListener('load', ready);

  /* ---------- スクロールで現れる ---------- */
  var targets = document.querySelectorAll('.reveal, .kv__blob');
  if (reduce || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.2 });
    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  }

  /* ---------- スクロール量を配る（--sy / --sy2 / pile の --p） ---------- */
  var msg = document.querySelector('.msg');
  var items = Array.prototype.slice.call(document.querySelectorAll('.pl'));
  var inds = Array.prototype.slice.call(document.querySelectorAll('.ind'));
  var hd = document.querySelector('.hd');
  var lastY = 0, ticking = false;

  function clamp(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }

  function update() {
    ticking = false;
    var y = scrollY;
    var vh = innerHeight;
    var docH = Math.max(document.body.scrollHeight, root.scrollHeight);

    root.style.setProperty('--sy', clamp(y / Math.max(1, docH - vh)).toFixed(4));

    if (msg) {
      var m = msg.getBoundingClientRect();
      root.style.setProperty('--sy2', clamp((vh - m.top) / (vh + m.height)).toFixed(4));
    }

    /* 積み上げカード：次の面があと何割乗ったか */
    var cur = 0;
    for (var i = 0; i < items.length; i++) {
      var p = 0;
      var r = items[i].getBoundingClientRect();
      if (i < items.length - 1) {
        var n = items[i + 1].getBoundingClientRect();
        p = clamp((r.top + r.height - n.top) / r.height);
      }
      items[i].style.setProperty('--p', p.toFixed(3));
      if (r.top <= 260 && p < 0.5) cur = i;
      else if (p >= 0.5) cur = Math.min(items.length - 1, i + 1);
    }
    for (var j = 0; j < inds.length; j++) inds[j].classList.toggle('is-cur', j === cur);

    /* フッター手前でヘッダーを隠す */
    if (hd) {
      var hide = y > lastY && y > docH - 2000 && y > 200;
      hd.classList.toggle('is-hidden', hide);
    }
    lastY = y;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  update();

  /* ---------- ギャラリーのクロスフェード ---------- */
  (function () {
    var frame = document.querySelector('.gal__frame');
    if (!frame || reduce) return;
    var shots = Array.prototype.slice.call(frame.querySelectorAll('.gal__i'));
    if (shots.length < 2) return;
    var at = 0, timer = null;
    function step() {
      shots[at].classList.remove('is-active');
      at = (at + 1) % shots.length;
      shots[at].classList.add('is-active');
    }
    function start() { if (!timer) timer = setInterval(step, 5500); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es[0].isIntersecting ? start() : stop();
      }, { threshold: 0.1 }).observe(frame);
    } else start();
    addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  })();

  /* ---------- メニュー ---------- */
  (function () {
    var btn = document.querySelector('.burger');
    var menu = document.getElementById('menu');
    if (!btn || !menu) return;
    var open = false;

    function setOpen(v) {
      open = v;
      btn.setAttribute('aria-expanded', String(v));
      document.body.classList.toggle('menu-open', v);
      btn.querySelector('.sr').textContent = v ? 'メニューを閉じる' : 'メニューを開く';
      if (v) {
        menu.hidden = false;
        requestAnimationFrame(function () { menu.classList.add('is-open'); });
      } else {
        menu.classList.remove('is-open');
        setTimeout(function () { if (!open) menu.hidden = true; }, reduce ? 0 : 1250);
      }
    }
    btn.addEventListener('click', function () { setOpen(!open); });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) setOpen(false); });
  })();
})();
