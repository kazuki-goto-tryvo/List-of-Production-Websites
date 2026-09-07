/* ケアラーのつどい かさねて */
(function () {
  'use strict';

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 読み込み時の白レイヤー。手とタグラインはここから動きはじめる ── */
  var loader = document.getElementById('loader');
  var started = false;
  function start() {
    if (started) return;
    started = true;
    document.body.classList.add('is-ready');
    if (!loader) return;
    setTimeout(function () { loader.classList.add('is-done'); }, reduce ? 0 : 900);
  }
  if (document.readyState === 'complete') start();
  else addEventListener('load', start);
  setTimeout(start, 2000);   // JSやフォントが詰まっても2秒で必ず開ける

  /* ── ハンバーガー（SP） ── */
  var ham = document.getElementById('ham');
  var gnav = document.getElementById('gnav');
  var layer = document.getElementById('layer');

  function setMenu(open) {
    if (!ham || !gnav) return;
    ham.classList.toggle('is-open', open);
    gnav.classList.toggle('is-open', open);
    if (layer) layer.classList.toggle('is-on', open);
    ham.setAttribute('aria-expanded', open ? 'true' : 'false');
    var t = ham.querySelector('.ham__txt');
    if (t) t.textContent = open ? 'メニューを閉じる' : 'メニュー';
  }
  if (ham) ham.addEventListener('click', function () {
    setMenu(!ham.classList.contains('is-open'));
  });
  if (layer) layer.addEventListener('click', function () { setMenu(false); });
  if (gnav) gnav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });

  /* ── イベント画像の拡大 ── */
  var modal = document.getElementById('modal');
  var mFig = modal ? modal.querySelector('.modal__fig') : null;
  var mCap = document.getElementById('modalCap');
  var mImg = null;
  var opener = null;

  function openModal(btn) {
    if (!modal) return;
    opener = btn;
    // 拡大用の <img> は開くときに作る（空の src を置いたままにしない）
    if (!mImg) {
      mImg = document.createElement('img');
      mImg.id = 'modalImg';
      mFig.insertBefore(mImg, mCap);
    }
    mImg.src = btn.dataset.full;
    mImg.alt = btn.querySelector('img') ? btn.querySelector('img').alt : '';
    mCap.textContent = btn.dataset.cap || '';
    modal.classList.remove('is-closing');
    modal.hidden = false;
    var c = document.getElementById('modalClose');
    if (c) c.focus();
  }
  function closeModal() {
    if (!modal || modal.hidden) return;
    if (reduce) { modal.hidden = true; }
    else {
      modal.classList.add('is-closing');
      setTimeout(function () { modal.hidden = true; modal.classList.remove('is-closing'); }, 300);
    }
    if (opener) { opener.focus(); opener = null; }
  }
  Array.prototype.forEach.call(document.querySelectorAll('.ev__img'), function (b) {
    b.addEventListener('click', function () { openModal(b); });
  });
  if (modal) modal.addEventListener('click', function (e) {
    if (e.target === modal || e.target.closest('.modal__close')) closeModal();
  });
  addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeModal();
    setMenu(false);
  });
})();
