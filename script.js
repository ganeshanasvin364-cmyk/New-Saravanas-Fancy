// Shop hours (Sri Lanka time). Edit here if your hours change.
// Days: 0 = Sunday, 1 = Monday ... 6 = Saturday. Times are in minutes from midnight.
var OPEN_DAYS = [0, 1, 2, 3, 4, 5, 6];
var OPEN_AT = 8 * 60 + 30;   // 8.30 AM
var CLOSE_AT = 20 * 60 + 30; // 8.30 PM

document.getElementById('year').textContent = new Date().getFullYear();

// Header shadow after scrolling
var header = document.querySelector('.site-header');
function onScroll() {
  header.classList.toggle('scrolled', window.scrollY > 10);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Open / closed message based on Colombo time
function updateStatus() {
  var el = document.getElementById('status');
  var parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Colombo',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  }).formatToParts(new Date());
  var map = {};
  parts.forEach(function (p) { map[p.type] = p.value; });
  var dayIndex = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 }[map.weekday];
  var minutes = (parseInt(map.hour, 10) % 24) * 60 + parseInt(map.minute, 10);
  var isOpen = OPEN_DAYS.indexOf(dayIndex) !== -1 && minutes >= OPEN_AT && minutes < CLOSE_AT;
  el.classList.toggle('open', isOpen);
  el.textContent = isOpen
    ? 'Open now until 8.30 PM'
    : 'Closed now. Open Monday to Sunday, 8.30 AM to 8.30 PM';
}
updateStatus();
setInterval(updateStatus, 60000);

// Hide a product image if the file is missing, so the gold tile shows instead
document.querySelectorAll('.tile img').forEach(function (img) {
  img.addEventListener('error', function () { img.style.display = 'none'; });
});

// Fade the product tiles in one after another as they scroll into view
var tiles = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  var seen = 0;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var delay = (seen++ % 4) * 90;
        setTimeout(function () { entry.target.classList.add('in'); }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  tiles.forEach(function (t) { observer.observe(t); });
} else {
  tiles.forEach(function (t) { t.classList.add('in'); });
}

// Advertisement slider: add or remove <figure class="slide"> items in index.html
(function () {
  var slider = document.querySelector('.slider');
  if (!slider) return;
  var track = slider.querySelector('.slides');
  var slides = slider.querySelectorAll('.slide');
  var dotsBox = slider.querySelector('.dots');
  var index = 0, timer = null, startX = 0;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  slides.forEach(function (_, i) {
    var d = document.createElement('button');
    d.type = 'button';
    d.setAttribute('aria-label', 'Show banner ' + (i + 1));
    d.addEventListener('click', function () { go(i); restart(); });
    dotsBox.appendChild(d);
  });
  var dots = dotsBox.querySelectorAll('button');

  function go(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = 'translateX(' + (-100 * index) + '%)';
    dots.forEach(function (d, n) { d.classList.toggle('active', n === index); });
  }
  function restart() {
    clearInterval(timer);
    if (!reduce) timer = setInterval(function () { go(index + 1); }, 5000);
  }
  slider.querySelector('.prev').addEventListener('click', function () { go(index - 1); restart(); });
  slider.querySelector('.next').addEventListener('click', function () { go(index + 1); restart(); });
  slider.addEventListener('mouseenter', function () { clearInterval(timer); });
  slider.addEventListener('mouseleave', restart);
  slider.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) { go(index + (dx < 0 ? 1 : -1)); restart(); }
  });
  go(0);
  restart();
})();
