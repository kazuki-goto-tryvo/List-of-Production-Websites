/* AZUREVE — アジュレーヴ */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isSp = function () { return matchMedia('(max-width: 900px)').matches; };

  /* ---------- ヒーローの入り ---------- */
  requestAnimationFrame(function () { document.body.classList.add('is-ready'); });

  /* ---------- スクロールで現れる ---------- */
  var revealEls = document.querySelectorAll('.reveal, .reveal--blur');
  // ぼかしは出し終わったら消す（filter を残すと長い画面の描画が壊れる）
  var settle = function (el) {
    if (!el.classList.contains('reveal--blur')) return;
    var done = function () { el.classList.add('is-done'); };
    el.addEventListener('animationend', done, { once: true });
    setTimeout(done, 1600);
  };
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        settle(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); settle(el); });
  }

  /* ---------- 見出し左の縦罫（セクションに入ったら1回だけ伸びる） ---------- */
  var rules = document.querySelectorAll('.reason__title');
  if ('IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-vis');
        io2.unobserve(e.target);
      });
    }, { threshold: 0.2 });
    rules.forEach(function (el) { io2.observe(el); });
  } else {
    rules.forEach(function (el) { el.classList.add('is-vis'); });
  }

  /* ---------- ヘッダー（ヒーローを抜けたら白地に） ---------- */
  var hd = document.getElementById('hd');
  var sen = document.querySelector('.hd-sentinel');
  if (hd && sen && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      var e = es[0];
      hd.classList.toggle('is-float', !e.isIntersecting && e.boundingClientRect.top < 0);
    }, { threshold: 0 }).observe(sen);
  }

  /* ---------- ハンバーガー ---------- */
  var hb = document.getElementById('hb');
  var menu = document.getElementById('menu');
  if (hb && menu) {
    var setMenu = function (open) {
      hb.setAttribute('aria-expanded', String(open));
      menu.hidden = !open;
      document.documentElement.style.overflow = open ? 'hidden' : '';
    };
    setMenu(false);
    hb.addEventListener('click', function () {
      setMenu(hb.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (ev) {
      if (ev.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && hb.getAttribute('aria-expanded') === 'true') setMenu(false);
    });
  }

  /* ---------- コラージュのパララックス ---------- */
  var pars = [].slice.call(document.querySelectorAll('[data-par]'));
  if (pars.length && !reduce) {
    var ticking = false;
    var move = function () {
      ticking = false;
      var vh = innerHeight;
      pars.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var off = (r.top + r.height / 2) - vh / 2;
        var y = -off * parseFloat(el.dataset.par || 0);
        if (y > 60) y = 60; else if (y < -60) y = -60;
        el.style.setProperty('--py', y.toFixed(1) + 'px');
      });
    };
    addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(move); }
    }, { passive: true });
    addEventListener('resize', move);
    move();
  }

  /* ---------- カルーセル（自動送りなし・矢印とドット） ---------- */
  [].forEach.call(document.querySelectorAll('.car'), function (car) {
    var track = car.querySelector('.car__track');
    var slides = [].slice.call(car.querySelectorAll('.car__slide'));
    var dotsBox = car.querySelector('.car__dots');
    if (!track || !slides.length || !dotsBox) return;

    var dots = slides.map(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', (i + 1) + '枚目');
      b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      b.addEventListener('click', function () { go(i); });
      dotsBox.appendChild(b);
      return b;
    });

    var step = function () {
      if (slides.length < 2) return track.clientWidth;
      return slides[1].offsetLeft - slides[0].offsetLeft;
    };
    var cur = 0;
    var mark = function (i) {
      cur = i;
      dots.forEach(function (d, j) { d.setAttribute('aria-selected', j === i ? 'true' : 'false'); });
    };
    var go = function (i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: i * step(), behavior: reduce ? 'auto' : 'smooth' });
      mark(i);
    };

    [].forEach.call(car.querySelectorAll('.car__arw'), function (btn) {
      btn.addEventListener('click', function () { go(cur + Number(btn.dataset.dir)); });
    });

    // 指でなぞったときも現在位置を合わせる
    var t = null;
    track.addEventListener('scroll', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        var s = step();
        if (s > 0) mark(Math.round(track.scrollLeft / s));
      }, 90);
    }, { passive: true });
  });

  /* ---------- お客様の声（PCは既定で開・SPは既定で閉） ---------- */
  [].forEach.call(document.querySelectorAll('.voice__btn'), function (btn) {
    var body = document.getElementById(btn.getAttribute('aria-controls'));
    if (!body) return;

    var apply = function (open, animate) {
      btn.setAttribute('aria-expanded', String(open));
      if (!animate || reduce) { body.style.maxHeight = open ? 'none' : '0px'; return; }
      if (open) {
        body.style.maxHeight = body.scrollHeight + 'px';
        var done = function () { body.style.maxHeight = 'none'; body.removeEventListener('transitionend', done); };
        body.addEventListener('transitionend', done);
      } else {
        body.style.maxHeight = body.scrollHeight + 'px';
        requestAnimationFrame(function () { body.style.maxHeight = '0px'; });
      }
    };

    apply(!isSp(), false);
    btn.addEventListener('click', function () {
      apply(btn.getAttribute('aria-expanded') !== 'true', true);
    });

    // 幅が変わったら既定に戻す（PC↔SPをまたいだときだけ）
    var wasSp = isSp();
    addEventListener('resize', function () {
      var now = isSp();
      if (now === wasSp) return;
      wasSp = now;
      apply(!now, false);
    });
  });
})();
