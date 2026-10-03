/* 有限会社 ホトリエ地域ケア */
(function () {
  var d = document, root = d.documentElement, body = d.body;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var spMq = matchMedia('(max-width: 900px)');
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  if (!reduce) root.classList.add('js-motion');

  var hd = d.getElementById('hd'), mv = d.getElementById('mv');

  /* ① ヒーローの入り */
  requestAnimationFrame(function () { requestAnimationFrame(function () { body.classList.add('is-ready'); }); });

  /* ヒーロー：6秒ごとにフェード＋ケンバーンズ */
  var slides = [].slice.call(d.querySelectorAll('.mv__slide')), cur = 0;
  if (slides.length) {
    requestAnimationFrame(function () { slides[0].classList.add('is-move'); });
    if (!reduce) setInterval(function () {
      var prev = slides[cur];
      cur = (cur + 1) % slides.length;
      var next = slides[cur];
      next.classList.add('is-active');
      requestAnimationFrame(function () { next.classList.add('is-move'); });
      prev.classList.remove('is-active');
      setTimeout(function () { prev.classList.remove('is-move'); }, 1300);
    }, 6000);
  }

  /* 円周の SCROLL（1字ずつ回転配置） */
  var ring = d.querySelector('.mv__ring');
  function buildRing() {
    if (!ring) return;
    var t = spMq.matches ? ring.dataset.textSp : ring.dataset.text;
    ring.innerHTML = t.split('').map(function (c, i) {
      return '<span class="ch" style="--i:' + i + '"><i>' + (c === ' ' ? '&nbsp;' : c) + '</i></span>';
    }).join('');
  }
  buildRing();
  spMq.addEventListener('change', buildRing);

  /* ② スクロールで現れる（一度きり） */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  d.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* ④ ゴースト英字：見えている間だけ流す */
  var gio = new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.target.classList.toggle('is-play', e.isIntersecting); });
  });
  d.querySelectorAll('.ghost').forEach(function (el) { gio.observe(el); });

  /* RECRUIT：入ったら出す・上へ抜けたら外す（戻ってきたときにもう一度出す） */
  var rc = d.querySelector('.rc__content');
  if (rc) new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) rc.classList.add('is-active');
      else if (e.boundingClientRect.top < 0) rc.classList.remove('is-active');
    });
  }, { threshold: .25 }).observe(rc);

  /* スクロール連動（sticky＋CSS変数） */
  var about = d.querySelector('.about');
  var cards = [].slice.call(d.querySelectorAll('.svc-card'));
  var grows = [].slice.call(d.querySelectorAll('[data-grow]'));
  var rcSec = d.querySelector('.rc'), rcSub = d.querySelector('.rc__sub');
  var bars = [].slice.call(d.querySelectorAll('[data-bar]'));
  var sbar = d.querySelector('.sbar');
  var ticking = false;

  function update() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight, sp = spMq.matches;
    var scrolled = y > 360;
    hd.classList.toggle('is-scrolled', scrolled);
    if (mv) mv.classList.toggle('is-scrolled', scrolled);

    // 右端のバー：進捗と事業ごとの色
    var max = root.scrollHeight - vh;
    if (sbar) sbar.style.setProperty('--sp', max > 0 ? clamp(y / max) : 0);
    var col = '';
    for (var i = 0; i < bars.length; i++) {
      var r = bars[i].getBoundingClientRect();
      if (r.top <= vh / 2 && r.bottom > vh / 2) col = bars[i].dataset.bar;
    }
    if (sbar && col) sbar.style.setProperty('--bar', col); else if (sbar) sbar.style.removeProperty('--bar');

    if (reduce) return;

    // ヒーロー写真が左47%に縮む
    if (!sp && about) {
      var p = clamp(y / vh);
      root.style.setProperty('--p', p.toFixed(4));
      var at = about.getBoundingClientRect();
      // 縮んでいる途中だけ隠す（最上部では画面外なので出しておく）
      root.style.setProperty('--ap', p > 0 && at.top > 1 ? 0 : 1);
    } else {
      root.style.setProperty('--p', 0);
    }

    // 事業カード：入ってくると広がり、次が迫ると縮む
    var ins = cards.map(function (c) {
      var t = c.getBoundingClientRect().top, top = parseFloat(getComputedStyle(c).top) || 0;
      return clamp((vh - t) / (vh - top));
    });
    cards.forEach(function (c, i) {
      c.style.setProperty('--in', ins[i].toFixed(4));
      c.style.setProperty('--cover', (i < cards.length - 1 ? ins[i + 1] : 0).toFixed(4));
    });

    // 保育カード・CONTACT：画面に入るにつれ広がる
    grows.forEach(function (g) {
      var t = g.getBoundingClientRect().top;
      g.style.setProperty('--g', sp ? 0 : clamp((vh - t) / (vh * .5)).toFixed(4));
    });

    // RECRUIT 右端の小写真
    if (rcSec && !sp) {
      var rr = rcSec.getBoundingClientRect();
      var py = ((vh / 2) - (rr.top + rr.height / 2)) / (vh / 2 + rr.height / 2);
      rcSub.style.setProperty('--py', Math.max(-1, Math.min(1, py)).toFixed(4));
    }

    // ABOUT の貼り付き写真は、縮み終わった瞬間のスライドに合わせる
    if (!sp && about && slides.length) {
      var img = d.querySelector('.about__photo'), src = slides[cur].querySelector('img').getAttribute('src');
      if (img.getAttribute('src') !== src && root.style.getPropertyValue('--ap') === '0') img.setAttribute('src', src);
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();

  /* SPハンバーガー */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
})();
