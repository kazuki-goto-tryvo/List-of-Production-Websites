/* NOBIRU FIELD */
(function () {
  var root = document.documentElement, body = document.body;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* レイヤード文字：本体の左に、切れた複製を2枚つくる */
  $$('.lt').forEach(function (el) {
    var t = el.textContent;
    el.textContent = '';
    ['lt__g lt__g1', 'lt__g lt__g2'].forEach(function (c) {
      var g = document.createElement('span');
      g.className = c; g.setAttribute('aria-hidden', 'true');
      g.innerHTML = '<span></span>'; g.firstChild.textContent = t;
      el.appendChild(g);
    });
    var m = document.createElement('span');
    m.className = 'lt__m'; m.innerHTML = '<span></span>'; m.firstChild.textContent = t;
    el.appendChild(m);
  });

  /* レイヤード画像：同じ写真を3枚の短冊に */
  function buildLimg(el) {
    var img = el.querySelector('img');
    el.innerHTML = '';
    for (var i = 0; i < 3; i++) {
      var p = document.createElement('div');
      p.className = 'limg__p';
      var c = img.cloneNode();
      if (i < 2) { c.alt = ''; c.setAttribute('aria-hidden', 'true'); }
      p.appendChild(c); el.appendChild(p);
    }
  }
  $$('.limg').forEach(buildLimg);

  /* マーキー：1周分を並べて2倍にする */
  var unit = $('#mq-unit');
  $$('.mq__track').forEach(function (tr) {
    for (var i = 0; i < 8; i++) tr.appendChild(unit.content.cloneNode(true));
  });

  /* 一度きりの reveal */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '-10% 0px -10% 0px' });

  /* 写真帯：入るたびに再生（上に抜けたら引っ込める） */
  var ioSlide = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) e.target.classList.add('is-show');
      else if (e.boundingClientRect.top < 0) e.target.classList.remove('is-show');
    });
  }, { rootMargin: '0px 0px -10% 0px' });

  /* 画面内のときだけ：手を振る／マーキーを流す */
  var ioPlay = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.target.classList.contains('mq')) e.target.classList.toggle('is-off', !e.isIntersecting);
      else e.target.classList.toggle('is-play', e.isIntersecting);
    });
  });
  $$('.contact, .mq').forEach(function (el) { ioPlay.observe(el); });

  function start() {
    body.classList.add('is-ready');
    $$('.reveal').forEach(function (el) {
      // この幅で出さない要素（.pc/.sp）は最終状態にしておく
      if (!el.getClientRects().length) el.classList.add('is-in');
      else io.observe(el);
    });
    $$('.slidein').forEach(function (el) { ioSlide.observe(el); });
    startHero();
  }

  /* ローディング：ロゴが出て、1.0s後に幕が上へ抜ける */
  var loading = $('.loading');
  if (reduce) { body.classList.add('is-loaded'); start(); }
  else {
    var lg = $('.loading__logo');
    lg.classList.add('reveal');
    requestAnimationFrame(function () { requestAnimationFrame(function () { lg.classList.add('is-in'); }); });
    setTimeout(function () {
      body.classList.add('is-leaving');
      setTimeout(start, 200);
      setTimeout(function () { body.classList.add('is-loaded'); }, 650);
    }, 1000);
  }

  /* ---------- ヒーローのスライド ---------- */
  var slides = [
    { name: 'RIVER OWLS', src: 'assets/img/hero-1.webp', alt: '3人制バスケットボールの選手と子どもが体育館でパス練習をしている' },
    { name: 'MINAMO BLAZE', src: 'assets/img/hero-2.webp', alt: 'フットサルでボールを蹴る女の子と、後ろで見守るコーチ' },
    { name: 'KAWASEMI RUNNERS', src: 'assets/img/hero-3.webp', alt: '河川敷を並んで走る親子' }
  ];
  slides.forEach(function (s) { var i = new Image(); i.src = s.src; });
  var cur = 0, timer = null, paused = false;
  var ph = $('.hero__ph'), sName = $('[data-swap="name"]'), sNum = $('[data-swap="n"]');
  function chars(el, txt) {
    el.innerHTML = '';
    txt.split('').forEach(function (ch, i) {
      var s = document.createElement('span');
      s.textContent = ch === ' ' ? ' ' : ch;
      s.style.setProperty('--i', (i * 0.03) + 's');
      el.appendChild(s);
    });
  }
  chars(sName, slides[0].name); chars(sNum, '01');
  function go(n) {
    cur = (n + slides.length) % slides.length;
    var s = slides[cur];
    [sName, sNum].forEach(function (el) { el.classList.remove('is-show'); el.classList.add('is-hide'); });
    setTimeout(function () {
      chars(sName, s.name); chars(sNum, '0' + (cur + 1));
      [sName, sNum].forEach(function (el) { el.classList.remove('is-hide'); el.classList.add('is-pre'); });
      void sName.offsetWidth;
      [sName, sNum].forEach(function (el) { el.classList.remove('is-pre'); el.classList.add('is-show'); });
    }, reduce ? 0 : 600);
    $$('img', ph).forEach(function (im, i) { im.src = s.src; if (i === 2) im.alt = s.alt; });
    if (!reduce) {
      ph.classList.add('no-tr'); ph.classList.remove('is-in'); void ph.offsetWidth;
      ph.classList.remove('no-tr'); ph.classList.add('is-in');
    }
  }
  function startHero() {
    if (reduce) return;
    timer = setInterval(function () { if (!paused) go(cur + 1); }, 6000);
  }
  $('.hero__cnt').addEventListener('click', function () { go(cur + 1); });
  var hero = $('.hero');
  hero.addEventListener('mouseenter', function () { paused = true; });
  hero.addEventListener('mouseleave', function () { paused = pauseBtn.getAttribute('aria-pressed') === 'true'; });
  var pauseBtn = $('.hero__pause');
  pauseBtn.addEventListener('click', function () {
    var on = pauseBtn.getAttribute('aria-pressed') !== 'true';
    pauseBtn.setAttribute('aria-pressed', on);
    pauseBtn.textContent = on ? 'スライドの自動再生を再開する' : 'スライドの自動再生を止める';
    paused = on;
  });

  /* ---------- サービス：ホバー行をカードに映す ---------- */
  var card = $('.svc__card'), cardPh = $('.svc__ph');
  $$('.svc__row').forEach(function (row) {
    function on() {
      if (row.classList.contains('is-on')) return;
      $$('.svc__row.is-on').forEach(function (r) { r.classList.remove('is-on'); });
      row.classList.add('is-on');
      card.classList.add('is-swap');
      $('.svc__en', card).textContent = row.dataset.en;
      $('.svc__jp', card).textContent = row.querySelector('.svc__n').textContent;
      $('.svc__desc', card).textContent = row.dataset.desc;
      $('.svc__icon', card).src = 'assets/img/' + row.dataset.ic + '.webp';
      $$('img', cardPh).forEach(function (im) { im.src = 'assets/img/' + row.dataset.ph + '.webp'; });
      cardPh.classList.add('is-hide');
      void cardPh.offsetWidth;
      card.classList.remove('is-swap');
      cardPh.classList.remove('is-hide');
    }
    row.addEventListener('mouseenter', on);
    row.addEventListener('focus', on);
  });

  /* ---------- 追従ヘッダー ---------- */
  var hs = $('.hs');
  function onScroll() {
    var y = window.scrollY > 700;
    hs.classList.toggle('is-show', y);
    root.classList.toggle('is-scrolled', y);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- メニュー ---------- */
  var menu = $('#menu'), mbtn = $('.mbtn'), mclose = $('.menu__close');
  function openMenu() {
    menu.hidden = false; void menu.offsetWidth;
    menu.classList.add('is-open'); body.classList.add('menu-open');
    mbtn.setAttribute('aria-expanded', 'true');
    mclose.focus();
  }
  function closeMenu() {
    menu.classList.remove('is-open'); body.classList.remove('menu-open');
    mbtn.setAttribute('aria-expanded', 'false');
    setTimeout(function () { menu.hidden = true; }, reduce ? 0 : 450);
    mbtn.focus();
  }
  mbtn.addEventListener('click', openMenu);
  mclose.addEventListener('click', closeMenu);
  $$('a', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) {
    if (menu.hidden) return;
    if (e.key === 'Escape') closeMenu();
    if (e.key === 'Tab') {
      var f = $$('button, a', menu), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();
