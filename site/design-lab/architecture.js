/* Containers Hamlet Design Lab. Code licence: AGPL-3.0-or-later. */
(function () {
  'use strict';
  var root = document.querySelector('[data-slideshow]');
  if (!root) return;
  document.documentElement.classList.add('js');
  var slides = Array.prototype.slice.call(root.querySelectorAll('[data-slide]'));
  var status = root.querySelector('[data-slide-status]');
  var prev = root.querySelector('[data-slide-prev]');
  var next = root.querySelector('[data-slide-next]');
  var all = root.querySelector('[data-slide-all]');
  var viewport = root.querySelector('[data-slide-viewport]');
  var index = 0;
  var showingAll = false;

  function title(i) { return slides[i].getAttribute('data-title') || 'View'; }
  function announce() {
    if (showingAll) status.textContent = 'All ' + slides.length + ' views shown.';
    else status.textContent = 'View ' + (index + 1) + ' of ' + slides.length + ': ' + title(index);
  }
  function render() {
    slides.forEach(function (s, i) { s.classList.toggle('is-current', i === index); });
    root.classList.toggle('is-showing-all', showingAll);
    prev.disabled = !showingAll && index === 0;
    next.disabled = !showingAll && index === slides.length - 1;
    all.setAttribute('aria-expanded', showingAll ? 'true' : 'false');
    all.textContent = showingAll ? 'Show one at a time' : 'Show all views';
    announce();
  }
  function go(delta) {
    if (showingAll) return;
    index = Math.max(0, Math.min(slides.length - 1, index + delta));
    render();
  }
  prev.addEventListener('click', function () { go(-1); });
  next.addEventListener('click', function () { go(1); });
  all.addEventListener('click', function () { showingAll = !showingAll; render(); });
  root.addEventListener('keydown', function (e) {
    if (showingAll) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'Home') { e.preventDefault(); index = 0; render(); }
    if (e.key === 'End') { e.preventDefault(); index = slides.length - 1; render(); }
  });
  render();
}());
