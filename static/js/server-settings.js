(function() {
    var path = window.location.pathname;
    var match = path.match(/^\/manage\/(\d+)\/settings\/?$/);
    var serverId = match ? match[1] : null;
    document.getElementById('server-sidebar-id').textContent = serverId || '-';

    function showBotMissingPanel(serverName, serverIcon, clientId) {
        var inviteUrl = 'https://discord.com/oauth2/authorize?client_id=' + (clientId || '1508899864602345582') + '&permissions=8&scope=bot&guild_id=' + serverId + '&disable_guild_select=true';
        document.getElementById('server-sidebar-name').textContent = serverName;
        document.getElementById('nav-overview').href = '/manage/' + serverId + '/overview';
        if (document.getElementById('nav-settings')) document.getElementById('nav-settings').href = '/manage/' + serverId + '/settings';
        if (document.getElementById('nav-verification')) document.getElementById('nav-verification').href = '/manage/' + serverId + '/verification';
        if (document.getElementById('nav-honeypot')) document.getElementById('nav-honeypot').href = '/manage/' + serverId + '/honeypot';
        if (serverIcon) {
            var isAnimated = serverIcon.startsWith('a_');
            var base = 'https://cdn.discordapp.com/icons/' + serverId + '/' + serverIcon;
            document.getElementById('server-sidebar-icon').innerHTML = '<img src="' + base + '.' + (isAnimated ? 'gif' : 'png') + '" alt="' + serverName + '">';
        }
        var panel = document.querySelector('.profile-panel');
        if (panel) {
            panel.innerHTML = '<h2><i class="fa-solid fa-robot"></i> Server Management</h2>' +
                '<p class="profile-panel-sub">The bot does not have the required permissions on <strong>' + (serverName || 'this server') + '</strong>.</p>' +
                '<div class="settings-card" style="text-align:center;padding:24px;">' +
                '<p style="margin-bottom:16px;">Re-invite the bot with the required permissions.</p>' +
                '<a class="btn-discord" href="' + inviteUrl + '" target="_blank"><i class="fa-brands fa-discord"></i> Update Bot</a>' +
                '</div>' +
                '<p style="text-align:center;margin-top:16px;"><a href="/my-servers">← Back to My Servers</a></p>';
        }
    }

    var savedValue = '';
    var savedEnabled = false;
    var bar = document.getElementById('unsaved-bar');
    var catSel = null;
    var chanSel = null;
    var toggleEl = null;
    var allChannels = [];
    var toastEl = null;

    function showToast(text, className) {
        if (!toastEl) return;
        toastEl.textContent = text;
        toastEl.className = 'toast ' + (className || '');
        toastEl.removeAttribute('hidden');
        clearTimeout(toastEl._timeout);
        toastEl._timeout = setTimeout(function() { toastEl.hidden = true; }, 2500);
    }

    function populateChannels(categoryId) {
        chanSel.innerHTML = '<option value="">- None -</option>';
        var filtered = categoryId
            ? allChannels.filter(function(c) { return c.parentId === categoryId; })
            : allChannels;
        filtered.forEach(function(ch) {
            var opt = document.createElement('option');
            opt.value = ch.id;
            opt.textContent = '#' + ch.name;
            chanSel.appendChild(opt);
        });
    }

    function updateSelectsState() {
        var on = toggleEl.checked;
        catSel.disabled = !on;
        chanSel.disabled = !on;
    }

    function checkDirty() {
        var dirty = chanSel && (chanSel.value !== savedValue || toggleEl.checked !== savedEnabled);
        bar.style.display = dirty ? 'flex' : 'none';
    }

    function checkRoleHierarchy(botPos, roles, settings) {
        var verRoleId = (settings && settings.verified_role) || '';
        var unvRoleId = (settings && settings.unverified_role) || '';
        var show = false;
        [verRoleId, unvRoleId].forEach(function(rid) {
            if (!rid) return;
            var role = roles.find(function(r) { return r.id === rid; });
            if (role && role.position >= botPos) show = true;
        });
        var modal = document.getElementById('role-warning-modal');
        if (modal) modal.hidden = !show;
    }

    function discardChanges() {
        if (chanSel) chanSel.value = savedValue;
        toggleEl.checked = savedEnabled;
        updateSelectsState();
        if (catSel && savedValue) {
            var ch = allChannels.find(function(c) { return c.id === savedValue; });
            catSel.value = ch ? ch.parentId || '' : '';
            populateChannels(catSel.value);
            chanSel.value = savedValue;
        }
        bar.style.display = 'none';
    }

    function loadSettings() {
        fetch('/api/guilds/' + serverId + '/settings', { credentials: 'include' })
            .then(function(r) {
                if (r.status === 403) {
                    window.location.replace('/manage/' + serverId + '/overview');
                    return null;
                }
                return r.json();
            })
            .then(function(data) {
                if (!data) return;
                catSel = document.getElementById('setting-log-category');
                chanSel = document.getElementById('setting-log-channel');
                toggleEl = document.getElementById('toggle-audit-log');
                toastEl = document.getElementById('toast');
                allChannels = data.channels || [];

                var categories = data.categories || [];
                categories.forEach(function(c) {
                    var opt = document.createElement('option');
                    opt.value = c.id;
                    opt.textContent = c.name;
                    catSel.appendChild(opt);
                });

                var savedChannelId = '';
                if (data.settings && data.settings.log_channel) {
                    savedChannelId = data.settings.log_channel;
                }
                savedEnabled = !!savedChannelId;
                toggleEl.checked = savedEnabled;

                if (savedChannelId) {
                    var ch = allChannels.find(function(c) { return c.id === savedChannelId; });
                    if (ch && ch.parentId) {
                        catSel.value = ch.parentId;
                    } else {
                        catSel.value = '';
                    }
                }

                populateChannels(catSel.value);
                chanSel.value = savedChannelId;
                savedValue = savedChannelId;
                updateSelectsState();

                catSel.addEventListener('change', function() {
                    populateChannels(catSel.value);
                    chanSel.value = '';
                    checkDirty();
                });
                chanSel.addEventListener('change', checkDirty);
                toggleEl.addEventListener('change', function() {
                    updateSelectsState();
                    checkDirty();
                });

                checkRoleHierarchy(data.botRolePosition || 0, data.roles || [], data.settings || {});
            })
            .catch(function() {});
    }

    window.saveSettings = function() {
        var btnBar = document.getElementById('btn-save-bar');
        if (btnBar) btnBar.disabled = true;

        var logChannel = toggleEl.checked ? (chanSel ? chanSel.value : '') : '';
        fetch('/api/guilds/' + serverId + '/settings', {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ log_channel: logChannel || null })
        })
        .then(function(r) { return r.json(); })
        .then(function() {
            showToast('Saved!', 'success');
            if (btnBar) btnBar.disabled = false;
            savedValue = logChannel;
            savedEnabled = toggleEl.checked;
            bar.style.display = 'none';
        })
        .catch(function() {
            showToast('Failed to save', 'error');
            if (btnBar) btnBar.disabled = false;
        });
    };

    document.getElementById('btn-discard').addEventListener('click', discardChanges);
    document.getElementById('btn-save-bar').addEventListener('click', function() { window.saveSettings(); });
    var closeBtn = document.getElementById('btn-role-warning-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            var modal = document.getElementById('role-warning-modal');
            if (modal) modal.hidden = true;
        });
    }

    function isDirty() {
        return chanSel && (chanSel.value !== savedValue || toggleEl.checked !== savedEnabled);
    }

    window.addEventListener('beforeunload', function(e) {
        if (isDirty()) {
            bar.style.display = 'flex';
            bar.classList.add('shake');
            setTimeout(function() { bar.classList.remove('shake'); }, 400);
            e.preventDefault();
        }
    });

    document.addEventListener('click', function(e) {
        var link = e.target.closest('a');
        if (!link || !isDirty()) return;
        var href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
        if (href === window.location.pathname) return;
        e.preventDefault();
        bar.style.display = 'flex';
        bar.classList.add('shake');
        setTimeout(function() { bar.classList.remove('shake'); }, 400);
        if (confirm('You have unsaved changes. Leave anyway?')) {
            window.location.href = href;
        }
    });

    checkAuth().then(function(auth) {
        if (!auth.authenticated) return;

        fetch('/api/servers', { credentials: 'include' })
            .then(function(r) { return r.json(); })
            .then(function(data) {
                var server = null;
                var botServers = data.botServers || [];
                for (var i = 0; i < botServers.length; i++) {
                    if (String(botServers[i].id) === serverId) { server = botServers[i]; break; }
                }
                if (!server) {
                    var otherServers = data.servers || [];
                    var foundSrv = null;
                    for (var j = 0; j < otherServers.length; j++) {
                        if (String(otherServers[j].id) === serverId) { foundSrv = otherServers[j]; break; }
                    }
                    if (foundSrv) {
                        showBotMissingPanel(foundSrv.name, foundSrv.icon, data.clientId);
                    } else {
                        window.location.replace('/blocked/no-access');
                    }
                    return;
                }
                if (server.missingPermissions) {
                    showBotMissingPanel(server.name, server.icon, data.clientId);
                    return;
                }
                document.getElementById('server-sidebar-name').textContent = server.name;
                document.getElementById('server-sub').textContent = 'Configure ' + server.name;
                document.querySelector('title').textContent = server.name + ' Settings – Disc-Tools';
                document.getElementById('nav-overview').href = '/manage/' + serverId + '/overview';
                document.getElementById('nav-settings').href = '/manage/' + serverId + '/settings';
                var nv = document.getElementById('nav-verification');
                if (nv) nv.href = '/manage/' + serverId + '/verification';
                var nh = document.getElementById('nav-honeypot');
                if (nh) nh.href = '/manage/' + serverId + '/honeypot';

                if (server.icon) {
                    var isAnimated = server.icon.startsWith('a_');
                    var base = 'https://cdn.discordapp.com/icons/' + serverId + '/' + server.icon;
                    document.getElementById('server-sidebar-icon').innerHTML = '<img src="' + base + '.' + (isAnimated ? 'gif' : 'png') + '" alt="' + server.name + '">';
                }

                loadSettings();
            });
    });
})();

(function() {
    var sidebarLabels = document.querySelectorAll('.profile-sidebar-section-label');
    for (var i = 0; i < sidebarLabels.length; i++) {
        sidebarLabels[i].addEventListener('click', function() {
            this.parentElement.classList.toggle('collapsed');
        });
    }
})();
