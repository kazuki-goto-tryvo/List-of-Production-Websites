/* 凪ライニング工業 — ライブラリなし。GSAP も Lenis も使わない。 */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- ヒーローの入り ---- */
  function ready() { document.body.classList.add('is-ready'); }
  if (document.readyState === 'complete') ready();
  else addEventListener('load', ready);
  setTimeout(ready, 1200);                      // 画像が遅くても止めない

  /* ---- スクロールで現れる（一度出たら出っぱなし） ---- */
  var rv = [].slice.call(document.querySelectorAll('.rv'));
  rv.forEach(function (el) {
    var sibs = [].slice.call(el.parentNode.children).filter(function (n) {
      return n.classList && n.classList.contains('rv');
    });
    var i = sibs.indexOf(el);
    if (i > 0) el.style.transitionDelay = Math.min(i, 6) * 0.08 + 's';
  });
  // ★ IntersectionObserver だけに頼らない。速いスクロール（自動キャプチャ）だと
  //   コールバックが配られないまま通り過ぎて、出ないまま残る要素が出る。
  //   scroll のたびに素直に位置を見る（一度出たら二度と見ない）。
  var pending = reduce ? [] : rv.slice();
  if (reduce) rv.forEach(function (el) { el.classList.add('is-in'); });
  function reveals() {
    if (!pending.length) return;
    var line = innerHeight * 0.88, keep = [];
    for (var i = 0; i < pending.length; i++) {
      if (pending[i].getBoundingClientRect().top < line) pending[i].classList.add('is-in');
      else keep.push(pending[i]);
    }
    pending = keep;
  }
  addEventListener('scroll', reveals, { passive: true });
  addEventListener('resize', reveals, { passive: true });
  addEventListener('load', reveals);
  reveals();

  /* ---- scrub（背景の縦ずれ・円弧の微回転）。--p に 0..1 を書くだけ ---- */
  // ★ 対象は5つだけ。IntersectionObserver で絞ると配信が遅れて --p が更新されない
  //   （速いスクロールで実測）。毎フレーム素直に測る。
  var px = [].slice.call(document.querySelectorAll('[data-px]'));
  var tick = false;
  function paint() {
    tick = false;
    var vh = innerHeight;
    for (var i = 0; i < px.length; i++) {
      var r = px[i].getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) continue;          // 遠いものは触らない
      var p = (vh - r.top) / (vh + r.height);
      px[i].style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(4));
    }
  }
  if (!reduce) {
    addEventListener('scroll', function () {
      if (!tick) { tick = true; requestAnimationFrame(paint); }
    }, { passive: true });
    addEventListener('resize', paint, { passive: true });
    paint();
  }

  /* ---- 流れる製品カードは、画面に入るまで止めておく ---- */
  var pdr = document.getElementById('pdr');
  if (pdr && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { pdr.classList.toggle('is-run', e.isIntersecting); });
    }, { rootMargin: '10% 0px' }).observe(pdr);
  } else if (pdr) {
    pdr.classList.add('is-run');
  }

  /* ---- ヘッダー：ヒーローの上は透明、抜けたら白 ---- */
  var hd = document.getElementById('hd');
  var hero = document.getElementById('top');
  function head() {
    var h = hero ? hero.offsetHeight - 80 : 400;
    hd.classList.toggle('is-solid', scrollY > h);
  }
  addEventListener('scroll', head, { passive: true });
  head();

  /* ---- PCナビのドロップダウン（hover と focus の両方で開く） ---- */
  [].slice.call(document.querySelectorAll('.gnav__w')).forEach(function (w) {
    var a = w.querySelector('a');
    var set = function (v) { a.setAttribute('aria-expanded', String(v)); };
    w.addEventListener('mouseenter', function () { set(true); });
    w.addEventListener('mouseleave', function () { set(false); });
    w.addEventListener('focusin', function () { set(true); });
    w.addEventListener('focusout', function () {
      if (!w.contains(document.activeElement)) set(false);
    });
  });

  /* ---- SPドロワー ---- */
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  function openDrawer() {
    drawer.hidden = false;
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'メニューを閉じる');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'メニューを開く');
    document.body.style.overflow = '';
    if (reduce) { drawer.hidden = true; return; }
    drawer.classList.add('is-closing');
    setTimeout(function () { drawer.classList.remove('is-closing'); drawer.hidden = true; }, 450);
  }
  if (burger && drawer) {
    burger.addEventListener('click', function () {
      if (drawer.hidden) openDrawer(); else closeDrawer();
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' || e.target === drawer) closeDrawer();
    });
    addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !drawer.hidden) closeDrawer();
    });
  }

  /* ---- ページ内リンクだけ滑らかに動かす（CSSの scroll-behavior は使わない） ---- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute('href');
    if (id === '#' || id.length < 2) return;
    var t = document.getElementById(id.slice(1));
    if (!t) return;
    e.preventDefault();
    var y = t.getBoundingClientRect().top + scrollY - (innerWidth > 900 ? 92 : 72);
    scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* ---- 読みもののカルーセル（Splideの代わり。素のスクロール＋進捗バー） ---- */
  var track = document.getElementById('jntrack');
  var bar = document.getElementById('jnbar');
  var prev = document.getElementById('jnprev');
  var next = document.getElementById('jnnext');
  if (track && bar) {
    var step = function () {
      var c = track.querySelector('.jcard');
      return c ? c.offsetWidth + 30 : 390;
    };
    var draw = function () {
      var max = track.scrollWidth - track.clientWidth;
      var seen = max > 0 ? (track.scrollLeft + track.clientWidth) / track.scrollWidth : 1;
      bar.style.width = Math.max(0.1, Math.min(1, seen)) * 100 + '%';
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max - 2;
    };
    track.addEventListener('scroll', function () { requestAnimationFrame(draw); }, { passive: true });
    addEventListener('resize', draw, { passive: true });
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
    draw();
  }
})();
