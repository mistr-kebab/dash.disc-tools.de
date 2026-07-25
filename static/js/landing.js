document.addEventListener('DOMContentLoaded', function () {
    var yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    var statTargets = {};
    var statsAnimated = false;

    function animateCount(el, target, duration) {
        var startTime = null;
        function step(ts) {
            if (!startTime) startTime = ts;
            var p = Math.min((ts - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.floor(eased * target).toLocaleString();
            if (p < 1) {
                requestAnimationFrame(step);
            }
        }
        requestAnimationFrame(step);
    }

    function runStatsAnimation() {
        if (statsAnimated) return;
        statsAnimated = true;
        var dur = 1600;
        var s = document.getElementById('lp-stat-servers');
        var c = document.getElementById('lp-stat-community');
        var u = document.getElementById('lp-stat-users');
        var p = document.getElementById('lp-stat-premium');
        if (s && statTargets.servers !== undefined) animateCount(s, statTargets.servers, dur);
        if (c && statTargets.community !== undefined) animateCount(c, statTargets.community, dur);
        if (u && statTargets.users !== undefined) animateCount(u, statTargets.users, dur);
        if (p && statTargets.premium !== undefined) animateCount(p, statTargets.premium, dur);
    }

    fetch('/api/stats')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            statTargets.servers = data.servers || 0;
            statTargets.community = data.communityMembers || 0;
            statTargets.users = data.totalUsers || 0;
            statTargets.premium = data.premiumUsers || 0;

            var statsSection = document.querySelector('.lp-stats');
            if (statsSection) {
                var observer = new IntersectionObserver(function(entries) {
                    entries.forEach(function(entry) {
                        if (entry.isIntersecting) {
                            runStatsAnimation();
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.3 });
                observer.observe(statsSection);
            } else {
                runStatsAnimation();
            }
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
