/* WORLD ROUTE 採用サイト — 依存ライブラリなし */
(() => {
  'use strict';

  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduceMotion = () => mqReduce.matches;

  /* ---------- ヒーローの初回演出を起動 ---------- */
  const start = () => document.body.classList.add('is-ready');
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);
  // 画像の読み込みが遅いときの保険
  setTimeout(start, 1200);

  /* ---------- ハンバーガーメニュー ---------- */
  const burger = document.getElementById('hamburger');
  const gnav = document.getElementById('gnav');
  if (burger && gnav) {
    const setOpen = (open) => {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
      gnav.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => setOpen(burger.getAttribute('aria-expanded') !== 'true'));
    gnav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    window.matchMedia('(min-width: 981px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  /* ---------- ヘッダー：固定化＋下スクロールで隠す ---------- */
  const header = document.getElementById('siteHeader');
  if (header) {
    let last = 0, ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const stuck = y > 120;
        header.classList.toggle('is-stuck', stuck);
        // メニューを開いているあいだは隠さない
        const menuOpen = burger && burger.getAttribute('aria-expanded') === 'true';
        header.classList.toggle('is-hidden', stuck && !menuOpen && y > last + 4 && y > 300);
        last = y;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 写真マーキー：継ぎ目のないループ ---------- */
  const marquee = document.getElementById('marquee');
  const track = marquee && marquee.querySelector('.marquee__track');
  const toggle = document.getElementById('marqueeToggle');
  if (track) {
    // 同じ並びをもう一組足して -50% で戻しても繋がるようにする
    const clones = [...track.children].map((li) => {
      const c = li.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      return c;
    });
    track.append(...clones);

    if (toggle) {
      const label = toggle.querySelector('.txt');
      const setPaused = (paused) => {
        marquee.classList.toggle('is-paused', paused);
        toggle.setAttribute('aria-pressed', String(paused));
        if (label) label.textContent = paused ? '再生' : '一時停止';
      };
      toggle.addEventListener('click', () => setPaused(toggle.getAttribute('aria-pressed') !== 'true'));
      if (reduceMotion()) setPaused(true);
    }
    marquee.addEventListener('mouseenter', () => marquee.classList.add('is-paused'));
    marquee.addEventListener('mouseleave', () => {
      if (!toggle || toggle.getAttribute('aria-pressed') !== 'true') marquee.classList.remove('is-paused');
    });
  }

  /* ---------- スクロール表示 ---------- */
  // [セレクタ, 付けるクラス, 同じ親の中でずらすか]
  const REVEALS = [
    ['.sec-head', 'reveal--head', false],
    ['.about__text > *, .about__map, .link-list li', 'reveal', true],
    ['.about__gallery img', 'reveal--scale', true],
    ['.job-list li', 'reveal', true],
    ['.card-grid li', 'reveal', true],
    ['.sel-list li', 'reveal', true],
    ['.questions__center > *', 'reveal', true],
    ['.bubble', 'reveal--scale', true],
    ['.env__photo, .office__photo', 'reveal--scale', false],
    ['.cta__text, .cta__buttons, .cta__actions .link-line, .cta__foot', 'reveal', true],
    ['.link-line--end', 'reveal', false],
    ['.fnav__col, .fbottom', 'reveal', true],
  ];

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.04 });

    REVEALS.forEach(([sel, cls, stagger]) => {
      const els = document.querySelectorAll(sel);
      let i = 0, prevParent = null;
      els.forEach((el) => {
        if (el.closest('.hero')) return;       // ヒーローは初回演出に任せる
        el.classList.add(cls);
        if (stagger) {
          if (el.parentElement !== prevParent) { i = 0; prevParent = el.parentElement; }
          el.style.transitionDelay = Math.min(i * 70, 350) + 'ms';
          i++;
        }
        io.observe(el);
      });
    });
  }

  /* ---------- 214 のカウントアップ ---------- */
  const num = document.querySelector('.about__count .num');
  if (num && 'IntersectionObserver' in window) {
    const target = parseInt(num.textContent, 10);
    if (!Number.isNaN(target)) {
      const io2 = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          io2.unobserve(en.target);
          if (reduceMotion()) return;
          const dur = 1200, t0 = performance.now();
          num.textContent = '0';
          const step = (now) => {
            const p = Math.min((now - t0) / dur, 1);
            // 終盤をゆるめる
            num.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      }, { threshold: 0.5 });
      io2.observe(num);
    }
  }
})();
