(function() {
    const COOKIE_KEY = 'dash_cookie_consent';

    function getConsent() {
        try { return localStorage.getItem(COOKIE_KEY); } catch(e) { return null; }
    }

    function setConsent(value) {
        try { localStorage.setItem(COOKIE_KEY, value); } catch(e) {}
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.classList.remove('cookie-active');
            banner.style.pointerEvents = 'none';
        }
        if (value === 'all') {
            try { localStorage.setItem('dash_analytics_enabled', 'true'); } catch(e) {}
        } else {
            try { localStorage.removeItem('dash_analytics_enabled'); } catch(e) {}
        }
    }

    function createBannerHTML() {
        var div = document.createElement('div');
        div.className = 'cookie-banner';
        div.id = 'cookie-banner';
        div.innerHTML =
            '<div class="cookie-header">' +
                '<i class="fa-solid fa-cookie cookie-icon"></i>' +
                '<span class="cookie-title">Cookie Consent</span>' +
            '</div>' +
            '<div class="cookie-text">' +
                'This site uses cookies for essential functionality and analytics. ' +
                '<a href="/legal/privacy-policy">Learn more</a>' +
            '</div>' +
            '<div class="cookie-btns">' +
                '<button class="cookie-btn cookie-btn-ghost" data-action="reject">Reject all</button>' +
                '<button class="cookie-btn cookie-btn-secondary" data-action="essential">Only essential</button>' +
                '<button class="cookie-btn cookie-btn-primary" data-action="accept">Accept all</button>' +
            '</div>';
        return div;
    }

    function bindEvents(banner) {
        banner.addEventListener('click', function(e) {
            var btn = e.target.closest('[data-action]');
            if (!btn) return;
            var action = btn.getAttribute('data-action');
            if (action === 'accept') setConsent('all');
            else if (action === 'essential') setConsent('essential');
            else if (action === 'reject') setConsent('reject');
        });
    }

    function showBanner() {
        if (getConsent()) return;
        var banner = document.getElementById('cookie-banner');
        if (!banner) {
            banner = createBannerHTML();
            bindEvents(banner);
            document.body.appendChild(banner);
        }
        banner.classList.add('cookie-active');
        banner.style.pointerEvents = 'auto';
    }

    document.addEventListener('DOMContentLoaded', function() {
        if (getConsent()) return;
        setTimeout(showBanner, 2000);
    });

    window.acceptAll = function() { setConsent('all'); };
    window.essentialOnly = function() { setConsent('essential'); };
    window.rejectAll = function() { setConsent('reject'); };
})();
