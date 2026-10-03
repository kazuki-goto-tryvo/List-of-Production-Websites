// お問い合わせフォーム：必須項目の確認と、送信後の完了表示
(function () {
  'use strict';
  var form = document.getElementById('form');
  var thanks = document.getElementById('thanks');
  if (!form) return;

  // contact.html?type=support のように種類を引き継ぐ。指定がなければ「住まい・仕事の相談」
  var type = new URLSearchParams(location.search).get('type') || 'soudan';
  var r = form.querySelector('input[name="type"][value="' + type + '"]');
  if (r) r.checked = true;

  function check(box) {
    var kind = box.getAttribute('data-req');
    var ok;
    if (kind === 'radio') ok = !!box.querySelector('input:checked');
    else if (kind === 'check') ok = box.querySelector('input').checked;
    else {
      var input = box.querySelector('input, textarea');
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
      var f = first.querySelector('input, textarea');
      if (f) f.focus({ preventScroll: true });
      return;
    }
    form.hidden = true;
    thanks.hidden = false;
    thanks.scrollIntoView({ block: 'center' });
    thanks.focus({ preventScroll: true });
  });
})();
