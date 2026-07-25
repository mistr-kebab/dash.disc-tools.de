(function() {
    const COOKIE_KEY = 'dash_cookie_consent';

    function getConsent() {
        return localStorage.getItem(COOKIE_KEY);
    }

    function setConsent(value) {
        localStorage.setItem(COOKIE_KEY, value);
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.classList.remove('cookie-active');
            banner.style.pointerEvents = 'none';
        }
        if (value === 'all') {
            localStorage.setItem('dash_analytics_enabled', 'true');
        } else {
            localStorage.removeItem('dash_analytics_enabled');
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        if (getConsent()) return;
        setTimeout(function() {
            const banner = document.getElementById('cookie-banner');
            if (banner) {
                banner.classList.add('cookie-active');
                banner.style.pointerEvents = 'auto';
            }
        }, 2000);
    });

    window.acceptAll = function() { setConsent('all'); };
    window.essentialOnly = function() { setConsent('essential'); };
    window.rejectAll = function() { setConsent('reject'); };
})();
