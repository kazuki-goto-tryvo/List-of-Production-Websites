/* あしたの靴下「サンダルインナー」— 依存なし。prefers-reduced-motion で全部止まる */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = document.querySelectorAll('.fade, .fade-list');
  document.querySelectorAll('.fade-list').forEach(function (l) {
    Array.prototype.forEach.call(l.children, function (c, i) { c.style.setProperty('--d', i); });
  });
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (t) { t.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    targets.forEach(function (t) { io.observe(t); });
  }
})();
