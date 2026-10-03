/* 社会福祉法人 あわいの森 — 下層ページ（事業所さがし・お問い合わせフォーム） */
(function () {
  'use strict';
  var params = new URLSearchParams(location.search);

  // ---------- 事業所をさがす：分野・地区・キーワードでしぼりこむ ----------
  var finder = document.getElementById('finder');
  if (finder) {
    var chips = finder.querySelectorAll('[data-field]');
    var area = document.getElementById('f-area');
    var kw = document.getElementById('f-q');
    var items = document.querySelectorAll('.ofc');
    var count = document.getElementById('f-count');
    var empty = document.getElementById('f-empty');
    var field = '';

    function norm(s) { return s.replace(/\s+/g, '').toLowerCase(); }
    function apply() {
      var a = area.value, q = norm(kw.value), shown = 0;
      items.forEach(function (li) {
        var hit = (!field || li.dataset.field === field) &&
          (!a || li.dataset.area === a) &&
          (!q || norm(li.textContent).indexOf(q) !== -1);
        li.hidden = !hit;
        if (hit) shown++;
      });
      count.textContent = shown;
      empty.hidden = shown > 0;
    }
    function setField(f) {
      field = f;
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c.dataset.field === f ? 'true' : 'false'); });
      apply();
    }
    chips.forEach(function (c) { c.addEventListener('click', function () { setField(c.dataset.field); }); });
    area.addEventListener('change', apply);
    kw.addEventListener('input', apply);

    // offices.html?field=elderly や、ヘッダーの検索（?q=）から来たとき
    if (params.get('q')) kw.value = params.get('q');
    var pf = params.get('field');
    setField(pf && finder.querySelector('[data-field="' + pf + '"]') ? pf : '');
  }

  // ---------- お問い合わせフォーム：必須項目の確認と、送信後の完了表示 ----------
  var form = document.getElementById('form');
  var thanks = document.getElementById('thanks');
  if (form && thanks) {
    // contact.html?type=recruit のように種類を引き継ぐ
    var type = params.get('type');
    if (type) {
      var r = form.querySelector('input[name="type"][value="' + type + '"]');
      if (r) r.checked = true;
    }

    var check = function (box) {
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
    };

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
  }
})();
