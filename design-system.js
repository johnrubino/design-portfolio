// Shared interactions for all pages

// ── Floating nav island on scroll ──
(function () {
    const nav = document.querySelector('.lp-nav');
    if (!nav) return;
    function update() {
        nav.classList.toggle('scrolled', window.scrollY > 80);
    }
    window.addEventListener('scroll', update, { passive: true });
    update(); // run on load in case page is already scrolled
})();

// ── Radial spotlight hover on primary buttons ──
document.addEventListener('mousemove', function (e) {
    const btn = e.target.closest('.lp-btn-primary');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width  * 100) + '%');
    btn.style.setProperty('--my', ((e.clientY - rect.top)  / rect.height * 100) + '%');
});
