(function() {
    var headerHTML = '' +
        '<header>' +
            '<div class="header-inner">' +
                '<a href="/" class="header-left link-reset">' +
                    '<div class="header-logo"><img src="/static/assets/img/icon.png" alt="Disc-Tools" width="32" height="32"></div>' +
                    '<span class="header-title">Disc<span class="accent">-</span>Tools</span>' +
                '</a>' +
                '<nav class="header-nav">' +
                    '<a href="/" class="nav-link" data-nav="home">Dashboard</a>' +

                    '<a href="/premium" class="nav-link" data-nav="premium">Premium</a>' +
                    '<a href="/shop" class="nav-link" data-nav="shop">Shop</a>' +
                    '<a href="/stats" class="nav-link" data-nav="stats">Stats</a>' +
                    '<a href="https://status.disc-tools.de/status/dash" class="nav-link" target="_blank" rel="noopener">Status</a>' +
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
                        '<div class="footer-brand-logo"><img src="/static/assets/img/icon.png" alt="Disc-Tools" width="32" height="32"></div>' +
                        '<span class="footer-brand-name">Disc<span class="accent">-</span>Tools</span>' +
                    '</div>' +
                    '<div class="footer-brand-slogan">Professional Discord Utilities</div>' +
                    '<div class="footer-social">' +
                        '<a href="https://github.com/mistr-kebab/dash.disc-tools.de" target="_blank" rel="noopener" aria-label="GitHub"><i class="fa-brands fa-github"></i></a>' +
                        '<a href="https://discord.gg/rtRs8rhj5u" target="_blank" rel="noopener" aria-label="Discord"><i class="fa-brands fa-discord"></i></a>' +
                        '<a href="https://www.instagram.com/disc.tools" target="_blank" rel="noopener" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>' +
                        '<a href="https://www.tiktok.com/@disc.tools" target="_blank" rel="noopener" aria-label="TikTok"><i class="fa-brands fa-tiktok"></i></a>' +
                        '<a href="https://x.com/disc_tools" target="_blank" rel="noopener" aria-label="X (Twitter)"><i class="fa-brands fa-x-twitter"></i></a>' +
                    '</div>' +
                '</div>' +
                '<div class="footer-col">' +
                    '<h3>Product</h3>' +
                    '<a href="/">Dashboard</a>' +
                    '<a href="/invite">Invite Bot</a>' +
                    '<a href="/shop">Shop</a>' +
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
