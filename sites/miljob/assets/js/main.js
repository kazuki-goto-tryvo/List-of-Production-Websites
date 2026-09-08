/* ミルジョブ — 動き。外部ライブラリなし */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wide = matchMedia('(min-width: 1180px)');

  /* ── 読み込み直後の入り ───────────────────────── */
  requestAnimationFrame(function () { document.body.classList.add('is-ready'); });

  /* ── スクロールで現れる ──────────────────────── */
  var revs = document.querySelectorAll('.reveal, .job');
  if (reduce || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revs, function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
    Array.prototype.forEach.call(revs, function (el) { io.observe(el); });
  }

  /* ── 常時ループしている飾りは、画面の中にいるときだけ動かす ── */
  if ('IntersectionObserver' in window) {
    var loopIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('is-run', e.isIntersecting); });
    }, { threshold: 0 });
    Array.prototype.forEach.call(
      document.querySelectorAll('.job, .what, .voice, .pamph'),
      function (el) { loopIO.observe(el); }
    );
  }

  /* ── SPの下端固定バー（7つのお仕事に入ったら出す） ── */
  var jobs = document.getElementById('s_jobs');
  if (jobs && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      document.body.classList.toggle('is-past', es[0].boundingClientRect.top < 0 || es[0].isIntersecting);
    }, { threshold: 0 }).observe(jobs);
  }

  /* ── カルーセルの写真は、帯が見えたらまとめて読む ──────────
     横に並んだ2枚目以降は lazy のままだと画面外扱いのままで、
     矢印を押した瞬間に白いコマが出る。帯が視界に入った時点で eager に上げる。 */
  Array.prototype.forEach.call(document.querySelectorAll('.car'), function (car) {
    function load() {
      Array.prototype.forEach.call(car.querySelectorAll('img[loading="lazy"]'), function (img) {
        img.loading = 'eager';
      });
    }
    if (!('IntersectionObserver' in window)) return load();
    var carIO = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      load();
      carIO.disconnect();
    }, { rootMargin: '200px 0px' });
    carIO.observe(car);
  });

  /* ── カルーセル（scroll-snap ＋ 左右の丸矢印） ── */
  Array.prototype.forEach.call(document.querySelectorAll('.nb'), function (b) {
    b.addEventListener('click', function () {
      var t = document.getElementById(b.dataset.car);
      if (!t) return;
      var first = t.querySelector('.slide');
      var step = first ? first.getBoundingClientRect().width + 6 : 326;
      t.scrollBy({ left: step * Number(b.dataset.dir), behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ── ナビ（PC=アコーディオン ／ 狭い幅=ドロワー） ── */
  var nav = document.getElementById('nav');
  var ham = document.getElementById('ham');
  var veil = document.getElementById('veil');
  var dclose = document.getElementById('dclose');

  function grps() { return document.querySelectorAll('.grp'); }
  function setGrp(g, open) {
    g.classList.toggle('is-open', open);
    var t = g.querySelector('.grp__t');
    if (t) t.setAttribute('aria-expanded', String(open));
  }
  function drawer(open) {
    nav.classList.toggle('is-opened', open);
    document.body.classList.toggle('is-opened', open);
    ham.setAttribute('aria-expanded', String(open));
    veil.hidden = !open;
    if (open) requestAnimationFrame(function () { veil.classList.add('is-on'); });
    else veil.classList.remove('is-on');
  }

  Array.prototype.forEach.call(grps(), function (g) {
    var t = g.querySelector('.grp__t');
    if (t) t.addEventListener('click', function () { setGrp(g, !g.classList.contains('is-open')); });
  });

  ham.addEventListener('click', function () {
    if (wide.matches) {
      // PCは右ナビの中のアコーディオンをまとめて開閉する
      var anyOpen = document.querySelector('.grp.is-open') !== null;
      Array.prototype.forEach.call(grps(), function (g) { setGrp(g, !anyOpen); });
      ham.setAttribute('aria-expanded', String(!anyOpen));
      document.body.classList.toggle('is-opened', !anyOpen);
    } else {
      drawer(!nav.classList.contains('is-opened'));
    }
  });
  if (dclose) dclose.addEventListener('click', function () { drawer(false); });
  veil.addEventListener('click', function () { drawer(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-opened')) drawer(false);
  });
  Array.prototype.forEach.call(nav.querySelectorAll('a'), function (a) {
    a.addEventListener('click', function () { if (!wide.matches) drawer(false); });
  });
  wide.addEventListener('change', function () {
    if (wide.matches) drawer(false);
  });
})();
