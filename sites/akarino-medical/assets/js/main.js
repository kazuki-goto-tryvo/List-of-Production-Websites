(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pc = matchMedia('(min-width: 901px)');

  // ヒーローの入り
  requestAnimationFrame(function () { document.body.classList.add('is-ready'); });

  // フェードで切り替えるスライダー（表示中の1枚に動きのクラスを付け直す）
  function fader(slides, onChange) {
    var i = 0;
    function show(n) {
      slides[i].classList.remove('is-active', 'is-moving');
      i = (n + slides.length) % slides.length;
      var s = slides[i];
      s.classList.add('is-active');
      void s.offsetWidth; // アニメーションを頭から
      s.classList.add('is-moving');
      if (onChange) onChange(i);
    }
    slides[0].classList.add('is-moving');
    return { show: show, next: function () { show(i + 1); }, prev: function () { show(i - 1); }, get index() { return i; } };
  }

  // MV: 7秒ごとにクロスフェード
  var mvSlides = document.querySelectorAll('.mv__slide');
  var dots = document.querySelectorAll('.mv__dot');
  var pause = document.querySelector('.mv__pause');
  var mv = fader(mvSlides, function (i) {
    dots.forEach(function (d, k) {
      d.classList.toggle('is-active', k === i);
      if (k === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
    });
  });
  var mvTimer = null;
  function mvPlay() { mvStop(); mvTimer = setInterval(mv.next, 7000); }
  function mvStop() { clearInterval(mvTimer); mvTimer = null; }
  dots.forEach(function (d, k) { d.addEventListener('click', function () { mv.show(k); if (mvTimer) mvPlay(); }); });
  pause.addEventListener('click', function () {
    var on = pause.getAttribute('aria-pressed') !== 'true';
    pause.setAttribute('aria-pressed', String(on));
    pause.setAttribute('aria-label', on ? 'スライドを再生' : 'スライドを一時停止');
    if (on) mvStop(); else mvPlay();
  });
  if (reduce) { pause.setAttribute('aria-pressed', 'true'); pause.setAttribute('aria-label', 'スライドを再生'); }
  else mvPlay();

  // SCROLL表示は y≥300 で消す／SPメニューはヒーローを過ぎたら地を付ける
  var scrollMark = document.querySelector('.mv__scroll');
  var menuBtn = document.querySelector('.spmenu');
  function onScroll() {
    var y = scrollY;
    scrollMark.classList.toggle('is-hidden', y >= 300);
    menuBtn.classList.toggle('is-solid', y >= 600);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 採用: 大は5秒ごと・小は大の次の1枚
  var big = document.querySelectorAll('.rec__frame .rec__slide');
  var small = document.querySelectorAll('.rec__small .rec__slide');
  var sm = fader(small);
  sm.show(1);
  var rec = fader(big, function (i) { sm.show(i + 1); });
  var recTimer = null;
  function recPlay() { clearInterval(recTimer); if (!reduce) recTimer = setInterval(rec.next, 5000); }
  document.querySelector('.rec__next').addEventListener('click', function () { rec.next(); recPlay(); });
  document.querySelector('.rec__prev').addEventListener('click', function () { rec.prev(); recPlay(); });
  var recBox = document.querySelector('.rec');
  recBox.addEventListener('mouseenter', function () { clearInterval(recTimer); });
  recBox.addEventListener('mouseleave', recPlay);
  recBox.addEventListener('focusin', function () { clearInterval(recTimer); });
  recBox.addEventListener('focusout', recPlay);
  recPlay();

  // フッターナビ: PCは開きっぱなし、SPは＋で開閉
  var cols = document.querySelectorAll('.ft__col');
  function syncCols() { cols.forEach(function (d) { d.open = pc.matches; }); }
  cols.forEach(function (d) {
    d.querySelector('summary').addEventListener('click', function (ev) { if (pc.matches) ev.preventDefault(); });
  });
  pc.addEventListener('change', syncCols);
  syncCols();

  // SPメニュー
  var drawer = document.getElementById('drawer');
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    drawer.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
  drawer.addEventListener('click', function (ev) { if (ev.target.closest('a')) setMenu(false); });
  addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && !drawer.hidden) { setMenu(false); menuBtn.focus(); } });
  pc.addEventListener('change', function () { if (pc.matches) setMenu(false); });

  // スクロールで現れる
  var rv = document.querySelectorAll('.rv');
  if (reduce || !('IntersectionObserver' in window)) {
    rv.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  }
})();
