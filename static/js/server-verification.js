(function() {
    var path = window.location.pathname;
    var match = path.match(/^\/manage\/(\d+)\/verification\/?$/);
    var serverId = match ? match[1] : null;
    document.getElementById('server-sidebar-id').textContent = serverId || '—';

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
    var allRoles = [];
    var botRolePosition = 0;

    function showToast(text, className) {
        if (!toastEl) return;
        toastEl.textContent = text;
        toastEl.className = 'toast ' + (className || '');
        toastEl.removeAttribute('hidden');
        clearTimeout(toastEl._timeout);
        toastEl._timeout = setTimeout(function() { toastEl.hidden = true; }, 2500);
    }

    function populateChannels(sel, categoryId) {
        sel.innerHTML = '<option value="">— None —</option>';
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

    function populateSelect(sel, items) {
        items.forEach(function(item) {
            var opt = document.createElement('option');
            opt.value = item.id;
            opt.textContent = '@' + item.name;
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
            verify_channel: getVal('setting-verify-channel'),
            unverified_role: getVal('setting-unverified-role'),
            verified_role: getVal('setting-verified-role'),
            verify_log_channel: getVal('setting-verify-log-channel'),
            verify_title: getVal('setting-verify-title'),
            verify_body: getVal('setting-verify-body'),
            verify_color: getVal('setting-verify-color'),
            verify_image: getVal('setting-verify-image'),
            verify_thumbnail: getVal('setting-verify-thumbnail')
        };
    }

    function isDirty() {
        var cur = getCurrentValues();
        for (var k in saved) {
            if (cur[k] !== saved[k]) return true;
        }
        return false;
    }

    function checkDirty() {
        bar.style.display = isDirty() ? 'flex' : 'none';
    }

    function discardChanges() {
        for (var k in saved) {
            var idMap = {
                verify_channel: 'setting-verify-channel',
                unverified_role: 'setting-unverified-role',
                verified_role: 'setting-verified-role',
                verify_log_channel: 'setting-verify-log-channel',
                verify_title: 'setting-verify-title',
                verify_body: 'setting-verify-body',
                verify_color: 'setting-verify-color',
                verify_image: 'setting-verify-image',
                verify_thumbnail: 'setting-verify-thumbnail'
            };
            setVal(idMap[k], saved[k]);
        }
        bar.style.display = 'none';
    }

    function setupCategoryFilter(catSelId, chanSelId) {
        var catSel = document.getElementById(catSelId);
        var chanSel = document.getElementById(chanSelId);
        populateChannels(chanSel, '');
        catSel.addEventListener('change', function() {
            populateChannels(chanSel, catSel.value);
            checkDirty();
        });
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
                allRoles = data.roles || [];
                var settings = data.settings || {};

                var cats = data.categories || [];
                ['setting-verify-category', 'setting-verify-log-category'].forEach(function(id) {
                    var sel = document.getElementById(id);
                    cats.forEach(function(c) {
                        var opt = document.createElement('option');
                        opt.value = c.id;
                        opt.textContent = c.name;
                        sel.appendChild(opt);
                    });
                });

                ['setting-unverified-role', 'setting-verified-role'].forEach(function(id) {
                    populateSelect(document.getElementById(id), allRoles);
                });

                setupCategoryFilter('setting-verify-category', 'setting-verify-channel');
                setupCategoryFilter('setting-verify-log-category', 'setting-verify-log-channel');

                var s = {
                    verify_channel: settings.verify_channel || '',
                    unverified_role: settings.unverified_role || '',
                    verified_role: settings.verified_role || '',
                    verify_log_channel: settings.verify_log_channel || '',
                    verify_title: settings.verify_title || 'Verify your account',
                    verify_body: settings.verify_body || 'Click the button below to verify your account and gain access to the server.',
                    verify_color: settings.verify_color || '#9b59b6',
                    verify_image: settings.verify_image || '',
                    verify_thumbnail: settings.verify_thumbnail || ''
                };

                setVal('setting-verify-channel', s.verify_channel);
                setVal('setting-unverified-role', s.unverified_role);
                setVal('setting-verified-role', s.verified_role);
                setVal('setting-verify-log-channel', s.verify_log_channel);
                setVal('setting-verify-title', s.verify_title);
                setVal('setting-verify-body', s.verify_body);
                setVal('setting-verify-color', s.verify_color);
                setVal('setting-verify-image', s.verify_image);
                setVal('setting-verify-thumbnail', s.verify_thumbnail);

                saved = s;

                ['setting-verify-channel', 'setting-unverified-role', 'setting-verified-role',
                 'setting-verify-log-channel'].forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el) {
                        el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', function() {
                            checkDirty();
                            if (id === 'setting-verified-role' || id === 'setting-unverified-role') checkHierarchyLocal();
                        });
                    }
                });

                ['setting-verify-title', 'setting-verify-body', 'setting-verify-color',
                 'setting-verify-image', 'setting-verify-thumbnail'].forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el) el.addEventListener('input', function() { updatePreview(); checkDirty(); });
                });

                updatePreview();
                checkHierarchy(data.botRolePosition, data.roles);
            })
            .catch(function() {});
    }

    window.saveVerification = function() {
        var btnBar = document.getElementById('btn-save-bar');
        if (btnBar) btnBar.disabled = true;

        var values = getCurrentValues();
        fetch('/api/guilds/' + serverId + '/settings', {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                verify_channel: values.verify_channel || null,
                unverified_role: values.unverified_role || null,
                verified_role: values.verified_role || null,
                verify_log_channel: values.verify_log_channel || null,
                verify_title: values.verify_title || null,
                verify_body: values.verify_body || null,
                verify_color: values.verify_color || null,
                verify_image: values.verify_image || null,
                verify_thumbnail: values.verify_thumbnail || null
            })
        })
        .then(function(r) { return r.json(); })
        .then(function() {
            showToast('Saved!', 'success');
            if (btnBar) btnBar.disabled = false;
            saved = {
                verify_channel: values.verify_channel,
                unverified_role: values.unverified_role,
                verified_role: values.verified_role,
                verify_log_channel: values.verify_log_channel,
                verify_title: values.verify_title,
                verify_body: values.verify_body,
                verify_color: values.verify_color,
                verify_image: values.verify_image,
                verify_thumbnail: values.verify_thumbnail
            };
            bar.style.display = 'none';
        })
        .catch(function() {
            showToast('Failed to save', 'error');
            if (btnBar) btnBar.disabled = false;
        });
    };

    function checkHierarchy(botPos, roles) {
        botRolePosition = botPos;
        allRoles = roles;
        var modal = document.getElementById('role-warning-modal');
        var show = checkRoleConflict();
        modal.hidden = !show;
    }

    function checkRoleConflict() {
        var verRoleId = getVal('setting-verified-role');
        var unvRoleId = getVal('setting-unverified-role');
        var show = false;
        [verRoleId, unvRoleId].forEach(function(rid) {
            if (!rid) return;
            var role = allRoles.find(function(r) { return r.id === rid; });
            if (role && role.position >= botRolePosition) show = true;
        });
        return show;
    }

    function checkHierarchyLocal() {
        var modal = document.getElementById('role-warning-modal');
        modal.hidden = !checkRoleConflict();
    }

    document.getElementById('btn-discard').addEventListener('click', discardChanges);
    document.getElementById('btn-save-bar').addEventListener('click', function() { window.saveVerification(); });
    var closeBtn = document.getElementById('btn-role-warning-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            var modal = document.getElementById('role-warning-modal');
            if (modal) modal.hidden = true;
        });
    }

    window.updatePreview = function() {
        var title = getVal('setting-verify-title') || 'Verify your account';
        var body = getVal('setting-verify-body') || 'Click the button below to verify your account and gain access to the server.';
        var color = getVal('setting-verify-color') || '#9b59b6';
        var image = getVal('setting-verify-image');
        var thumb = getVal('setting-verify-thumbnail');

        document.querySelector('.embed-preview').style.borderLeftColor = color;
        document.getElementById('preview-title').textContent = title;
        document.getElementById('preview-body').textContent = body;

        var thumbEl = document.getElementById('preview-thumb');
        if (thumb) {
            thumbEl.style.display = 'block';
            thumbEl.innerHTML = '<img src="' + thumb + '" alt="">';
        } else {
            thumbEl.style.display = 'none';
            thumbEl.innerHTML = '';
        }

        var imgEl = document.getElementById('preview-image');
        if (image) {
            imgEl.style.display = 'block';
            imgEl.innerHTML = '<img src="' + image + '" alt="">';
        } else {
            imgEl.style.display = 'none';
            imgEl.innerHTML = '';
        }
    };

    window.uploadImage = function(type) {
        var fileInput = document.getElementById('setting-verify-' + type + '-file');
        var file = fileInput.files[0];
        if (!file) return;

        var formData = new FormData();
        formData.append('file', file);

        fetch('/api/guilds/' + serverId + '/upload', {
            method: 'POST',
            credentials: 'include',
            body: formData
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.url) {
                var el = document.getElementById('setting-verify-' + type);
                el.value = data.url;
                updatePreview();
                checkDirty();
            } else {
                showToast(data.error || 'Upload failed', 'error');
            }
        })
        .catch(function() {
            showToast('Upload failed', 'error');
        });
    };

    window.resendEmbed = function() {
        var btn = document.getElementById('btn-resend-embed');
        var status = document.getElementById('resend-status');
        btn.disabled = true;
        status.textContent = 'Sending…';
        status.className = 'save-status';
        fetch('/api/guilds/' + serverId + '/verify-embed', { method: 'POST', credentials: 'include' })
            .then(function(r) { return r.json(); })
            .then(function(data) {
                if (data.success) {
                    status.textContent = 'Embed sent!';
                    status.className = 'save-status success';
                } else {
                    status.textContent = data.error || 'Failed';
                    status.className = 'save-status error';
                }
                btn.disabled = false;
                setTimeout(function() { status.textContent = ''; }, 3000);
            })
            .catch(function() {
                status.textContent = 'Failed to send.';
                status.className = 'save-status error';
                btn.disabled = false;
            });
    };

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
                document.getElementById('server-sub').textContent = 'Set up verification for ' + server.name;
                document.querySelector('title').textContent = server.name + ' Verification – Disc-Tools';
                document.getElementById('nav-overview').href = '/manage/' + serverId + '/overview';
                document.getElementById('nav-settings').href = '/manage/' + serverId + '/settings';
                document.getElementById('nav-verification').href = '/manage/' + serverId + '/verification';
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
