/* 杣戸のアウトドア部 — 動き一式（ライブラリなし） */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 1. 読み込み直後の入り（左野原・右ナビ・ヒーロー） ---- */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { document.body.classList.add('is-ready'); });
  });

  /* ---- 2. スクロールで出す（.reveal / .pop） ---- */
  // セクションごとに並び順を渡して 80ms ずつ遅らせる
  document.querySelectorAll('.sec').forEach(function (sec) {
    sec.querySelectorAll('.reveal').forEach(function (el, i) { el.style.setProperty('--d', i); });
  });

  var targets = document.querySelectorAll('.reveal, .pop');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        // 背の高い要素は 18% に届かないことがあるので、実際に見えている高さでも判定する
        var tall = e.intersectionRect.height >= window.innerHeight * 0.35;
        if (e.intersectionRatio >= 0.18 || (e.isIntersecting && tall)) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: [0, 0.18] });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---- 3. ヒーローのカルーセル（3枚クロスフェード / 5秒） ---- */
  var slides = [].slice.call(document.querySelectorAll('.kv__slide'));
  var pauseBtn = document.querySelector('.kv__pause');
  var kvTimer = null, kvIdx = 0;

  function kvStart() {
    if (reduce || slides.length < 2 || kvTimer) return;
    kvTimer = setInterval(function () {
      slides[kvIdx].classList.remove('is-on');
      kvIdx = (kvIdx + 1) % slides.length;
      slides[kvIdx].classList.add('is-on');
    }, 5000);
  }
  function kvStop() { clearInterval(kvTimer); kvTimer = null; }
  kvStart();

  if (pauseBtn) {
    if (reduce) {
      pauseBtn.hidden = true;
    } else {
      pauseBtn.addEventListener('click', function () {
        var on = pauseBtn.getAttribute('aria-pressed') === 'true';
        pauseBtn.setAttribute('aria-pressed', on ? 'false' : 'true');
        document.body.classList.toggle('is-paused', !on);
        pauseBtn.querySelector('.u-vh').textContent = on ? '動きを止める' : '動きを再生する';
        if (on) { kvStart(); } else { kvStop(); }
      });
    }
  }

  /* ---- 4. ページ内リンクだけ滑らせる ----
     CSSの scroll-behavior:smooth は使わない。あれを入れると検証・録画の
     段階スクロール（毎フレームの scrollTo）が滑り直して、どこにも着かなくなる。 */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || reduce) return;
    var id = a.getAttribute('href');
    if (id === '#' || id.length < 2) return;
    var t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---- 5. SPのハンバーガー ---- */
  var burger = document.querySelector('.burger');
  var spnav = document.getElementById('spnav');
  function navSet(open) {
    if (!burger || !spnav) return;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    spnav.classList.toggle('is-open', open);
    document.body.classList.toggle('is-locked', open);
    burger.querySelector('.u-vh').textContent = open ? 'メニューを閉じる' : 'メニューを開く';
  }
  if (burger && spnav) {
    burger.addEventListener('click', function () {
      navSet(burger.getAttribute('aria-expanded') !== 'true');
    });
    spnav.addEventListener('click', function (e) {
      if (e.target.closest('a')) navSet(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') navSet(false);
    });
  }
})();
