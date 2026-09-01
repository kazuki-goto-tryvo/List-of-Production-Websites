/* お米でつながる（架空） — 依存ライブラリなし */
(() => {
  'use strict';

  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 消費量チャートの茶わんアイコンを敷く ---------- */
  document.querySelectorAll('.bowls').forEach((el) => {
    const n = Number(el.dataset.n || 0);
    el.innerHTML = '<i></i>'.repeat(n);
  });

  /* ---------- TRYボタン（押した状態を保持して件数を+1する） ---------- */
  document.querySelectorAll('.try-btn').forEach((btn) => {
    btn.setAttribute('aria-pressed', 'false');
    const cnt = btn.parentElement.querySelector('.cnt');
    const base = cnt ? Number(cnt.textContent) : 0;
    btn.addEventListener('click', () => {
      const on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(on));
      btn.textContent = on ? 'TRY!' : 'TRY';
      if (cnt) cnt.textContent = String(base + (on ? 1 : 0));
    });
  });

  /* ---------- カルーセル（横スクロール＋矢印＋進捗バー） ---------- */
  document.querySelectorAll('[data-scroll]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const box = document.getElementById(btn.dataset.scroll);
      if (!box) return;
      const card = box.firstElementChild;
      const step = card ? card.getBoundingClientRect().width + 34 : box.clientWidth * 0.8;
      box.scrollBy({ left: step * Number(btn.dataset.dir), behavior: reduce() ? 'auto' : 'smooth' });
    });
  });

  const bindBar = (boxId, barId) => {
    const box = document.getElementById(boxId), bar = document.getElementById(barId);
    if (!box || !bar) return;
    const update = () => {
      const max = box.scrollWidth - box.clientWidth;
      const p = max > 0 ? box.scrollLeft / max : 0;
      bar.style.width = Math.max(24, 100 / Math.max(1, box.children.length)) + '%';
      bar.style.transform = `translateX(${p * (100 * (box.children.length - 1))}%)`;
    };
    box.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  };
  bindBar('studyCards', 'studyBar');
  bindBar('reportCards', 'reportBar');

  /* ---------- YES ボタン（押したら「ありがとう！」に） ---------- */
  document.querySelectorAll('.yes').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.yes').forEach((b) => { b.disabled = true; });
      btn.textContent = 'ありがとう！';
      btn.style.fontSize = '22px';
    });
  });

  /* ---------- 動画サムネイル（実際の埋め込みは未接続） ---------- */
  const movie = document.querySelector('.movie__thumb');
  if (movie) {
    movie.addEventListener('click', () => {
      movie.insertAdjacentHTML('afterend',
        '<p class="movie__note" style="margin-top:14px;font-size:13px;text-align:center;">※ダミーです。実際の動画は未接続です。</p>');
      movie.disabled = true;
    }, { once: true });
  }

  /* ---------- スクロール表示 ---------- */
  if ('IntersectionObserver' in window) {
    const targets = document.querySelectorAll(
      '.sec-head, .imagine__lead, .imagine__circle, .movie, .find__lead, .blob, .card, .polaroid, .tile, .research, .acts li, .outline, .poem p, .final__q, .final__btns'
    );
    targets.forEach((el) => {
      if (el.closest('.hero')) return;
      el.classList.add('reveal');
    });
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    targets.forEach((el, i) => {
      el.style.transitionDelay = Math.min((i % 5) * 70, 280) + 'ms';
      io.observe(el);
    });
  }

  /* ---------- ヒーローのイラストをゆっくり漂わせる ---------- */
  if (!reduce()) {
    document.querySelectorAll('.hero__art .a').forEach((el, i) => {
      el.style.animation = `float ${6 + (i % 4) * 1.3}s ease-in-out ${-i * 0.7}s infinite`;
    });
  }
})();
