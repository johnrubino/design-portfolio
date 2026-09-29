// Vercel Web Analytics — page views on every public page (cookieless, no banner needed).
// Turn it on in Vercel → Project → Analytics; until then the script is simply a no-op 404.
// Hiring-link tokens (?t=) and admin keys (?key=) are stripped before anything is sent.
(function () {
    if (location.protocol === 'file:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;

    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    window.va('beforeSend', function (event) {
        try {
            var url = new URL(event.url);
            url.searchParams.delete('t');
            url.searchParams.delete('key');
            return Object.assign({}, event, { url: url.toString() });
        } catch (_) {
            return event;
        }
    });

    var s = document.createElement('script');
    s.defer = true;
    s.src = '/_vercel/insights/script.js';
    document.head.appendChild(s);
})();
