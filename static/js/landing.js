document.addEventListener('DOMContentLoaded', function () {
    var yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    fetch('/api/stats')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            var s = document.getElementById('lp-stat-servers');
            var c = document.getElementById('lp-stat-community');
            var u = document.getElementById('lp-stat-users');
            var p = document.getElementById('lp-stat-premium');
            if (s) s.textContent = (data.servers || 0).toLocaleString();
            if (c) c.textContent = (data.communityMembers || 0).toLocaleString();
            if (u) u.textContent = (data.totalUsers || 0).toLocaleString();
            if (p) p.textContent = (data.premiumUsers || 0).toLocaleString();
        })
        .catch(function() {});

    checkAuth().then(function (auth) {
        var headerRight = document.getElementById('header-right');
        if (headerRight) updateHeader(auth, headerRight);

        if (!auth.authenticated || !auth.user) return;

        var navServers = document.getElementById('nav-servers');
        if (navServers) {
            navServers.href = '/my-servers';
            navServers.classList.remove('hidden');
        }

        var actions = document.getElementById('hero-actions');
        if (actions) {
            actions.innerHTML =
                '<a href="/my-servers" class="lp-btn lp-btn-primary">' +
                    '<i class="fa-solid fa-layer-group"></i> My Servers' +
                '</a>' +
                '<a href="/premium" class="lp-btn lp-btn-ghost">' +
                    '<i class="fa-solid fa-crown"></i> Premium' +
                '</a>';
        }
    });
});
