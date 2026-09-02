/* NAGISA LINKS — ライブラリなし。参照元は GSAP を読むが ScrollTrigger は無い（scrub / pin ゼロ） */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---- MENU（円形に開く。参照元 #iris-clip-nav-path） ---- */
  const btn = $('#mbtn'), menu = $('#menu');
  menu.hidden = true;
  btn.setAttribute('aria-label', 'メニューを開く');
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    btn.setAttribute('aria-label', open ? 'メニューを開く' : 'メニューを閉じる');
    if (open) { menu.classList.remove('open'); setTimeout(() => { menu.hidden = true; }, 600); }
    else { menu.hidden = false; requestAnimationFrame(() => menu.classList.add('open')); }
  });
  $$('a', menu).forEach(a => a.addEventListener('click', () => {
    btn.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open'); setTimeout(() => { menu.hidden = true; }, 600);
  }));

  /* ---- 写真の帯を途切れさせない：同じ並びをもう1組足して -50% で回す ---- */
  $$('[data-strip]').forEach(ul => {
    const html = ul.innerHTML;
    ul.insertAdjacentHTML('beforeend', html);
    $$('li', ul).slice(ul.children.length / 2).forEach(li => li.setAttribute('aria-hidden', 'true'));
  });
  const mq = $('.mq__t');
  if (mq) mq.insertAdjacentHTML('beforeend', mq.innerHTML);

  /* ---- 出現と写真のフェード ---- */
  const io = new IntersectionObserver((es) => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: .04 });
  $$('.up').forEach(el => io.observe(el));
  $$('.fade').forEach(f => {
    const im = f.querySelector('img');
    if (!im || im.complete) { f.classList.add('on'); return; }
    const show = () => f.classList.add('on');
    im.addEventListener('load', show); im.addEventListener('error', show);
  });

  /* ---- 上部の白いナビはKVを抜けてから出す ---- */
  const hd = $('#hd'), kv = $('.kv');
  const onScroll = () => hd.classList.toggle('on', window.scrollY > kv.offsetHeight - 120);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });
})();
