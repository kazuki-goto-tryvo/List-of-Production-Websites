(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isSP = function () { return matchMedia('(max-width: 900px)').matches; };

  // 読み込み完了でヒーローを出す
  requestAnimationFrame(function () { document.body.classList.add('is-ready'); });
  var opening = document.querySelector('.opening');
  document.querySelectorAll('.hero__layer, .hero__copy, .footer-illust').forEach(function (el) {
    el.addEventListener('animationend', function () { el.classList.add('is-done'); });
  });
  if (opening) opening.addEventListener('animationend', function () { opening.style.display = 'none'; });

  // SP メニュー
  var toggle = document.querySelector('.hd__toggle');
  var menu = document.getElementById('spmenu');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.vh').textContent = open ? 'メニューを閉じる' : 'メニューを開く';
    menu.hidden = !open;
    menu.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.footer-illust').forEach(function (el) { el.classList.add('is-in'); });
    document.querySelectorAll('.bn').forEach(function (el) { el.classList.add('is-bg'); });
    return;
  }

  // フッターのイラスト：一度出たら出っぱなし
  var ioOnce = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); ioOnce.unobserve(e.target); }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.footer-illust').forEach(function (el) { ioOnce.observe(el); });

  // サービスのバナー：入ったら .is-bg、出たら外す
  var ioBg = new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.target.classList.toggle('is-bg', e.isIntersecting); });
  }, { rootMargin: '-20% 0px' });
  document.querySelectorAll('.bn').forEach(function (el) { ioBg.observe(el); });

  // マーキーは画面外で止める
  var ft = document.querySelector('.ft');
  var ioMq = new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.target.classList.toggle('is-paused', !e.isIntersecting); });
  });
  ioMq.observe(ft);

  // カルーセル（PCのみ。3秒ごとに1枚、末尾はクローンで先頭へつなぐ）
  document.querySelectorAll('[data-car]').forEach(function (car) {
    var track = car.querySelector('.car__track');
    var items = Array.prototype.slice.call(track.children);
    var n = items.length;
    // 前後に1周ぶんのクローン
    items.forEach(function (it) {
      var a = it.cloneNode(true); a.classList.add('is-clone'); a.setAttribute('aria-hidden', 'true');
      a.querySelectorAll('a').forEach(function (x) { x.tabIndex = -1; });
      track.appendChild(a);
    });
    items.slice().reverse().forEach(function (it) {
      var b = it.cloneNode(true); b.classList.add('is-clone'); b.setAttribute('aria-hidden', 'true');
      b.querySelectorAll('a').forEach(function (x) { x.tabIndex = -1; });
      track.insertBefore(b, track.firstChild);
    });
    var cur = 0, timer = null, hover = false, visible = false;
    function pos(anim) {
      track.classList.toggle('is-anim', !!anim);
      // 1枚目の左端を x=130 に置く（PCフレームと同じ）
      track.style.transform = 'translateX(calc(13rem - ' + (n + cur) + ' * 37.8rem))';
    }
    track.addEventListener('transitionend', function (e) {
      if (e.target !== track) return;
      if (cur >= n) { cur -= n; pos(false); }
    });
    function tick() {
      if (hover || !visible || isSP() || document.hidden) return;
      cur++; pos(true);
    }
    pos(false);
    if (!reduce) timer = setInterval(tick, 3000);
    car.addEventListener('mouseenter', function () { hover = true; });
    car.addEventListener('mouseleave', function () { hover = false; });
    car.addEventListener('focusin', function () { hover = true; });
    car.addEventListener('focusout', function () { hover = false; });
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(car);
  });
})();
