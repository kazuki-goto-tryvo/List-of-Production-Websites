/* 株式会社ソエノワ 採用サイト */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- スクロールで現れる（リストは70msずつ遅らせる） ---- */
  var targets = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (!('IntersectionObserver' in window) || reduce) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    targets.forEach(function (el) {
      var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) {
        return c.classList && c.classList.contains('reveal');
      });
      if (sibs.length > 1) el.style.transitionDelay = (sibs.indexOf(el) * 70) + 'ms';
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---- ヘッダーは下スクロールで隠れ、上スクロールで戻る ---- */
  var hd = document.querySelector('.hd');
  var last = window.scrollY, ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      if (y > 140 && y > last) hd.classList.add('is-hidden');
      else hd.classList.remove('is-hidden');
      last = y; ticking = false;
    });
  }, { passive: true });

  /* ---- ヒーローのタイルが1枚ずつ裏返る ---- */
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.tile'));
  if (tiles.length && !reduce) {
    var i = 0;
    setTimeout(function () { setInterval(flip, 3200); }, 5000);
    function flip() {
      if (document.hidden) return;
      tiles[i % tiles.length].classList.toggle('is-flipped');
      i++;
    }
  }

  /* ---- インタビューの背面写真は画面に入っているあいだだけ回す ---- */
  var iv = document.querySelector('.iv');
  if (iv && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { iv.classList.toggle('is-view', e.isIntersecting); });
    }, { threshold: 0.05 }).observe(iv);
  } else if (iv) {
    iv.classList.add('is-view');
  }

  /* ---- ハンバーガーと全画面メニュー ---- */
  var burger = document.querySelector('.burger');
  var ov = document.getElementById('ovmenu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    ov.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (burger && ov) {
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    ov.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !ov.hidden) setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && !ov.hidden) setMenu(false);
    });
  }
})();
