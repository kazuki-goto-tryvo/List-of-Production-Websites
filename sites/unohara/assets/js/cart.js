// カート：中身の一覧・数量の変更・合計の計算
(function () {
  'use strict';
  var C = window.unoharaCart;
  if (!C) return;
  var ITEMS = {
    hazy:   { name: '小杉川ヘイジーIPA', unit: '6本', price: 6480, img: 'can0.webp', c: '#2E9BD8' },
    saison: { name: '山椒セゾン', unit: '6本', price: 6980, img: 'can1.webp', c: '#5BB543' },
    pale:   { name: '鵜原ペールエール', unit: '6本', price: 6280, img: 'can2.webp', c: '#F2C230' },
    peach:  { name: '白桃ネオIPA', unit: '6本', price: 7140, img: 'can3.webp', c: '#EE5A7C' },
    set:    { name: '4種の飲み比べセット', unit: '8本', price: 8800, img: 'hero.webp', c: '#2E9BD8' },
    glass:  { name: 'ウノハラのグラス', unit: '1脚', price: 1980, img: 'gl2.webp', c: '#F2C230' }
  };
  var SHIP = 1320, FREE = 11000;
  var list = document.getElementById('ctList');
  var empty = document.getElementById('ctEmpty');
  var sum = document.getElementById('ctSum');
  var warn = document.getElementById('ctWarn');
  var yen = function (n) { return '¥ ' + n.toLocaleString('ja-JP'); };

  function render() {
    var cart = C.get(), sub = 0, html = '';
    Object.keys(cart).forEach(function (id) {
      var it = ITEMS[id], q = cart[id];
      if (!it || !q) return;
      sub += it.price * q;
      html += '<li class="ct__i" style="--c:' + it.c + '">'
        + '<figure class="ct__ph"><img src="assets/img/' + it.img + '" alt="" width="120" height="120"></figure>'
        + '<div class="ct__t"><p class="ct__n">' + it.name + '</p><p class="ct__u">' + yen(it.price) + '（' + it.unit + '・税込）</p></div>'
        + '<div class="ct__q" role="group" aria-label="' + it.name + 'の数量">'
        + '<button type="button" data-q="-1" data-id="' + id + '" aria-label="1つ減らす">−</button>'
        + '<output>' + q + '</output>'
        + '<button type="button" data-q="1" data-id="' + id + '" aria-label="1つ増やす">＋</button></div>'
        + '<p class="ct__p">' + yen(it.price * q) + '</p>'
        + '<button class="ct__x ln" type="button" data-q="0" data-id="' + id + '">削除</button></li>';
    });
    list.innerHTML = html;
    var has = sub > 0;
    empty.hidden = has; list.hidden = !has; sum.hidden = !has;
    var ship = !has || sub >= FREE ? 0 : SHIP;
    document.getElementById('ctSub').textContent = yen(sub);
    document.getElementById('ctShip').textContent = has && ship === 0 ? '無料' : yen(ship);
    document.getElementById('ctTotal').textContent = yen(sub + ship);
    if (has) warn.hidden = true;
    return has;
  }

  list.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-id]');
    if (!b) return;
    var cart = C.get(), id = b.dataset.id, d = +b.dataset.q;
    cart[id] = d === 0 ? 0 : Math.max(0, (cart[id] || 0) + d);
    if (!cart[id]) delete cart[id];
    C.set(cart); render();
  });

  // カートが空のときは注文させない
  window.formGuard = function () {
    var has = render();
    if (!has) { warn.hidden = false; warn.scrollIntoView({ block: 'center' }); }
    return has;
  };
  window.formDone = function () { C.set({}); render(); };
  render();
})();
