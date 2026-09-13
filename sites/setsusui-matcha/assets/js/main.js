/* MATCHA by SETSUSUI — 動き
   参照元は GSAP + ScrollTrigger + Lenis だが、scrub しているのは抹茶セクション1本だけで
   中身は progress を 0.33 / 0.66 で切って「何番目を出すか」を決めているだけ。
   ここでは position:sticky ＋ 進捗を読む数行で同じ見え方にしている。 */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var spq = window.matchMedia('(max-width: 900px)');

  document.documentElement.classList.add('js');
  requestAnimationFrame(function () { document.body.classList.add('is-ready'); });

  /* ---------- スクロール位置（200px でヒーローのナビ→Menu に入れ替え） ---------- */
  var lastY = window.pageYOffset, teleported = false;

  // 画面何枚ぶんも一気に飛んだ（＝スクロールではなく瞬間移動）あいだは reveal を戻さない。
  // ふつうにスクロールし直したら解除する
  function markScroll() {
    var y = window.pageYOffset, d = Math.abs(y - lastY);
    if (d > window.innerHeight * 2) teleported = true;
    else if (d > 0) teleported = false;
    lastY = y;
  }

  function onScroll() {
    markScroll();
    document.body.classList.toggle('is-scrolled', window.pageYOffset > 200);
    updateOrigin();
  }

  /* ---------- reveal（出入りする。参照元の play none none reverse と同じ） ---------- */
  var revealIO = null;
  if ('IntersectionObserver' in window && !reduce) {
    revealIO = new IntersectionObserver(function (entries) {
      markScroll();
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); return; }
        // 下へ外れた（＝スクロールを戻した）ときだけ戻す。上へ抜けたぶんは出したまま
        if (!teleported && e.boundingClientRect.top > 0) e.target.classList.remove('is-in');
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -10% 0px' });

    [].forEach.call(document.querySelectorAll('.reveal, .prod, .card'), function (el) {
      revealIO.observe(el);
    });
  } else {
    [].forEach.call(document.querySelectorAll('.reveal, .prod, .card'), function (el) {
      el.classList.add('is-in');
    });
  }

  /* ---------- ギャラリー（帯そのものを監視。中身は右外にいると発火しない） ---------- */
  var gallery = document.querySelector('.gallery');
  if (gallery) {
    if (!('IntersectionObserver' in window) || reduce) {
      gallery.classList.add('is-in');
    } else {
      new IntersectionObserver(function (es, ob) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          gallery.classList.add('is-in');
          ob.unobserve(e.target);
        });
      }, { threshold: 0.05 }).observe(gallery);
    }
  }

  /* ---------- 抹茶のこと（sticky ＋ 進捗で 1/2/3 枚目を入れ替える） ---------- */
  var origin = document.querySelector('.origin');
  var sticky = document.querySelector('.origin__sticky');
  var ops = [].slice.call(document.querySelectorAll('.op'));
  var curOp = 0, outTimer = null;

  function updateOrigin() {
    if (!origin || !ops.length) return;
    if (spq.matches) {                      // SPは sticky をやめて3回積むので、全部出したまま
      ops.forEach(function (op) { op.classList.add('is-active'); op.classList.remove('is-out'); });
      return;
    }
    var r = origin.getBoundingClientRect();
    var span = r.height - sticky.offsetHeight;
    var p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
    var i = Math.min(ops.length - 1, Math.floor(p * ops.length));
    if (i === curOp && ops[i].classList.contains('is-active')) return;
    if (i === curOp) { ops[i].classList.add('is-active'); return; }

    var prev = ops[curOp];
    prev.classList.remove('is-active');
    if (!reduce) {
      prev.classList.add('is-out');
      clearTimeout(outTimer);
      outTimer = setTimeout(function () { prev.classList.remove('is-out'); }, 450);
    }
    curOp = i;
    ops[i].classList.remove('is-out');
    ops[i].classList.add('is-active');
  }

  /* ---------- ハンバーガー ---------- */
  var toggle = document.getElementById('menuToggle');
  var panel = document.getElementById('menuPanel');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
        setMenu(false);
        toggle.focus();
      }
    });
  }

  /* ---------- ページ内リンクはここでなめらかに送る ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute('href');
    if (!id || id === '#') return;
    var t = id === '#top' ? document.body : document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    if (id !== '#top') {                      // 送った先にフォーカスを移す（スキップリンク用）
      t.setAttribute('tabindex', '-1');
      t.focus({ preventScroll: true });
    }
  });

  /* ---------- 取扱店舗のアコーディオン ---------- */
  [].forEach.call(document.querySelectorAll('.acc__btn'), function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      var body = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      if (body) body.classList.toggle('is-open', !open);
    });
  });

  /* ---------- 店舗限定スライダー（4000ms 自動送り） ---------- */
  var slider = document.querySelector('.slider');
  if (slider) {
    var slides = [].slice.call(slider.querySelectorAll('.slide'));
    var dots = [].slice.call(slider.querySelectorAll('.dot'));
    var pause = slider.querySelector('.slider__pause');
    var cur = 0, timer = null, stopped = reduce;

    function show(n) {
      cur = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle('is-active', i === cur); });
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === cur); });
    }
    function start() { clearInterval(timer); if (!stopped) timer = setInterval(function () { show(cur + 1); }, 4000); }

    dots.forEach(function (d) {
      d.addEventListener('click', function () { show(Number(d.dataset.s)); start(); });
    });
    if (pause) {
      pause.setAttribute('aria-pressed', stopped ? 'true' : 'false');
      pause.setAttribute('aria-label', stopped ? '自動送りを始める' : '自動送りを止める');
      pause.addEventListener('click', function () {
        stopped = !stopped;
        pause.setAttribute('aria-pressed', stopped ? 'true' : 'false');
        pause.setAttribute('aria-label', stopped ? '自動送りを始める' : '自動送りを止める');
        start();
      });
    }
    start();
  }

  /* ---------- 起動 ---------- */
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { updateOrigin(); }, { passive: true });
  if (spq.addEventListener) spq.addEventListener('change', updateOrigin);
  onScroll();
})();
