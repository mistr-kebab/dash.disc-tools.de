document.getElementById('sidebar-toggle').addEventListener('click', function() {
    var sidebar = document.getElementById('profile-sidebar');
    var collapsed = sidebar.classList.toggle('collapsed');
    var icon = this.querySelector('i');
    if (collapsed) {
        icon.className = 'fa-solid fa-angles-right';
    } else {
        icon.className = 'fa-solid fa-angles-left';
    }
});

var saveTimer = null;
function saveSetting() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function() {
        var body = {
            username_history_optout: !document.getElementById('opt-username-history').checked,
            alt_visibility: document.getElementById('opt-alt-visibility').checked
        };
        fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body)
        }).catch(function() {});
    }, 300);
}

function loadOverview(auth) {
    document.getElementById('ov-display-name').textContent = auth.user.global_name || auth.user.username;
    document.getElementById('ov-username').textContent = '@' + auth.user.username;
    document.getElementById('ov-user-id').textContent = auth.user.id;
    document.getElementById('ov-email').textContent = auth.user.email || 'Not available';

    try {
        var snowflake = BigInt(auth.user.id);
        var createdAt = new Date(Number((snowflake >> 22n) + 1420070400000n));
        document.getElementById('ov-joined').textContent = createdAt.toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch(e) {
        document.getElementById('ov-joined').textContent = '—';
    }

    var copyCount = 0;
    document.getElementById('ov-email').addEventListener('click', function() {
        copyCount++;
        if (copyCount > 3) {
            showToast('Enough copied lil bro');
            return;
        }
        if (copyCount === 3) {
            setTimeout(function() { copyCount = 0; }, 5000);
        }
        var email = this.textContent;
        if (!email || email === 'Not available') return;
        navigator.clipboard.writeText(email).then(function() {
            showToast('Copied to clipboard');
        }).catch(function() {});
    });

    function showToast(msg) {
        var container = document.querySelector('.profile-toast-stack');
        if (!container) {
            container = document.createElement('div');
            container.className = 'profile-toast-stack';
            document.body.appendChild(container);
        }
        container.querySelectorAll('.profile-toast').forEach(function(t) { t.classList.add('stale'); });
        var toast = document.createElement('div');
        toast.className = 'profile-toast';
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(function() {
            if (!toast.matches(':hover')) toast.remove();
        }, 2900);
    }

    fetch('/api/premium/status/' + auth.user.id, { credentials: 'include' })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            var el = document.getElementById('ov-premium');
            var sub = document.getElementById('ov-premium-sub');
            if (data.active) {
                var exp = data.expires_at ? new Date(data.expires_at).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Lifetime';
                el.textContent = 'Active';
                el.className = 'overview-value premium-active';
                if (sub) sub.textContent = 'Until ' + exp;
            } else {
                el.textContent = 'Inactive';
                if (sub) sub.textContent = '';
            }
        })
        .catch(function() {});

    fetch('/api/servers', { credentials: 'include' })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            var count = data.botServers ? data.botServers.length : 0;
            var el = document.getElementById('ov-server-count');
            if (el) el.textContent = count + ' server' + (count !== 1 ? 's' : '');
            var sub = document.querySelector('#ov-server-count + .overview-sub');
            if (sub) sub.textContent = 'With Disc-Tools installed';
        })
        .catch(function() {});

    fetch('/api/profile/guild-membership', { credentials: 'include' })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            var el = document.getElementById('ov-guild-joined');
            if (data.joined && data.joined_at) {
                var d = new Date(data.joined_at);
                el.textContent = d.toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' });
            } else {
                el.textContent = 'Not joined';
            }
        })
        .catch(function() {});
}

function loadSessions() {
    fetch('/api/sessions', { credentials: 'include' })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            var tbody = document.querySelector('#sessions-list tbody');
            var sessions = data.sessions || [];
            if (!sessions.length) {
                tbody.innerHTML = '<tr><td colspan="7" class="profile-empty">No active sessions</td></tr>';
                return;
            }
            var html = '';
            var currentUA = navigator.userAgent || '';
            sessions.forEach(function(s) {
                var created = new Date(s.created_at);
                var lastUsed = new Date(s.last_used || s.created_at);
                var dateStr = created.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
                var activeStr = lastUsed.toLocaleDateString('en', { month: 'short', day: 'numeric' }) + ' ' +
                    lastUsed.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false });
                var ua = s.user_agent || '';

                var isCurrent = ua && currentUA && ua === currentUA;

                var browser = '—';
                if (ua.includes('Firefox')) browser = 'Firefox';
                else if (ua.includes('Edg')) browser = 'Edge';
                else if (ua.includes('Chrome')) browser = 'Chrome';
                else if (ua.includes('Safari')) browser = 'Safari';
                else if (ua.includes('Opera')) browser = 'Opera';

                var os = '—';
                var device = '—';
                if (ua.includes('Windows')) { os = 'Windows'; device = 'Desktop'; }
                else if (ua.includes('Mac')) { os = 'macOS'; device = 'Desktop'; }
                else if (ua.includes('Linux') && !ua.includes('Android')) { os = 'Linux'; device = 'Desktop'; }
                else if (ua.includes('Android')) { os = 'Android'; device = 'Mobile'; }
                else if (ua.includes('iPhone')) { os = 'iOS'; device = 'Mobile'; }
                else if (ua.includes('iPad')) { os = 'iOS'; device = 'Tablet'; }

                if (isCurrent) device = '<span style="color:#2ecc71;font-weight:600">This device</span>';

                html += '<tr>' +
                    '<td>' + device + '</td>' +
                    '<td>' + os + '</td>' +
                    '<td>' + browser + '</td>' +
                    '<td>' + activeStr + '</td>' +
                    '<td>' + dateStr + '</td>' +
                    '<td>' + (isCurrent ? '' : '<button class="session-revoke" onclick="revokeSession(' + s.id + ', this)" title="Revoke"><i class="fa-solid fa-xmark"></i></button>') + '</td>' +
                '</tr>';
            });
            tbody.innerHTML = html;
        })
        .catch(function() {});
}

