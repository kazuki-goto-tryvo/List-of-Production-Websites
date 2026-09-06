/* センデック電気システム株式会社 採用サイト */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───────── M1 線画の流れる帯 ─────────
     同じ並びを2セット入れて -50% まで動かす。速度と負のdelayはCSS側。 */
  var LINES = [
    ['line-01-train', 286, 214, '電車'],
    ['line-02-worker', 242, 255, '工具を持って手を挙げる作業員'],
    ['line-03-building', 274, 216, 'オフィスビル'],
    ['line-04-bulb', 136, 230, '電球'],
    ['line-05-transformer', 221, 220, '変圧器'],
    ['line-06-pointing', 286, 202, '指差し確認する2人'],
    ['line-07-tower', 223, 241, '鉄塔'],
    ['line-08-station', 293, 181, '駅舎'],
    ['line-09-tools', 205, 211, 'スパナとドライバー']
  ];

  function buildStrip(row) {
    var offset = Number(row.dataset.strip || 0);
    var html = '';
    for (var s = 0; s < 2; s++) {
      html += '<span class="strip__set">';
      for (var i = 0; i < LINES.length; i++) {
        var it = LINES[(i + offset) % LINES.length];
        html += '<img src="assets/img/' + it[0] + '.webp" width="' + it[1] + '" height="' + it[2] +
          '" alt="" loading="lazy" decoding="async">';
      }
      html += '</span>';
    }
    row.innerHTML = html;
  }
  Array.prototype.forEach.call(document.querySelectorAll('.strip__row'), buildStrip);

  /* ───────── M4 見出しの文字送り ───────── */
  Array.prototype.forEach.call(document.querySelectorAll('.split'), function (el) {
    var text = el.textContent;
    var out = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      out += '<span style="--i:' + i + '">' + (ch === ' ' ? '&nbsp;' : ch) + '</span>';
    }
    el.innerHTML = out;
  });

  /* ───────── M5 スクロールで出す ───────── */
  var lastParent = null, stagger = 0;
  Array.prototype.forEach.call(document.querySelectorAll('.reveal'), function (el) {
    if (el.parentNode === lastParent) { stagger++; } else { lastParent = el.parentNode; stagger = 0; }
    if (stagger) el.style.setProperty('--d', stagger);
  });

  var targets = document.querySelectorAll('.reveal, .split');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);            /* once:true。出っぱなしで正しい */
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-in'); });
  }

  /* ───────── ヒーローの入り ───────── */
  requestAnimationFrame(function () { document.body.classList.add('is-ready'); });

  /* ───────── M6 背景の帯のゆるい視差 ───────── */
  if (!reduce) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        document.documentElement.style.setProperty('--sy', String(window.pageYOffset));
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ───────── M9 全画面メニュー ───────── */
  var menu = document.getElementById('menu');
  var burger = document.querySelector('[data-toggle-menu]');
  var menuOpen = false, modalOpen = false;

  function setMenu(open) {
    menuOpen = open;
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { menu.classList.add('is-open'); });
    } else {
      menu.classList.remove('is-open');
      window.setTimeout(function () { if (!menuOpen) menu.hidden = true; }, 350);
    }
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.querySelector('.sr-only').textContent = open ? 'メニューを閉じる' : 'メニューを開く';
    lockScroll();
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-toggle-menu]'), function (b) {
    b.addEventListener('click', function () { setMenu(!menuOpen); });
  });
  Array.prototype.forEach.call(menu.querySelectorAll('a'), function (a) {
    if (a.getAttribute('href').charAt(0) === '#') a.addEventListener('click', function () { setMenu(false); });
  });

  /* ───────── M10 Entry モーダル ───────── */
  var modal = document.getElementById('entry-modal');

  function setModal(open) {
    modalOpen = open;
    if (open) {
      modal.hidden = false;
      requestAnimationFrame(function () { modal.classList.add('is-open'); });
      var f = modal.querySelector('.modal__card');
      if (f) f.focus();
    } else {
      modal.classList.remove('is-open');
      window.setTimeout(function () { if (!modalOpen) modal.hidden = true; }, 300);
    }
    lockScroll();
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-open-modal]'), function (b) {
    b.addEventListener('click', function () { setModal(true); });
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-close-modal]'), function (b) {
    b.addEventListener('click', function () { setModal(false); });
  });
  Array.prototype.forEach.call(modal.querySelectorAll('a[href^="#"]'), function (a) {
    a.addEventListener('click', function () { setModal(false); });
  });

  function lockScroll() {
    document.body.style.overflow = (menuOpen || modalOpen) ? 'hidden' : '';
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (modalOpen) setModal(false);
    else if (menuOpen) setMenu(false);
  });

  /* ───────── M3 Person カルーセル ───────── */
  var PEOPLE = [
    { ph: 'ph-person-main', alt: '夜の現場でヘルメットをかぶり笑顔で立つ技術者',
      catch: ['見えない電気を、', '確かめながら渡していく。'], tag: '鉄道電気（電車線）', who: 'K.S.　2016年入社' },
    { ph: 'ph-person-b', alt: '鉄塔を背に立つベテランの変電技術者',
      catch: ['止まらないことを、', '当たり前にする仕事です。'], tag: '変電・受電設備', who: 'M.T.　2019年入社' },
    { ph: 'ph-person-a', alt: '信号設備の盤の前に立つ女性技術者',
      catch: ['合図がきちんと届く。', 'そのために、何度でも確かめます。'], tag: '信号通信', who: 'A.N.　2021年入社' },
    { ph: 'ph-person-main', alt: '夜のホームで設備を確認する技術者',
      catch: ['駅の明かりは、', '誰かの帰り道を照らしています。'], tag: '駅設備・建築電気', who: 'Y.K.　2014年入社' },
    { ph: 'ph-person-b', alt: '架線の下で工具を手にする若手技術者',
      catch: ['先輩の手つきを覚えることから、', '毎日が始まりました。'], tag: '鉄道電気（電車線）', who: 'R.H.　2023年入社' },
    { ph: 'ph-person-a', alt: '図面を手に工程を確認する施工管理担当',
      catch: ['工程を組み替える判断まで、', '現場が教えてくれます。'], tag: '施工管理', who: 'S.O.　2010年入社' }
  ];

  var car = document.querySelector('[data-carousel]');
  if (car) {
    var mainImg = car.querySelector('[data-main-img]');
    var prevImg = car.querySelector('[data-prev-img]');
    var nextImg = car.querySelector('[data-next-img]');
    var elCatch = document.querySelector('[data-catch]');
    var elTag = document.querySelector('[data-tag]');
    var elWho = document.querySelector('[data-who]');
    var idx = 0;
    var timer = null;

    var src = function (p) { return 'assets/img/' + p.ph + '.webp'; };
    var at = function (i) { return PEOPLE[(i + PEOPLE.length) % PEOPLE.length]; };

    function paint() {
      var cur = at(idx), pv = at(idx - 1), nx = at(idx + 1);
      mainImg.src = src(cur); mainImg.alt = cur.alt;
      prevImg.src = src(pv); prevImg.alt = '';
      nextImg.src = src(nx); nextImg.alt = '';
      elCatch.innerHTML = cur.catch[0] + '<br>' + cur.catch[1];
      elTag.textContent = cur.tag;
      elWho.textContent = cur.who;
    }

    function go(step) {
      idx = (idx + step + PEOPLE.length) % PEOPLE.length;
      if (reduce) { paint(); return; }
      car.classList.add('is-fading');
      window.setTimeout(function () { paint(); car.classList.remove('is-fading'); }, 260);
    }

    car.querySelector('[data-car-prev]').addEventListener('click', function () { go(-1); restart(); });
    car.querySelector('[data-car-next]').addEventListener('click', function () { go(1); restart(); });

    function start() { if (!reduce && !timer) timer = window.setInterval(function () { go(1); }, 6000); }
    function stop() { if (timer) { window.clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    car.addEventListener('mouseenter', stop);
    car.addEventListener('mouseleave', start);
    car.addEventListener('focusin', stop);
    start();
  }

  /* ───────── M13 Top ボタン ───────── */
  var totop = document.querySelector('[data-totop]');
  if (totop) {
    totop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }
})();
