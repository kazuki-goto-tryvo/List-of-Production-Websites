/* ながいゆうべ ── クリエイターの夜会 */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var clamp01 = function (v) { return v < 0 ? 0 : (v > 1 ? 1 : v); };

  /* ───────── スクロールで出す（リストは60msずつ遅らせる） ───────── */
  var lastParent = null, stagger = 0;
  Array.prototype.forEach.call(document.querySelectorAll('.reveal'), function (el) {
    if (el.parentNode === lastParent) { stagger++; } else { lastParent = el.parentNode; stagger = 0; }
    if (stagger) el.style.setProperty('--d', String(stagger));
  });

  var targets = document.querySelectorAll('.reveal, .reveal-rule');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.04 });
    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-in'); });
  }

  /* ───────── ヒーローの scrub（ぼけて・膨らんで・消える） ─────────
     ヒーローの高さ×1.4 で 0→1。1画面ぶんのヒーローなら、
     画面から出きるころに 0.7 くらいまで進む勘定になる。 */
  var hero = document.querySelector('.hero');
  function heroTick() {
    if (!hero) return;
    var h = hero.offsetHeight || 1;
    root.style.setProperty('--p', clamp01(window.pageYOffset / (h * 1.4)).toFixed(4));
  }

  /* ───────── フィナーレの scrub（光条→ランプ→人物の順に起きる） ─────────
     30%→45% で光条と回転、45%→50% で人物。順番を潰さない。 */
  var finale = document.querySelector('.finale');
  function finaleTick() {
    if (!finale) return;
    var r = finale.getBoundingClientRect();
    var vh = window.innerHeight || 800;
    var q = clamp01((vh - r.top) / (r.height + vh));
    root.style.setProperty('--q1', clamp01((q - 0.30) / 0.15).toFixed(4));
    root.style.setProperty('--q2', clamp01((q - 0.45) / 0.05).toFixed(4));
  }

  if (reduce) {
    root.style.setProperty('--p', '0');
    root.style.setProperty('--q1', '1');
    root.style.setProperty('--q2', '1');
  } else {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { heroTick(); ticking = false; });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { heroTick(); finaleTick(); }, { passive: true });
    heroTick();

    /* フィナーレは画面に入っているあいだだけ毎フレーム更新する。
       scroll イベントを待たずに値が合うので、要素だけを撮るような使われ方でもずれない。 */
    var running = false;
    function loop() { if (!running) return; finaleTick(); window.requestAnimationFrame(loop); }
    if (finale && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        var vis = es[0].isIntersecting;
        if (vis && !running) { running = true; loop(); }
        else if (!vis) { running = false; finaleTick(); }
      }, { rootMargin: '200px 0px' }).observe(finale);
    } else {
      window.addEventListener('scroll', finaleTick, { passive: true });
    }
    finaleTick();
  }

  /* ───────── 読み込み直後の入り ───────── */
  window.requestAnimationFrame(function () { document.body.classList.add('is-ready'); });
})();
