/* 碧原鉄道 障がい者採用サイト */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- ヒーローの入り ---- */
  requestAnimationFrame(function () { document.body.classList.add('is-ready'); });

  /* ---- スクロールで現れる（一度だけ・並びは70msずつ遅らせる） ---- */
  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    // 同じ親の中での並び順で遅延を付ける
    var seen = new Map();
    reveals.forEach(function (el) {
      var p = el.parentNode;
      var n = seen.get(p) || 0;
      seen.set(p, n + 1);
      if (n) el.style.transitionDelay = Math.min(n, 6) * 70 + 'ms';
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- s4：出入りで付け外しする（出っぱなしにしない） ---- */
  var rows = [].slice.call(document.querySelectorAll('.wp__row'));
  if (reduce || !('IntersectionObserver' in window)) {
    rows.forEach(function (el) { el.classList.add('is-in-view', 'is-shown'); });
  } else {
    var ioView = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        e.target.classList.toggle('is-in-view', e.isIntersecting);
        if (e.isIntersecting) e.target.classList.add('is-shown');
      });
    }, { rootMargin: '-15% 0px -15% 0px', threshold: 0 });
    rows.forEach(function (el) { ioView.observe(el); });
  }

  /* ---- s3：貼り付くメディア＋流れる3ステップ＋灯るドット ---- */
  var steps = document.querySelector('.steps');
  if (steps) {
    var items = [].slice.call(steps.querySelectorAll('.step'));
    var dots = [].slice.call(steps.querySelectorAll('.progress__dot'));
    var count = steps.querySelector('.steps__count');

    var setStep = function (n) {
      if (steps.dataset.step === String(n)) return;
      steps.dataset.step = String(n);
      steps.style.setProperty('--step', n);
      if (count) count.textContent = n + ' / 3';
      dots.forEach(function (d, i) {
        d.classList.toggle('is-past', i + 1 <= n);
        d.classList.toggle('is-on', i + 1 === n);
      });
    };
    steps.dataset.step = '';   // 初期値のままだと下の早期returnで素通りする
    setStep(1);

    if ('IntersectionObserver' in window) {
      var ioStep = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) setStep(Number(e.target.dataset.i));
        });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
      items.forEach(function (el) { ioStep.observe(el); });
    }
  }

  /* ---- ヒーローの停止／再生 ---- */
  var hero = document.querySelector('.hero');
  var pp = document.querySelector('.hero__pp');
  if (hero && pp) {
    var tx = pp.querySelector('.hero__pp-tx');
    pp.addEventListener('click', function () {
      var paused = hero.classList.toggle('is-paused');
      pp.setAttribute('aria-pressed', paused ? 'true' : 'false');
      if (tx) tx.textContent = paused ? '再生' : '停止';
    });
  }

  /* ---- s3 のメディアの再生ボタンも同じ動きを切り替える ---- */
  [].slice.call(document.querySelectorAll('.steps__media, .step__fig')).forEach(function (el) {
    el.addEventListener('click', function () { if (pp) pp.click(); });
  });
})();
