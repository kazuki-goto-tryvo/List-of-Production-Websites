/* ウノハラ醸造 — ライブラリなし */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const still = matchMedia('(prefers-reduced-motion:reduce)').matches;

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

  /* ---- 香り・苦味・ボディの目盛り ---- */
  $$('[data-n]').forEach(el => {
    const n = +el.dataset.n;
    el.innerHTML = Array.from({ length: 5 },
      (_, i) => `<b class="dot${i < n ? ' on' : ''}"></b>`).join('');
  });

  /* ---- カートに入れる（参照元 js_waveBg_1/2 ＋ 文字の入れ替え） ---- */
  const cartn = $('#cartn');
  let count = 0;
  $$('[data-add]').forEach(btn => {
    btn.innerHTML = `<span class="bk__wave"></span><span class="bk__wave"></span>`
      + `<span class="bk__t">${btn.textContent.trim()}</span>`;
    btn.addEventListener('click', () => {
      if (btn.classList.contains('is-adding')) return;
      const done = () => {
        count++; cartn.textContent = String(count);
        $$('.ft__cart b').forEach(b => b.textContent = String(count));
        cartn.classList.remove('pop'); void cartn.offsetWidth; cartn.classList.add('pop');
        btn.classList.remove('is-adding');
        $('.bk__t', btn).textContent = 'カートに入れる';
      };
      if (still) { done(); return; }
      btn.classList.add('is-adding');
      setTimeout(() => { $('.bk__t', btn).textContent = 'カートに入れました'; }, 380);
      setTimeout(done, 1500);
    });
  });

  /* ---- 写真は「読み込めた瞬間」に0.2秒でフェードイン（参照元 .js_img_body と同じ）----
     スクロール発火にすると、画面外の写真が一生出てこない状態を作ってしまう */
  $$('.fade').forEach(f => {
    const im = f.querySelector('img');
    if (!im) { f.classList.add('on'); return; }
    if (im.complete) { f.classList.add('on'); return; }
    const show = () => f.classList.add('on');
    im.addEventListener('load', show); im.addEventListener('error', show);
  });

  /* ---- テキストの出現だけスクロールで ---- */
  const io = new IntersectionObserver((es) => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: .04 });
  $$('.up').forEach(el => io.observe(el));

  /* ---- ヘッダー：下スクロールで隠れ、上スクロールで戻る（参照元 c_stickygrid_head） ---- */
  const hd = $('#hd');
  const light = ['.hero', '.mt'];                 // 白文字にする面
  let last = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    hd.classList.toggle('is-hide', y > 160 && y > last);
    last = y;
    const over = light.some(sel => {
      const el = $(sel); if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.top <= 26 && r.bottom >= 26;
    });
    hd.classList.toggle('is-dark', !over);
  };
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });
})();
