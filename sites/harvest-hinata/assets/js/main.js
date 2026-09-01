/* 道の駅 ハーベストひなた（再現） — 依存ライブラリなし */
(() => {
  'use strict';
  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- MENU（狭い幅でナビを開閉） ---------- */
  const btn = document.getElementById('menuBtn');
  const nav = document.getElementById('gnav');
  if (btn && nav) {
    const setOpen = (open) => {
      btn.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    window.matchMedia('(min-width: 981px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  /* ---------- ヒーローの円周テキストをゆっくり回す ---------- */
  const ring = document.querySelector('.hero__ring');
  if (ring && !reduce()) {
    let deg = 0, last = 0;
    const tick = (now) => {
      if (now - last > 32) { deg = (deg + 0.06) % 360; ring.style.transform = `translateX(-50%) rotate(${deg}deg)`; last = now; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- 木の実（生産者アイコン）をふわっと ---------- */
  if (!reduce()) {
    document.querySelectorAll('.tree__faces li').forEach((el, i) => {
      el.style.animation = `bob ${5 + (i % 4) * 0.9}s ease-in-out ${-i * 0.55}s infinite`;
    });
  }

  /* ---------- スクロール表示 ---------- */
  if ('IntersectionObserver' in window) {
    const t = document.querySelectorAll(
      '.concept__row, .concept__cta, .about__head, .about__body, .strip li, .products__ph li, .products__body, .tourism__head, .news__head, .news__list li, .sorairo__body, .banners li, .minis li, .fmain__info, .fnav div'
    );
    t.forEach((el) => { if (!el.closest('.hero')) el.classList.add('reveal'); });
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (!e.isIntersecting) return; e.target.classList.add('is-in'); io.unobserve(e.target); });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
    t.forEach((el, i) => { el.style.transitionDelay = Math.min((i % 4) * 80, 240) + 'ms'; io.observe(el); });
  }
})();
