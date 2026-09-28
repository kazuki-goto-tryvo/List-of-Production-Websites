/* カーサ・ヴェルデリーナ 水尾が丘 */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ① ヒーローの入り
  requestAnimationFrame(function () { document.body.classList.add('is-ready'); });

  // ② スクロールで現れる（一度出たら出っぱなし）。リストは順にずらす
  [['.news__list', 0.08], ['.living__list', 0.12]].forEach(function (g) {
    var list = document.querySelector(g[0]);
    if (!list) return;
    [].forEach.call(list.children, function (li, i) { li.style.setProperty('--d', (i * g[1]) + 's'); });
  });
  var items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    // clip-path で隠れているのは子（.pic__in）。監視は親の .pic に付けている
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.3, rootMargin: '0px 0px -5% 0px' });
    items.forEach(function (el) { io.observe(el); });
    // 速いスクロールやアンカーで飛び越えた分は IO が拾わないので、通過済みも出す
    var pending = [].slice.call(items), sweeping = false;
    var sweep = function () {
      sweeping = false;
      var lim = innerHeight * 0.95;
      pending = pending.filter(function (el) {
        if (el.getBoundingClientRect().top > lim) return true;
        el.classList.add('is-in'); io.unobserve(el); return false;
      });
      if (!pending.length) removeEventListener('scroll', onSweep);
    };
    var onSweep = function () { if (!sweeping) { sweeping = true; requestAnimationFrame(sweep); } };
    addEventListener('scroll', onSweep, { passive: true });
  }

  // ページ内リンクだけ滑らかに（CSS の scroll-behavior だと scrollTo まで全部滑る）
  if (!reduce) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]:not(.skip)');
      var t = a && a.getAttribute('href').length > 1 && document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      if (t.id === 'top') scrollTo({ top: 0, behavior: 'smooth' });   // ヘッダーは sticky なので上端へ直接
      else t.scrollIntoView({ behavior: 'smooth' });
      history.pushState(null, '', a.getAttribute('href'));
    });
  }

  // パララックス（参照元の Rellax 相当）
  var par = document.querySelectorAll('[data-speed]');
  if (!reduce && par.length) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var mid = innerHeight / 2;
      par.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var c = r.top + r.height / 2 - (parseFloat(el.style.getPropertyValue('--py')) || 0);
        // 画面の外では動かしきった位置で止める（遠くの写真が隣の要素に被らないように）
        var d = Math.max(-mid, Math.min(mid, c - mid));
        el.style.setProperty('--py', (d * Number(el.dataset.speed) * -0.2).toFixed(1) + 'px');
      });
    };
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update);
    update();
  }

  // SP メニュー
  var btn = document.querySelector('.menubtn'), panel = document.getElementById('spmenu');
  function setMenu(open) {
    btn.setAttribute('aria-expanded', open);
    panel.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', !open);
    panel.inert = !open;
  }
  btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
  panel.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // SP 下端CTAバー：KV を抜けたら出す
  var bar = document.querySelector('.spbar'), kv = document.querySelector('.hero__kv');
  if (bar && kv && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      bar.classList.toggle('is-show', !es[0].isIntersecting);
    }, { rootMargin: '-120px 0px 0px 0px' }).observe(kv);
  }
})();
