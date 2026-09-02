/* クミタテ — GSAP + ScrollTrigger（同梱。CDNからは読まない）
   ★参照元 aishift.com は GSAP を ESモジュールでバンドルして使っている。
     window.gsap が無いので気づきにくいが、scrub も出入りの制御もそちら側にある。 */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---- ハンバーガー（GSAP不要） ---- */
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

  /* ---- 写真は読み込めた瞬間にフェードイン ---- */
  $$('.fade').forEach(f => {
    const im = f.querySelector('img');
    if (!im || im.complete) { f.classList.add('is-show'); return; }
    const show = () => f.classList.add('is-show');
    im.addEventListener('load', show); im.addEventListener('error', show);
  });

  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  mm.add({
    move: '(prefers-reduced-motion: no-preference)',
    still: '(prefers-reduced-motion: reduce)',
  }, (ctx) => {
    /* ★ reduce のときは何も作らない。CSSの @media が初期状態を出す */
    if (ctx.conditions.still) {
      $$('[data-char],.up,.eff__d').forEach(e => e.classList.add('is-show'));
      $$('[data-bubble]').forEach(e => e.classList.add('is-on'));
      $$('.steps__l li,.steps__img').forEach((e, i) => e.classList.toggle('is-show', i % 4 === 0));
      $$('[data-count]').forEach(e => { e.textContent = e.dataset.count; });
      return;
    }

    /* ---- ① セクションに入ると出て、抜けると引っ込む（参照元と同じ）----
       一度出したら終わり、にしない。onLeave / onLeaveBack で必ず外す。 */
    $$('[data-char]').forEach(sec => {
      const bubbles = $$('[data-bubble]', sec);
      let tl = null;
      const startLoop = () => {                 // ★吹き出しは1.2秒ごとに1つずつ入れ替わる
        if (!bubbles.length) return;
        tl && tl.kill();
        tl = gsap.timeline({ repeat: -1 });
        bubbles.forEach((b, i) => tl.call(() => {
          bubbles.forEach(x => x.classList.toggle('is-on', x === b));
        }, [], i * 1.2));
        tl.to({}, { duration: 1.2 });
      };
      const stopLoop = () => { tl && tl.kill(); tl = null; bubbles.forEach(b => b.classList.remove('is-on')); };
      const on = () => { sec.classList.add('is-show'); startLoop(); };
      const off = () => { sec.classList.remove('is-show'); stopLoop(); };
      ScrollTrigger.create({
        trigger: sec, start: 'top 80%', end: 'bottom 20%',
        onEnter: on, onEnterBack: on, onLeave: off, onLeaveBack: off,
      });
    });

    /* ---- ② テキストの出現（こちらは一度きりでよい） ---- */
    $$('.up').forEach(el => ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: () => el.classList.add('is-show'),
    }));

    /* ---- ③ ステップ：スクロール量に連動して、左の絵と右の行が1つずつ切り替わる ----
       ★これが scrub。発火して終わりではなく、戻せば戻る。 */
    const art = $('#steps');
    if (art) {
      const rows = $$('.steps__l li', art), imgs = $$('.steps__img', art);
      const pick = (i) => {
        rows.forEach((r, k) => r.classList.toggle('is-show', k === i));
        imgs.forEach((m, k) => m.classList.toggle('is-show', k === i));
      };
      ScrollTrigger.create({
        // ★区間はセクション全体で取る。art だけだと400pxしか無く、3・4枚目が一瞬で終わる
        trigger: art.closest('.steps'), start: 'top 55%', end: 'bottom 65%', scrub: true,
        onUpdate: (self) => pick(Math.min(rows.length - 1, Math.floor(self.progress * rows.length))),
      });
    }

    /* ---- ④ 数字のカウントアップ（参照元 introduction-item-count-num） ---- */
    $$('[data-count]').forEach(el => {
      const to = parseFloat(el.dataset.count);
      const dec = (el.dataset.count.split('.')[1] || '').length;
      const o = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: () => gsap.to(o, {
          v: to, duration: 1.1, ease: 'power2.out',
          onUpdate: () => { el.textContent = o.v.toFixed(dec); },
        }),
      });
    });

    /* ---- ⑤ ドーナツグラフ ---- */
    const ring = $('.eff__ring');
    if (ring) ScrollTrigger.create({
      trigger: ring, start: 'top 88%', once: true,
      onEnter: () => $('.eff__d').classList.add('is-show'),
    });

    return () => {};      // ブレークポイントを跨いだら matchMedia が片付ける
  });

  /* ★画像が遅延読み込みなので、初期化時の高さは当てにならない。
     読み込みが終わったら位置を計算し直す。これが無いと scrub が最初から progress=1 になる */
  addEventListener('load', () => ScrollTrigger.refresh());
  $$('img').forEach(im => im.complete || im.addEventListener('load', () => ScrollTrigger.refresh()));
})();
