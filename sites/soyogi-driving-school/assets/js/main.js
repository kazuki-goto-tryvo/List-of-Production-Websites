/* そよぎ自動車学校 */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- ローディング幕（JSが転んでも 1.6s で必ず消える） ---------- */
  var done = false;
  function finish() {
    if (done) return; done = true;
    document.body.classList.add('is-loaded');
    setTimeout(function () { document.body.classList.add('is-ready'); }, 120);
  }
  setTimeout(finish, 1600);
  if (document.readyState === 'complete') setTimeout(finish, 250);
  else addEventListener('load', function () { setTimeout(finish, 250); });

  /* ---------- ドロワー（hidden を外して visibility に任せる） ---------- */
  var drawer = $('#drawer'), overlay = $('#overlay'), menubtn = $('#menubtn');
  if (drawer) drawer.removeAttribute('hidden');
  if (overlay) overlay.removeAttribute('hidden');
  function setMenu(open) {
    if (!menubtn) return;
    menubtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    drawer.classList.toggle('is-open', open);
    overlay.classList.toggle('is-open', open);
  }
  if (menubtn) menubtn.addEventListener('click', function () {
    setMenu(menubtn.getAttribute('aria-expanded') !== 'true');
  });
  if (overlay) overlay.addEventListener('click', function () { setMenu(false); });
  if (drawer) $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- スクロールで現れる ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach(function (el) { io.observe(el); });

    /* 見出しの巨大英字を下からワイプ（clip-path で隠した子は発火しないので親を見張る） */
    var ioT = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-run');
        ioT.unobserve(e.target);
      });
    }, { threshold: 0.3 });
    $$('.sec-ttl').forEach(function (el) { ioT.observe(el); });

    /* 流れ続ける帯・ギャラリーは画面に入っているあいだだけ動かす */
    var ioV = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('is-vis', e.isIntersecting); });
    }, { threshold: 0.01 });
    $$('.band, .gal').forEach(function (el) { ioV.observe(el); });

    /* CTA のアーチ文字は一度出たら出っぱなし（外すと差分チェックで白紙になる） */
    var ioA = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-shown');
        ioA.unobserve(e.target);
      });
    }, { threshold: 0.2 });
    $$('.cta').forEach(function (el) { ioA.observe(el); });

    /* 右端の縦タブ（SPは下端バー）は CTA に入ったら袖へ引く */
    var side = $('#side'), cta = $('#cta');
    if (side && cta) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { side.classList.toggle('is-hidden', e.isIntersecting); });
      }, { threshold: 0.12 }).observe(cta);
    }
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('is-in'); });
    $$('.sec-ttl').forEach(function (el) { el.classList.add('is-run'); });
    $$('.band, .gal').forEach(function (el) { el.classList.add('is-vis'); });
    $$('.cta').forEach(function (el) { el.classList.add('is-shown'); });
  }

  /* ---------- CTA のアーチ文字を1文字ずつ（30ms ずつ遅らせる） ---------- */
  $$('.arch__t').forEach(function (t) {
    var tp = t.querySelector('textPath');
    if (!tp) return;
    var txt = tp.textContent, i;
    tp.textContent = '';
    for (i = 0; i < txt.length; i++) {
      var sp = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      sp.textContent = txt.charAt(i);
      sp.style.transitionDelay = (i * 30) + 'ms';
      tp.appendChild(sp);
    }
  });

  /* ---------- ヒーローのクロスフェード ---------- */
  (function () {
    var stage = $('.hero__stage'); if (!stage) return;
    var slides = $$('.hero__slide', stage), dots = $$('.hero__dot', stage);
    var pauseBtn = $('#heroPause');
    if (slides.length < 2) return;
    var cur = 0, timer = null, held = false, stopped = reduce;

    function show(n) {
      cur = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle('is-active', i === cur); });
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === cur);
        d.setAttribute('aria-selected', i === cur ? 'true' : 'false');
      });
    }
    function tick() { if (!held && !stopped) show(cur + 1); }
    function start() { if (timer || stopped) return; timer = setInterval(tick, 6000); }
    function stop() { clearInterval(timer); timer = null; }

    dots.forEach(function (d, i) { d.addEventListener('click', function () { show(i); }); });
    stage.addEventListener('mouseenter', function () { held = true; });
    stage.addEventListener('mouseleave', function () { held = false; });
    stage.addEventListener('focusin', function () { held = true; });
    stage.addEventListener('focusout', function () { held = false; });
    if (pauseBtn) {
      if (reduce) pauseBtn.hidden = true;
      pauseBtn.addEventListener('click', function () {
        stopped = !stopped;
        pauseBtn.setAttribute('aria-pressed', stopped ? 'true' : 'false');
        pauseBtn.textContent = stopped ? '自動切り替えを動かす' : '自動切り替えを止める';
        if (stopped) stop(); else start();
      });
    }
    show(0);
    if (!reduce) start();
  })();

  /* ---------- Reason のスナップカルーセル（矢印＋ドット） ---------- */
  (function () {
    var track = $('#rsnTrack'); if (!track) return;
    var cards = $$('li', track), dots = $$('i', $('#rsnDots') || document.createElement('div'));
    function step(dir) {
      var w = cards[0] ? cards[0].offsetWidth + 20 : 270;
      track.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    /* SPは中央1枚＋左右チラ見せ。2枚目を真ん中に置いた状態から始める（SPフレームどおり） */
    if (track.scrollWidth > track.clientWidth + 8 && cards[1]) {
      track.scrollLeft = cards[1].offsetLeft - (track.clientWidth - cards[1].offsetWidth) / 2;
    }
    var prev = $('#rsnPrev'), next = $('#rsnNext');
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    if ('IntersectionObserver' in window && dots.length) {
      cards.forEach(function (c) {
        new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (!e.isIntersecting) return;
            var i = cards.indexOf(e.target);
            dots.forEach(function (d, n) { d.classList.toggle('is-active', n === i); });
          });
        }, { root: track, threshold: 0.6 }).observe(c);
      });
    }
  })();
})();
