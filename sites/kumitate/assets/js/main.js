/* クミタテ — ライブラリなし。参照元も Astro製でアニメーションライブラリを1つも読んでいない */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---- ハンバーガー ---- */
  const burger = $('#burger'), menu = $('#menu');
  menu.hidden = true;
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!open));
    burger.setAttribute('aria-label', open ? 'メニューを開く' : 'メニューを閉じる');
    menu.hidden = open;
  });
  $$('a', menu).forEach(a => a.addEventListener('click', () => {
    burger.setAttribute('aria-expanded', 'false'); menu.hidden = true;
  }));

  /* ---- 出現（参照元と同じく .is-show を足すだけ） ---- */
  const io = new IntersectionObserver((es) => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-show'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: .04 });
  $$('.up,.eff__d').forEach(el => io.observe(el));

  /* ---- 写真は読み込めた瞬間にフェードイン（画面外でも必ず出る） ---- */
  $$('.fade').forEach(f => {
    const im = f.querySelector('img');
    if (!im || im.complete) { f.classList.add('is-show'); return; }
    const show = () => f.classList.add('is-show');
    im.addEventListener('load', show); im.addEventListener('error', show);
  });

  /* ---- ★04 のステップが重なる（sticky ＋ CSS変数）----
     「次の面があと何割乗ったか」を --p（0→1）で流すだけ。CSSが scale と brightness で受ける。
     ★親に overflow-x:hidden があると sticky が死ぬので、CSS側は overflow-x:clip にしてある。 */
  const items = $$('#steps > li');
  if (items.length) {
    const upd = () => {
      items.forEach((el, i) => {
        const next = items[i + 1];
        if (!next) { el.style.setProperty('--p', 0); return; }
        const gap = parseFloat(getComputedStyle(el).marginBottom) || 0;
        const span = next.offsetHeight + gap;
        const p = (el.getBoundingClientRect().top + span - next.getBoundingClientRect().top) / span;
        el.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(3));
      });
    };
    upd();
    addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true });
    addEventListener('resize', upd);
  }
})();
