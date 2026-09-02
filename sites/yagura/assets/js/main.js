/* ヤグラ設計機構 — ライブラリなし。参照元も @keyframes だけで組まれている */
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

  /* ---- 円形英文（1文字ずつ回転配置。textPath は使わない） ---- */
  $$('[data-ring]').forEach(el => {
    const txt = el.dataset.ring, n = txt.length;
    const r = el.offsetWidth / 2 - (el.classList.contains('ring--b') ? 12 : 18);
    el.innerHTML = [...txt].map((ch, i) => {
      const deg = i * 360 / n;
      return `<span style="rotate:${deg}deg;translate:${-0.5}em 0;transform:rotate(${deg}deg) translate(0,${-r}px)">${ch === ' ' ? '&nbsp;' : ch}</span>`;
    }).join('');
    // transform と rotate を混ぜないよう、transform 1本にまとめ直す
    $$('span', el).forEach((s, i) => {
      s.style.rotate = ''; s.style.translate = '';
      s.style.transform = `rotate(${i * 360 / n}deg) translate(0,${-r}px)`;
    });
  });

  /* ---- 散らばる文字（参照元 move-left / move-left2） ---- */
  $$('[data-scatter]').forEach(el => {
    const txt = el.dataset.scatter;
    el.innerHTML = [...txt].map((ch, i) => {
      const f = Math.abs(Math.sin((i + 3) * 12.9898) * 43758.5453 % 1);
      const r = (f - .5) * 150, y = (f - .5) * 120, x = (f - .5) * 30;
      return `<i style="--i:${i};--x:${x.toFixed(1)}px;--y:${y.toFixed(1)}px;--r:${r.toFixed(1)}deg">${ch}</i>`;
    }).join('');
  });

  /* ---- 09 の線画（波線・同心円・放射） ---- */
  const wave = $('.art--wave g');
  if (wave) wave.innerHTML = Array.from({ length: 12 }, (_, i) => {
    let d = `M 0 ${8 + i * 9}`;
    for (let k = 0; k < 6; k++) d += ` q ${320 / 12} -6 ${320 / 6} 0 q ${320 / 12} 6 ${320 / 6} 0`;
    return `<path d="${d}"/>`;
  }).join('');
  const ring = $('.art--ring g');
  if (ring) ring.innerHTML = Array.from({ length: 14 },
    (_, i) => `<circle cx="130" cy="130" r="${10 + i * 8.5}"/>`).join('');
  const ray = $('.art--ray g');
  if (ray) ray.innerHTML = Array.from({ length: 23 }, (_, i) => {
    const a = Math.PI / 180 * (30 + 85 * i / 22);
    return `<line x1="${(20 + Math.cos(a) * 20).toFixed(1)}" y1="${(20 + Math.sin(a) * 20).toFixed(1)}"`
      + ` x2="${(20 + Math.cos(a) * 195).toFixed(1)}" y2="${(20 + Math.sin(a) * 195).toFixed(1)}"/>`;
  }).join('');
  const gray = $('#rayg');
  if (gray) gray.innerHTML = Array.from({ length: 27 }, (_, i) => {
    const a = Math.PI / 180 * (200 + 140 * i / 26);
    return `<line x1="${(300 + Math.cos(a) * 60).toFixed(1)}" y1="${(200 + Math.sin(a) * 60).toFixed(1)}"`
      + ` x2="${(300 + Math.cos(a) * 210).toFixed(1)}" y2="${(200 + Math.sin(a) * 210).toFixed(1)}"/>`;
  }).join('');

  /* ---- 出現（参照元 slideUpPC / slideLeftPC / slideRightPC） ---- */
  const io = new IntersectionObserver((es) => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -12% 0px', threshold: .06 });
  $$('.up,.lf,.rt').forEach(el => io.observe(el));
  // ★ clip-path や overflow の外にいる文字は親を見る（発火しない事故を避ける）
  const scatIO = new IntersectionObserver((es) => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('on'); scatIO.unobserve(e.target); }
  }), { threshold: .2 });
  $$('.scat').forEach(el => scatIO.observe(el));

  /* ---- 右端のドットナビ＋ヘッダーの色（参照元 top-pagenavigation__dot） ---- */
  const secs = $$('[data-label]');
  const pg = $('#pgnav');
  pg.innerHTML = secs.map((s, i) =>
    `<li><button type="button" data-i="${i}" aria-label="${s.dataset.label}へ"></button></li>`).join('');
  const lis = $$('li', pg);
  pg.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    secs[+b.dataset.i].scrollIntoView({ behavior: still ? 'auto' : 'smooth' });
  });
  const navIO = new IntersectionObserver((es) => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      const i = secs.indexOf(e.target);
      lis.forEach((l, k) => l.classList.toggle('cur', k === i));
      document.documentElement.style.setProperty('--nav',
        e.target.dataset.nav === 'dark' ? '#005663' : '#ffffff');
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  secs.forEach(s => navIO.observe(s));

  /* ---- Projects の before / after ワイプ ---- */
  $$('[data-ba]').forEach(fig => {
    const range = $('.ba__range', fig);
    const set = (v) => fig.style.setProperty('--cut', (100 - v) + '%');
    set(range.value);
    range.addEventListener('input', () => { auto = false; set(range.value); });
    // 触られるまでは、ゆっくり往復して「切り替わるもの」だと分かるようにしておく
    let auto = !still, t = 0;
    if (auto) {
      const tick = () => {
        if (!auto) return;
        t += 0.006;
        const v = 50 + Math.sin(t) * 34;
        range.value = v; set(v);
        requestAnimationFrame(tick);
      };
      const vis = new IntersectionObserver((es) => es.forEach(e => {
        if (e.isIntersecting && auto) requestAnimationFrame(tick);
      }), { threshold: .3 });
      vis.observe(fig);
    }
  });
})();
