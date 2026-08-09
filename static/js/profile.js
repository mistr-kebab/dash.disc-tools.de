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

function showProfileToast(msg, isError) {
    var container = document.querySelector('.profile-toast-stack');
    if (!container) {
        container = document.createElement('div');
        container.className = 'profile-toast-stack';
        document.body.appendChild(container);
    }
    container.querySelectorAll('.profile-toast').forEach(function(t) { t.classList.add('stale'); });
    var toast = document.createElement('div');
    toast.className = 'profile-toast';
    if (isError) toast.style.color = '#e74c3c';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(function() {
        if (!toast.matches(':hover')) toast.remove();
    }, 2900);
}

window.saveDisplayName = function() {
    var input = document.getElementById('display-name');
    var name = input.value.trim();
    if (!name) {
        showProfileToast('Display name cannot be empty.', true);
        return;
    }
    fetch('/api/profile/display-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ display_name: name })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.success) {
            showProfileToast('Display name updated.');
            var el = document.getElementById('profile-name');
            if (el) el.textContent = name;
        } else {
            showProfileToast(data.error || 'Failed to save.', true);
        }
    })
    .catch(function() {
        showProfileToast('Failed to save. Please try again.', true);
    });
};

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

    var displayNameInput = document.getElementById('display-name');
    if (displayNameInput) {
        displayNameInput.value = auth.user.global_name || auth.user.username || '';
    }

    try {
        var snowflake = BigInt(auth.user.id);
        var createdAt = new Date(Number((snowflake >> 22n) + 1420070400000n));
        document.getElementById('ov-joined').textContent = createdAt.toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch(e) {
        document.getElementById('ov-joined').textContent = '-';
    }

    var copyCount = 0;
    document.getElementById('ov-email').addEventListener('click', function() {
        copyCount++;
        if (copyCount > 3) {
            showProfileToast('Enough copied lil bro');
            return;
        }
        if (copyCount === 3) {
            setTimeout(function() { copyCount = 0; }, 5000);
        }
        var email = this.textContent;
        if (!email || email === 'Not available') return;
        navigator.clipboard.writeText(email).then(function() {
            showProfileToast('Copied to clipboard');
        }).catch(function() {});
    });

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

                var browser = '-';
                if (ua.includes('Firefox')) browser = 'Firefox';
                else if (ua.includes('Edg')) browser = 'Edge';
                else if (ua.includes('Chrome')) browser = 'Chrome';
                else if (ua.includes('Safari')) browser = 'Safari';
                else if (ua.includes('Opera')) browser = 'Opera';

                var os = '-';
                var device = '-';
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
                    '<td>' + (isCurrent ? '' : '<button class="session-revoke" data-session-id="' + s.id + '" title="Revoke"><i class="fa-solid fa-xmark"></i></button>') + '</td>' +
                '</tr>';
            });
            tbody.innerHTML = html;
            var btns = tbody.querySelectorAll('.session-revoke');
            for (var i = 0; i < btns.length; i++) {
                btns[i].addEventListener('click', function(e) {
                    revokeSession(this.getAttribute('data-session-id'), this);
                });
            }
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
    if (!date) return '-';
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
                var priceText = isGift ? (isStripeGift ? '€4' : '-') : '€5';
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
    loadGdprStatus();
}

function loadGdprStatus() {
    fetch('/api/gdpr/request', { credentials: 'include' })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            var btn = document.getElementById('gdpr-request-btn');
            var emailInfo = document.getElementById('gdpr-email-info');
            var status = document.getElementById('gdpr-status');
            var input = document.getElementById('gdpr-email');
            if (!btn || !emailInfo) return;

            var discordEmail = data.discord_email || null;
            var usedEmail = data.gdpr_email || discordEmail;
            input.placeholder = usedEmail || 'Email address (required)';
            if (data.gdpr_email && data.gdpr_email !== discordEmail) {
                emailInfo.textContent = 'Your request will be sent to ' + data.gdpr_email + ' (Discord email: ' + (discordEmail || 'not available') + ').';
            } else if (usedEmail) {
                emailInfo.textContent = 'Your request will be sent to ' + usedEmail + '.';
            } else {
                emailInfo.textContent = 'No email on your Discord account - enter an email address to request your data.';
                input.placeholder = 'Email address (required)';
            }

            if (!data.can_request && data.next_allowed_at) {
                var next = new Date(data.next_allowed_at);
                var days = Math.ceil((next.getTime() - Date.now()) / 86400000);
                btn.disabled = true;
                btn.classList.add('btn-disabled');
                status.textContent = 'Next request possible in ' + (days > 0 ? days + ' day' + (days !== 1 ? 's' : '') : 'less than a day') + '.';
            }
        })
        .catch(function() {});
}

function requestData() {
    var btn = document.getElementById('gdpr-request-btn');
    if (!btn || btn.disabled) return;
    var email = document.getElementById('gdpr-email').value.trim();
    btn.disabled = true;
    btn.textContent = 'Sending...';
    fetch('/api/gdpr/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email || undefined })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.success) {
            showProfileToast('Data request sent to ' + data.sent_to + '.');
            btn.textContent = 'Request my data';
            loadGdprStatus();
        } else if (data.error === 'rate_limited') {
            showProfileToast('You already requested your data recently.', true);
            btn.textContent = 'Request my data';
            loadGdprStatus();
        } else {
            showProfileToast(data.error || 'Failed to send request.', true);
            btn.textContent = 'Request my data';
            btn.disabled = false;
        }
    })
    .catch(function() {
        showProfileToast('Failed to send request. Please try again.', true);
        btn.textContent = 'Request my data';
        btn.disabled = false;
    });
}

var path = window.location.pathname.replace(/\/$/, '');
var page = path.split('/').pop();

var gdprBtn = document.getElementById('gdpr-request-btn');
if (gdprBtn) gdprBtn.addEventListener('click', requestData);
var optUsernameHistory = document.getElementById('opt-username-history');
if (optUsernameHistory) optUsernameHistory.addEventListener('change', saveSetting);
var optAltVisibility = document.getElementById('opt-alt-visibility');
if (optAltVisibility) optAltVisibility.addEventListener('change', saveSetting);
var btnSaveDisplayName = document.getElementById('btn-save-display-name');
if (btnSaveDisplayName) btnSaveDisplayName.addEventListener('click', saveDisplayName);
var sidebarLabels = document.querySelectorAll('.profile-sidebar-section-label');
for (var i = 0; i < sidebarLabels.length; i++) {
    sidebarLabels[i].addEventListener('click', function() {
        this.parentElement.classList.toggle('collapsed');
    });
}
var btnLogout = document.getElementById('profile-logout');
if (btnLogout) btnLogout.addEventListener('click', logout);

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
