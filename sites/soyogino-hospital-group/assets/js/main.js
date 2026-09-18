/* そよぎ野病院グループ */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var isSp = matchMedia('(max-width: 900px)');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // 読み込み直後の入り（ヒーロー）
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { document.body.classList.add('is-ready'); });
  });

  // ヒーロー写真のクロスフェード（5秒ごと）
  var slides = $$('.hero__slide');
  var cur = 0;
  setInterval(function () {
    if (reduce.matches || document.hidden) return;
    slides[cur].classList.remove('is-active');
    cur = (cur + 1) % slides.length;
    slides[cur].classList.add('is-active');
  }, 5000);

  // スクロールで現れる（1回きり）
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
  $$('.js-io').forEach(function (el) { io.observe(el); });

  // マーキーは画面内だけ動かす
  var runIo = new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.target.classList.toggle('is-run', e.isIntersecting); });
  });
  $$('.about__band, .jobs__band').forEach(function (el) { runIo.observe(el); });

  // ヘッダーの背景・フッター手前で隠す／固定エントリーを消す
  var hd = $('#hd'), entry = $('#entry'), ft = $('#footer');
  var onScroll = function () { hd.classList.toggle('is-solid', scrollY > 80); };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  new IntersectionObserver(function (es) {
    var on = es[0].isIntersecting;
    hd.classList.toggle('is-hide', on);
    entry.classList.toggle('is-off', on);
  }, { rootMargin: '0px 0px -20% 0px' }).observe(ft);

  // SPメニュー
  var btn = $('.hd__menu'), menu = $('#spmenu');
  var setMenu = function (open) {
    btn.setAttribute('aria-expanded', String(open));
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add('is-open'); }); });
    } else {
      menu.classList.remove('is-open');
      setTimeout(function () { if (!menu.classList.contains('is-open')) menu.hidden = true; }, reduce.matches ? 0 : 400);
    }
  };
  btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
  $$('[data-close]', menu).forEach(function (el) { el.addEventListener('click', function () { setMenu(false); }); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); btn.focus(); } });
  isSp.addEventListener('change', function () { if (!isSp.matches) setMenu(false); });

  // ビジョン：SPはまちの絵を固定したまま横へ送る（scrub 1.6 相当の追従）
  var mv = $('.vision__mv'), stage = $('.vision__stage'), track = $('.vision__track');
  var dist = 0, x = 0, raf = 0, last = 0;
  function measure() {
    if (!isSp.matches || reduce.matches) {
      mv.style.height = ''; track.style.transform = ''; dist = 0; x = 0;
      return;
    }
    dist = Math.max(0, track.offsetWidth - stage.clientWidth);
    mv.style.height = (stage.offsetHeight + dist * 1.2) + 'px';
    tick();
  }
  function target() {
    var len = dist * 1.2;
    if (!len) return 0;
    var p = Math.min(1, Math.max(0, -mv.getBoundingClientRect().top / len));
    return -p * dist;
  }
  function tick() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(function step(now) {
      var dt = Math.min(0.1, (now - last) / 1000); last = now;
      var t = target();
      x += (t - x) * (1 - Math.exp(-dt / 0.45));   // 約1.6秒で追いつく
      if (Math.abs(t - x) < 0.3) x = t;
      track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
      raf = x === t ? 0 : requestAnimationFrame(step);
    });
  }
  addEventListener('scroll', function () { if (dist) tick(); }, { passive: true });
  addEventListener('resize', measure);
  isSp.addEventListener('change', measure);
  reduce.addEventListener('change', measure);
  var town = $('.vision__town');
  if (town.complete) measure(); else town.addEventListener('load', measure);
  addEventListener('load', measure);
})();
