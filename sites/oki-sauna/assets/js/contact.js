/* 熾 -蕗原サウナ- ご予約・お問い合わせフォーム：必須項目の確認と、送信後の完了表示 */
(function () {
  'use strict';
  var form = document.getElementById('form');
  var thanks = document.getElementById('thanks');
  if (!form) return;
  var resv = document.getElementById('resv');
  var inn = form.querySelector('.field--inn');

  // 選べるのは明日から
  var date = document.getElementById('f-date');
  if (date) {
    var d = new Date(); d.setDate(d.getDate() + 1);
    date.min = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  function type() {
    var r = form.querySelector('input[name="type"]:checked');
    return r ? r.value : '';
  }

  // ご用件に合わせて、予約の欄と宿の欄を出し入れする
  function sync() {
    var t = type();
    if (resv) resv.hidden = t === 'other';
    if (inn) inn.hidden = t !== 'stay';
  }

  // reserve.html?type=stay のようにご用件を引き継ぐ
  var q = new URLSearchParams(location.search).get('type');
  if (q) {
    var r = form.querySelector('input[name="type"][value="' + q + '"]');
    if (r) r.checked = true;
  }
  sync();
  form.querySelectorAll('input[name="type"]').forEach(function (r) { r.addEventListener('change', sync); });

  function check(box) {
    var when = box.getAttribute('data-when');
    if (when && when.split(' ').indexOf(type()) < 0) { box.classList.remove('is-err'); return true; }
    var kind = box.getAttribute('data-req');
    var ok;
    if (kind === 'radio') ok = !!box.querySelector('input:checked');
    else if (kind === 'check') ok = box.querySelector('input').checked;
    else {
      var input = box.querySelector('input, textarea, select');
      var v = input.value.trim();
      ok = kind === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) : v !== '';
      input.setAttribute('aria-invalid', String(!ok));
    }
    box.classList.toggle('is-err', !ok);
    return ok;
  }

  // 直したそばからエラーを消す。change（フォーカスが外れた瞬間）で消すと、
  // 下の欄をクリックしたときに行が縮んでクリックが空振りするので input で見る
  form.querySelectorAll('[data-req]').forEach(function (box) {
    box.addEventListener('input', function () { if (box.classList.contains('is-err')) check(box); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var first = null;
    form.querySelectorAll('[data-req]').forEach(function (box) {
      if (!check(box) && !first) first = box;
    });
    if (first) {
      first.scrollIntoView({ block: 'center' });
      var f = first.querySelector('input, textarea, select');
      if (f) f.focus({ preventScroll: true });
      return;
    }
    form.hidden = true;
    thanks.hidden = false;
    thanks.scrollIntoView({ block: 'center' });
    thanks.focus({ preventScroll: true });
  });
})();
