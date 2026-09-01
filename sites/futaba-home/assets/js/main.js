/* ふたばホーム（架空） — 依存ライブラリなし */
(() => {
  'use strict';
  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 小鳥とクローバーをゆっくり漂わせる ---------- */
  if (!reduce()) {
    document.querySelectorAll('.deco').forEach((el, i) => {
      el.style.animation = `bob ${6 + (i % 4) * 1.2}s ease-in-out ${-i * 0.8}s infinite`;
    });
  }

  /* ---------- スクロール表示 ---------- */
  if ('IntersectionObserver' in window) {
    const t = document.querySelectorAll(
      '.lead, .about__body, .about .btn, .about__talk, .works__head, .cards li, ' +
      '.reform__ph, .reform__ttl, .reform__copy p, .reform__copy .btn, ' +
      '.frames li, .staff__body .sec-ttl, .staff__body p, .staff__body .btn, ' +
      '.partners__ph, .partners__ttl, .partners__copy p, .partners__act, ' +
      '.news__head, .news__list li, .fcard__brand, .offices li, .fnav div'
    );
    t.forEach((el) => { if (!el.closest('.hero')) el.classList.add('reveal'); });
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (!e.isIntersecting) return; e.target.classList.add('is-in'); io.unobserve(e.target); });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
    t.forEach((el, i) => { el.style.transitionDelay = Math.min((i % 4) * 80, 240) + 'ms'; io.observe(el); });
  }

  /* ---------- 施工事例のカルーセルを横スクロールしやすく ---------- */
  const cards = document.querySelector('.cards');
  if (cards) {
    let down = false, sx = 0, sl = 0;
    cards.addEventListener('pointerdown', (e) => { down = true; sx = e.clientX; sl = cards.scrollLeft; cards.setPointerCapture(e.pointerId); });
    cards.addEventListener('pointermove', (e) => { if (down) cards.scrollLeft = sl - (e.clientX - sx); });
    ['pointerup', 'pointercancel'].forEach((ev) => cards.addEventListener(ev, () => { down = false; }));
  }
})();

/* ---------- 横スクロールの帯にドットを付ける（SPフレームどおり） ----------
   実際に溢れている帯にだけ出すので、PCでは何も足さない。            */
(function () {
  'use strict';
  var RAILS = document.querySelectorAll('[data-rail]');
  if (!RAILS.length) return;

  function build(list) {
    if (list.__dots) return;
    var d = document.createElement('div');
    d.className = 'dots';
    d.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < list.children.length; i++) d.appendChild(document.createElement('i'));
    (list.parentElement || list).insertBefore(d, list.nextSibling);
    list.__dots = d;
  }

  function sync(list) {
    var d = list.__dots;
    if (!d) return;
    if (list.scrollWidth - list.clientWidth < 8) { d.style.display = 'none'; return; }
    d.style.display = '';
    var mid = list.scrollLeft + list.clientWidth / 2, best = 0, bd = Infinity;
    for (var i = 0; i < list.children.length; i++) {
      var c = list.children[i], dist = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
      if (dist < bd) { bd = dist; best = i; }
    }
    for (var j = 0; j < d.children.length; j++) d.children[j].classList.toggle('is-on', j === best);
  }

  Array.prototype.forEach.call(RAILS, function (list) {
    build(list); sync(list);
    list.addEventListener('scroll', function () { sync(list); }, { passive: true });
  });
  window.addEventListener('resize', function () {
    Array.prototype.forEach.call(RAILS, sync);
  }, { passive: true });
})();
