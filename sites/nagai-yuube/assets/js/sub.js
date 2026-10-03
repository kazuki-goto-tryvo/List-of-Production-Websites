/* ながいゆうべ ── 下層ページのSPメニュー */
(function () {
  'use strict';
  var btn = document.querySelector('.shd__toggle');
  var menu = document.getElementById('spm');
  if (!btn || !menu) return;
  function set(open) {
    btn.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    document.documentElement.classList.toggle('is-menu', open);
  }
  btn.addEventListener('click', function () { set(menu.hidden); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { set(false); btn.focus(); } });
  window.matchMedia('(min-width: 901px)').addEventListener('change', function (m) { if (m.matches) set(false); });
})();
