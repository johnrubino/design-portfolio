// Shared interactions for all pages

// ── Mobile menu (hamburger) ──
(function () {
    const btn   = document.querySelector('.lp-hamburger');
    const menu  = document.querySelector('.lp-mobile-menu');
    const navEl = document.querySelector('.lp-nav');
    if (!btn || !menu) return;
    function open()  { btn.setAttribute('aria-expanded', 'true');  menu.removeAttribute('aria-hidden'); menu.classList.add('open'); }
    function close() { btn.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-hidden', 'true'); menu.classList.remove('open'); }
    btn.addEventListener('click', () => menu.classList.contains('open') ? close() : open());
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('click', e => {
        if (!navEl.contains(e.target) && !menu.contains(e.target)) close();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

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

// ── Contact modal (injected on any page with .lp-btn-contact) ──
(function () {
    if (!document.querySelector('.lp-btn-contact')) return;

    // Inject modal HTML
    const tpl = document.createElement('div');
    tpl.innerHTML = `
    <div class="access-overlay" id="contactOverlay" role="dialog" aria-modal="true" aria-labelledby="contactModalHeading">
        <div class="access-modal">
            <button class="access-modal-close" id="contactModalClose" aria-label="Close">&times;</button>
            <div id="contactFormView">
                <p class="access-modal-heading" id="contactModalHeading">Get in touch</p>
                <p class="access-modal-sub">Send me a message and I'll get back to you within 1\u20132 business days.</p>
                <form class="access-form" id="contactForm" novalidate>
                    <div class="access-field">
                        <label class="access-label" for="contactName">Name <span style="color:#e53e3e">*</span></label>
                        <input class="access-input" id="contactName" type="text" placeholder="Your name" autocomplete="name" />
                    </div>
                    <div class="access-field">
                        <label class="access-label" for="contactEmail">Email <span style="color:#e53e3e">*</span></label>
                        <input class="access-input" id="contactEmail" type="email" placeholder="you@company.com" autocomplete="email" />
                    </div>
                    <div class="access-field">
                        <label class="access-label" for="contactMessage">Message <span style="color:#e53e3e">*</span></label>
                        <textarea class="access-textarea" id="contactMessage" placeholder="What's on your mind?"></textarea>
                    </div>
                    <div class="access-form-footer">
                        <span class="access-form-note">I'll reply within 1\u20132 business days.</span>
                        <button type="submit" class="lp-btn-primary">Send Message</button>
                    </div>
                </form>
            </div>
            <div class="access-success" id="contactSuccess">
                <div class="access-success-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="var(--lp-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
                <h3>Message sent!</h3>
                <p>Thanks for reaching out. I'll be in touch within 1\u20132 business days.</p>
                <button class="lp-btn-primary" id="contactSuccessClose" style="margin-top:8px;">Done</button>
            </div>
        </div>
    </div>`;
    document.body.appendChild(tpl.firstElementChild);

    const overlay  = document.getElementById('contactOverlay');
    const closeBtn = document.getElementById('contactModalClose');
    const formView = document.getElementById('contactFormView');
    const success  = document.getElementById('contactSuccess');
    const form     = document.getElementById('contactForm');

    function openModal() {
        formView.style.display = '';
        success.style.display  = 'none';
        form.reset();
        ['contactName','contactEmail','contactMessage'].forEach(function (id) {
            document.getElementById(id).classList.remove('error');
        });
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        setTimeout(function () { document.getElementById('contactName').focus(); }, 300);
    }

    function closeModal() {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.lp-btn-contact').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            openModal();
        });
    });

    closeBtn.addEventListener('click', closeModal);
    document.getElementById('contactSuccessClose').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const name    = document.getElementById('contactName').value.trim();
        const email   = document.getElementById('contactEmail').value.trim();
        const message = document.getElementById('contactMessage').value.trim();

        let valid = true;
        ['contactName','contactEmail','contactMessage'].forEach(function (id) {
            document.getElementById(id).classList.remove('error');
        });
        if (!name)    { document.getElementById('contactName').classList.add('error');    valid = false; }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            document.getElementById('contactEmail').classList.add('error'); valid = false;
        }
        if (!message) { document.getElementById('contactMessage').classList.add('error'); valid = false; }
        if (!valid) return;

        const submitBtn = form.querySelector('[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending\u2026';

        fetch('https://formsubmit.co/ajax/johnrubinodesign@gmail.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                name:      name,
                email:     email,
                message:   message,
                _subject:  'Portfolio Contact \u2014 ' + name,
                _cc:       'john.rubino87@gmail.com',
                _template: 'table',
                _captcha:  'false'
            })
        })
        .then(function (res) { return res.json(); })
        .then(function () {
            formView.style.display = 'none';
            success.style.display  = 'flex';
        })
        .catch(function () {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
            alert('Something went wrong. Please email me directly at johnrubinodesign@gmail.com');
        });
    });
})();

// ── Radial spotlight hover on primary buttons ──
document.addEventListener('mousemove', function (e) {
    const btn = e.target.closest('.lp-btn-primary');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width  * 100) + '%');
    btn.style.setProperty('--my', ((e.clientY - rect.top)  / rect.height * 100) + '%');
});
