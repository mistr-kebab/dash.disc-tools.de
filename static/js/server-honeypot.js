(function() {
    var path = window.location.pathname;
    var match = path.match(/^\/manage\/(\d+)\/honeypot\/?$/);
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

    var saved = {};
    var bar = document.getElementById('unsaved-bar');
    var toastEl = null;
    var allChannels = [];

    function showToast(text, className) {
        if (!toastEl) return;
        toastEl.textContent = text;
        toastEl.className = 'toast ' + (className || '');
        toastEl.removeAttribute('hidden');
        clearTimeout(toastEl._timeout);
        toastEl._timeout = setTimeout(function() { toastEl.hidden = true; }, 2500);
    }

    function populateChannels(sel, categoryId) {
        sel.innerHTML = '<option value="">- Auto-create -</option>';
        var filtered = categoryId
            ? allChannels.filter(function(c) { return c.parentId === categoryId; })
            : allChannels;
        filtered.forEach(function(ch) {
            var opt = document.createElement('option');
            opt.value = ch.id;
            opt.textContent = '#' + ch.name;
            sel.appendChild(opt);
        });
    }

    function getVal(id) {
        var el = document.getElementById(id);
        return el ? el.value : '';
    }

    function setVal(id, value) {
        var el = document.getElementById(id);
        if (el) el.value = value || '';
    }

    function getCurrentValues() {
        return {
            honeypot_channel: getVal('setting-honeypot-channel'),
            honeypot_penalty: getVal('setting-honeypot-penalty'),
            honeypot_ban_duration: getVal('setting-ban-duration')
        };
    }

    function isDirty() {
        var cur = getCurrentValues();
        for (var k in saved) {
            if (String(cur[k]) !== String(saved[k])) return true;
        }
        return false;
    }

    function checkDirty() {
        bar.style.display = isDirty() ? 'flex' : 'none';
    }

    function discardChanges() {
        setVal('setting-honeypot-channel', saved.honeypot_channel);
        setVal('setting-honeypot-penalty', saved.honeypot_penalty);
        setVal('setting-ban-duration', saved.honeypot_ban_duration);
        updateBanDurationVisibility();
        bar.style.display = 'none';
    }

    function updateBanDurationVisibility() {
        var penalty = getVal('setting-honeypot-penalty');
        var row = document.getElementById('row-ban-duration');
        row.style.display = penalty === 'ban' ? '' : 'none';
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
                toastEl = document.getElementById('toast');
                allChannels = data.channels || [];
                var settings = data.settings || {};

                var cats = data.categories || [];
                var catSel = document.getElementById('setting-honeypot-category');
                cats.forEach(function(c) {
                    var opt = document.createElement('option');
                    opt.value = c.id;
                    opt.textContent = c.name;
                    catSel.appendChild(opt);
                });

                var chanSel = document.getElementById('setting-honeypot-channel');
                populateChannels(chanSel, '');

                var s = {
                    honeypot_channel: settings.honeypot_channel || '',
                    honeypot_penalty: settings.honeypot_penalty || '',
                    honeypot_ban_duration: String(settings.honeypot_ban_duration || '0')
                };

                setVal('setting-honeypot-channel', s.honeypot_channel);
                setVal('setting-honeypot-penalty', s.honeypot_penalty);
                setVal('setting-ban-duration', s.honeypot_ban_duration);

                saved = s;

                updateBanDurationVisibility();
                checkDirty();

                catSel.addEventListener('change', function() {
                    populateChannels(chanSel, catSel.value);
                    checkDirty();
                });
                chanSel.addEventListener('change', checkDirty);
                document.getElementById('setting-honeypot-penalty').addEventListener('change', function() {
                    updateBanDurationVisibility();
                    checkDirty();
                });
                document.getElementById('setting-ban-duration').addEventListener('change', checkDirty);

                checkRoleHierarchy(data.botRolePosition || 0, data.roles || [], data.settings || {});
            })
            .catch(function() {});
    }

    window.saveHoneypot = function() {
        var btnBar = document.getElementById('btn-save-bar');
        if (btnBar) btnBar.disabled = true;

        var values = getCurrentValues();
        fetch('/api/guilds/' + serverId + '/settings', {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                honeypot_channel: values.honeypot_channel || null,
                honeypot_penalty: values.honeypot_penalty || null,
                honeypot_ban_duration: values.honeypot_penalty === 'ban' ? parseInt(values.honeypot_ban_duration) || 0 : null
            })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.error) {
                showToast(data.error, 'error');
                if (btnBar) btnBar.disabled = false;
                return;
            }
            showToast('Saved!', 'success');
            if (btnBar) btnBar.disabled = false;
            saved = {
                honeypot_channel: data.honeypot_channel || '',
                honeypot_penalty: values.honeypot_penalty,
                honeypot_ban_duration: values.honeypot_penalty === 'ban' ? (String(parseInt(values.honeypot_ban_duration) || 0)) : '0'
            };
            if (!values.honeypot_channel && data.honeypot_channel) {
                location.reload();
                return;
            }
            bar.style.display = 'none';
        })
        .catch(function() {
            showToast('Failed to save', 'error');
            if (btnBar) btnBar.disabled = false;
        });
    };

    document.getElementById('btn-discard').addEventListener('click', discardChanges);
    document.getElementById('btn-save-bar').addEventListener('click', function() { window.saveHoneypot(); });
    var closeBtn = document.getElementById('btn-role-warning-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            var modal = document.getElementById('role-warning-modal');
            if (modal) modal.hidden = true;
        });
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
                document.getElementById('server-sub').textContent = 'Set up a honeypot for ' + server.name;
                document.querySelector('title').textContent = server.name + ' Honeypot – Disc-Tools';
                document.getElementById('nav-overview').href = '/manage/' + serverId + '/overview';
                document.getElementById('nav-settings').href = '/manage/' + serverId + '/settings';
                document.getElementById('nav-verification').href = '/manage/' + serverId + '/verification';
                document.getElementById('nav-honeypot').href = '/manage/' + serverId + '/honeypot';

                if (server.icon) {
                    var isAnimated = server.icon.startsWith('a_');
                    var base = 'https://cdn.discordapp.com/icons/' + serverId + '/' + server.icon;
                    document.getElementById('server-sidebar-icon').innerHTML = '<img src="' + base + '.' + (isAnimated ? 'gif' : 'png') + '" alt="' + server.name + '">';
                }

                loadSettings();
            });
    });
})();
