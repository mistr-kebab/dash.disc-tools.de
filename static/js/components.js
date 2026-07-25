(function() {
    var headerHTML = '' +
        '<header>' +
            '<div class="header-inner">' +
                '<a href="/" class="header-left link-reset">' +
                    '<div class="header-logo"><img src="/static/assets/img/icon.png" alt="Disc-Tools"></div>' +
                    '<span class="header-title">Disc<span class="accent">-</span>Tools</span>' +
                '</a>' +
                '<nav class="header-nav">' +
                    '<a href="/" class="nav-link" data-nav="home">Dashboard</a>' +
                    '<a href="/premium" class="nav-link" data-nav="premium">Premium</a>' +
                    '<a href="/stats" class="nav-link" data-nav="stats">Stats</a>' +
                '</nav>' +
                '<div class="header-right" id="header-right">' +
                    '<a class="btn-discord" href="/api/auth/login">' +
                        '<i class="fa-brands fa-discord"></i> Login' +
                    '</a>' +
                '</div>' +
            '</div>' +
        '</header>';

    var footerHTML = '' +
        '<footer class="site-footer">' +
            '<div class="footer-inner">' +
                '<div class="footer-brand">' +
                    '<div class="footer-brand-row">' +
                        '<div class="footer-brand-logo"><img src="/static/assets/img/icon.png" alt="Disc-Tools"></div>' +
                        '<span class="footer-brand-name">Disc<span class="accent">-</span>Tools</span>' +
                    '</div>' +
                    '<div class="footer-brand-slogan">Professional Discord Utilities</div>' +
                '</div>' +
                '<div class="footer-col">' +
                    '<h3>Product</h3>' +
                    '<a href="/">Dashboard</a>' +
                    '<a href="/invite">Invite Bot</a>' +
                    '<a href="/premium">Premium</a>' +
                '</div>' +
                '<div class="footer-col">' +
                    '<h3>Socials</h3>' +
                    '<a href="https://discord.gg/rtRs8rhj5u">Discord</a>' +
                    '<a href="https://disc-tools.de">Website</a>' +
                    '<a href="https://top.gg/bot/1508899864602345582">Top.gg</a>' +
                '</div>' +
                '<div class="footer-col">' +
                    '<h3>Contact</h3>' +
                    '<a href="https://discord.gg/rtRs8rhj5u">Support Server</a>' +
                    '<a href="/invite">Invite Bot</a>' +
                '</div>' +
                '<div class="footer-col">' +
                    '<h3>Legal</h3>' +
                    '<a href="/legal/imprint">Imprint</a>' +
                    '<a href="/legal/privacy-policy">Privacy Policy</a>' +
                    '<a href="/legal/terms-of-service">Terms of Service</a>' +
                    '<a href="/legal/refund-policy">Refund Policy</a>' +
                '</div>' +
            '</div>' +
            '<div class="footer-bottom">&copy; <span id="year"></span> Disc-Tools. All rights reserved.</div>' +
        '</footer>';

    var headerEl = document.querySelector('template-header');
    if (headerEl) {
        headerEl.outerHTML = headerHTML;
        var page = headerEl.getAttribute('data-page') || 'home';
        var link = document.querySelector('.header-nav a[data-nav="' + page + '"]');
        if (link) link.classList.add('active');
    }

    var footerEl = document.querySelector('template-footer');
    if (footerEl) {
        footerEl.outerHTML = footerHTML;
    }

    document.getElementById('year').textContent = new Date().getFullYear();
})();
