/* 社会福祉法人 あわいの森 — トップページ */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ヒーローの入り
  requestAnimationFrame(function () { document.body.classList.add('is-ready'); });

  // スクロールで現れる
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(function (el) {
      // その幅で出していない要素（PC/SP専用）は待たずに出しておく
      if (!el.getClientRects().length) el.classList.add('is-in');
      else io.observe(el);
    });
  }

  // 一時停止ボタンの表示を切り替える
  function setPressed(btn, paused, onLabel, offLabel) {
    btn.setAttribute('aria-pressed', paused ? 'true' : 'false');
    btn.setAttribute('aria-label', paused ? offLabel : onLabel);
  }

  // 01 流れ続ける写真帯
  var band = document.getElementById('heroBand');
  var bandBtn = document.querySelector('.hero__pause');
  bandBtn.addEventListener('click', function () {
    var paused = !band.classList.contains('is-paused');
    band.classList.toggle('is-paused', paused);
    setPressed(bandBtn, paused, '写真の流れを一時停止', '写真の流れを再開');
  });
  if (reduce) { band.classList.add('is-paused'); setPressed(bandBtn, true, '写真の流れを一時停止', '写真の流れを再開'); }

  // 02 私たちについて：写真のフェード切替
  var slides = document.querySelectorAll('#aboutSlides img');
  var aboutBtn = document.querySelector('.about__pause');
  var ai = 0, aboutTimer = null;
  function aboutNext() {
    slides[ai].classList.remove('is-active');
    ai = (ai + 1) % slides.length;
    slides[ai].classList.add('is-active');
  }
  function aboutPlay(on) {
    clearInterval(aboutTimer); aboutTimer = null;
    if (on) aboutTimer = setInterval(aboutNext, 5500);
    setPressed(aboutBtn, !on, '写真の切り替えを一時停止', '写真の切り替えを再開');
  }
  aboutBtn.addEventListener('click', function () { aboutPlay(!aboutTimer); });
  aboutPlay(!reduce);

  // 07 写真スライダー（前／一時停止／次）
  var track = document.querySelector('.slider__track');
  var n = track.children.length, si = 0, sliderTimer = null;
  var pauseBtn = document.querySelector('.ctrl__pause');
  function go(i) {
    si = (i + n) % n;
    track.style.transform = 'translateX(' + (-100 * si) + '%)';
    [].forEach.call(track.children, function (img, k) { img.setAttribute('aria-hidden', k === si ? 'false' : 'true'); });
  }
  function sliderPlay(on) {
    clearInterval(sliderTimer); sliderTimer = null;
    if (on) sliderTimer = setInterval(function () { go(si + 1); }, 6000);
    setPressed(pauseBtn, !on, '自動再生を一時停止', '自動再生を再開');
  }
  document.querySelector('.ctrl__prev').addEventListener('click', function () { go(si - 1); if (sliderTimer) sliderPlay(true); });
  document.querySelector('.ctrl__next').addEventListener('click', function () { go(si + 1); if (sliderTimer) sliderPlay(true); });
  pauseBtn.addEventListener('click', function () { sliderPlay(!sliderTimer); });
  go(0);
  sliderPlay(!reduce);

  // メニュー（右からのドロワー）
  var drawer = document.getElementById('drawer');
  var menuBtns = document.querySelectorAll('.menu-btn');
  function menu(open) {
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('menu-open', open);
    if (open) search(false);
    menuBtns.forEach(function (b) {
      b.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      b.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    });
  }
  menuBtns.forEach(function (b) {
    b.addEventListener('click', function () { menu(!drawer.classList.contains('is-open')); });
  });
  drawer.querySelectorAll('[data-close]').forEach(function (el) {
    el.addEventListener('click', function () { menu(false); });
  });

  // 検索パネル
  var fs = document.querySelector('.fixsearch');
  var fsBtn = fs.querySelector('.fixbtn--search');
  function search(open) {
    fs.classList.toggle('is-open', open);
    fsBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) setTimeout(function () { fs.querySelector('input').focus(); }, reduce ? 0 : 200);
  }
  fsBtn.addEventListener('click', function () { search(!fs.classList.contains('is-open')); });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    menu(false); search(false);
  });

  // 04 日記のカテゴリタブ（押すとその分野だけ、もう一度押すと解除）
  var tabs = document.querySelectorAll('.diary__tabs button');
  var posts = document.querySelectorAll('.post');
  var empty = document.querySelector('.diary__empty');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      var on = t.getAttribute('aria-pressed') !== 'true';
      tabs.forEach(function (x) { x.setAttribute('aria-pressed', x === t && on ? 'true' : 'false'); });
      var cat = on ? t.dataset.cat : null, shown = 0;
      posts.forEach(function (p) {
        var hit = !cat || p.dataset.cat === cat;
        p.hidden = !hit;
        if (hit) { shown++; p.classList.add('is-in'); }
      });
      empty.hidden = shown > 0;
    });
  });
})();
