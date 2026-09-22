/* akebiraki — 株式会社アケビラキ */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var body = document.body;

  // 読み込みの幕を外し、ヘッダーを降ろす
  function ready() { body.classList.add('is-ready'); }
  if (document.readyState === 'complete') ready();
  else addEventListener('load', ready);
  setTimeout(ready, 2500); // 画像が遅くても幕を残さない

  // ヒーロー写真のクロスフェード（5.5秒ごと）
  var phs = document.querySelectorAll('.hero__ph');
  var dots = document.querySelectorAll('.hero__dots i');
  var cur = 0;
  if (!reduce && phs.length > 1) {
    setInterval(function () {
      phs[cur].classList.remove('is-show'); dots[cur].classList.remove('is-on');
      cur = (cur + 1) % phs.length;
      phs[cur].classList.add('is-show'); dots[cur].classList.add('is-on');
    }, 5500);
  }

  // 本文を1行ずつ（行ごとに120msずらす）
  document.querySelectorAll('.fade-lines').forEach(function (p) {
    p.querySelectorAll('.line').forEach(function (l, i) { l.style.setProperty('--i', i); });
  });

  // スクロールで出す（一度きり）
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  // マーキーは画面に入っているあいだだけ流す
  var mqs = document.querySelectorAll('.mq');
  if (!reduce && 'IntersectionObserver' in window) {
    var mio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('is-run', e.isIntersecting); });
    });
    mqs.forEach(function (el) { mio.observe(el); });
  }

  // 締めの写真スライダー（4秒ごとに1枚送る。末尾で先頭へ瞬時に戻す）
  var slider = document.querySelector('.slider');
  if (slider && !reduce) {
    var track = slider.querySelector('.slider__track');
    var n = track.children.length / 2, idx = 0, visible = false;
    function step() {
      var li = track.children[0];
      return li.offsetWidth + parseFloat(getComputedStyle(li).marginRight);
    }
    function go(i, anim) {
      track.style.transition = anim ? '' : 'none';
      track.style.transform = 'translateX(' + (-step() * i) + 'px)';
    }
    track.addEventListener('transitionend', function () {
      if (idx >= n) { idx = 0; go(0, false); track.offsetWidth; track.style.transition = ''; }
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(slider);
    } else visible = true;
    setInterval(function () {
      if (!visible || document.hidden) return;
      idx++; go(idx, true);
    }, 4000);
    addEventListener('resize', function () { go(idx, false); });
  }

  // SP のハンバーガー
  var btn = document.querySelector('.hd__menu');
  var nav = document.getElementById('gnav');
  function setMenu(open) {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    nav.classList.toggle('is-open', open);
  }
  btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // ページ内リンクは滑らかに（CSSの scroll-behavior は機械のスクロールまで遅くするので使わない）
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var t = id ? document.getElementById(id) : null;
    if (!t) return;
    e.preventDefault();
    if (id === 'top') scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });

  // ページトップ
  document.querySelector('.pagetop').addEventListener('click', function () {
    scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
})();