function revokeSession(id, btn) {
    fetch('/api/sessions/' + id, { method: 'DELETE', credentials: 'include' })
        .then(function() {
            var row = btn.parentElement;
            row.style.opacity = '0';
            row.style.transform = 'translateX(8px)';
            setTimeout(function() { row.remove(); }, 250);
        })
        .catch(function() {});
}

function expiresStr(date) {
    if (!date) return '—';
    return date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}

function loadPremiumHistory() {
    fetch('/api/premium/history', { credentials: 'include' })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            var tbody = document.querySelector('#premium-history-list tbody');
            var history = data.history || [];
            if (!history.length) {
                tbody.innerHTML = '<tr><td colspan="7" class="profile-empty">No premium subscriptions yet</td></tr>';
                return;
            }

            var html = '';
            history.forEach(function(h) {
                var created = new Date(h.created_at);
                var expires = h.expires_at ? new Date(h.expires_at) : null;
                var isGift = h.type === 'gift';
                var isActive = h.active;
                var isUpcoming = h.upcoming;
                var rowClass = isActive ? 'active-row' : (isUpcoming ? 'queued-row' : '');
                var statusBadge;
                if (isActive) statusBadge = '<span class="premium-badge active">Active</span>';
                else if (isUpcoming) statusBadge = '<span class="premium-badge queued">Upcoming</span>';
                else statusBadge = '<span class="premium-badge expired">Expired</span>';
                var typeText = isGift ? 'Gift' : (h.type === 'renewal' ? 'Renewal' : 'Purchase');
                var isStripeGift = isGift && !!h.stripe_customer_id;
                var priceText = isGift ? (isStripeGift ? '€4' : '—') : '€5';
                var startText = created.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
                var boughtBy = isGift && h.gifter_name ? h.gifter_name : 'You';

                var durationText = h.duration_label || '1 month';

                html += '<tr class="' + rowClass + '">' +
                    '<td>' + statusBadge + '</td>' +
                    '<td>' + durationText + '</td>' +
                    '<td>' + typeText + '</td>' +
                    '<td>' + priceText + '</td>' +
                    '<td>' + startText + '</td>' +
                    '<td>' + expiresStr(expires) + '</td>' +
                    '<td>' + boughtBy + '</td>' +
                '</tr>';
            });
            tbody.innerHTML = html;
        })
        .catch(function() {});
}

function loadSettings() {
    fetch('/api/settings', { credentials: 'include' })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            document.getElementById('opt-username-history').checked = !data.username_history_optout;
            document.getElementById('opt-alt-visibility').checked = data.alt_visibility;
        })
        .catch(function() {});
}

var path = window.location.pathname.replace(/\/$/, '');
var page = path.split('/').pop();

checkAuth().then(function(auth) {
    if (!auth.authenticated || !auth.user) {
        window.location.href = '/';
        return;
    }

    var name = auth.user.global_name || auth.user.username;
    var elName = document.getElementById('profile-name');
    var elUser = document.getElementById('profile-username');
    if (elName) elName.textContent = name;
    if (elUser) elUser.textContent = '@' + auth.user.username;

    var avatarHash = auth.user.avatar;
    if (avatarHash) {
        var isAnimated = avatarHash.startsWith('a_');
        var base = 'https://cdn.discordapp.com/avatars/' + auth.user.id + '/' + avatarHash;
        var ext = isAnimated ? 'gif' : 'png';
        var avEl = document.getElementById('profile-avatar');
        if (avEl) avEl.innerHTML = '<img src="' + base + '.' + ext + '" alt="' + name + '">';
    }

    if (page === 'overview' || page === 'profile') loadOverview(auth);
    if (page === 'sessions') loadSessions();
    if (page === 'premium-history') loadPremiumHistory();
    if (page === 'settings') loadSettings();
});
