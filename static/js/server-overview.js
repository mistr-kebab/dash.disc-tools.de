(function() {
    var path = window.location.pathname;
    var match = path.match(/^\/manage\/(\d+)\/overview\/?$/);
    var serverId = match ? match[1] : null;
    document.getElementById('server-sidebar-id').textContent = serverId || '—';

    function showBotMissingPanel(serverName, serverIcon, clientId) {
        var inviteUrl = 'https://discord.com/oauth2/authorize?client_id=' + (clientId || '1508899864602345582') + '&permissions=8&scope=bot&guild_id=' + serverId + '&disable_guild_select=true';
        document.getElementById('server-sidebar-name').textContent = serverName;
        document.getElementById('nav-overview').href = '/manage/' + serverId + '/overview';
        if (document.getElementById('nav-settings')) document.getElementById('nav-settings').href = '/manage/' + serverId + '/settings';
        if (document.getElementById('nav-verification')) document.getElementById('nav-verification').href = '/manage/' + serverId + '/verification';
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

    function fmt(n) {
        return typeof n === 'number' ? n.toLocaleString() : '—';
    }

    function drawChart(history) {
        var svg = document.getElementById('growth-svg');
        var tooltip = document.getElementById('growth-tooltip');
        if (!svg || !history || !history.length) return;

        var W = 800, H = 360, PAD_LEFT = 44, PAD_RIGHT = 16, PAD_TOP = 16, PAD_BOT = 32;
        var color = '#9b59b6';

        var maxVal = 1;
        history.forEach(function(d) { maxVal = Math.max(maxVal, d.member_count || 0); });
        var mag = Math.pow(10, Math.floor(Math.log10(maxVal)));
        var nice = Math.ceil(maxVal / mag) * mag;
        if (nice > 0 && nice < maxVal * 1.2) nice = Math.ceil(maxVal / (mag / 2)) * (mag / 2);
        maxVal = nice || maxVal;

        function x(i) { return PAD_LEFT + (i / Math.max(history.length - 1, 1)) * (W - PAD_LEFT - PAD_RIGHT); }
        function y(v) { return H - PAD_BOT - (v / maxVal) * (H - PAD_TOP - PAD_BOT); }

        var pathD = '';
        var pointsHtml = '';
        history.forEach(function(d, i) {
            var v = d.member_count || 0;
            var px = x(i), py = y(v);
            var cmd = (i === 0 ? 'M' : 'L') + ' ' + px.toFixed(1) + ' ' + py.toFixed(1);
            pathD += cmd;
            pointsHtml += '<g class="chart-point-group">' +
                '<circle class="chart-dot-hit" cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="14" fill="transparent" data-idx="' + i + '"/>' +
                '<circle class="chart-dot" cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="3" fill="' + color + '" opacity="0.9"/>' +
                '</g>';
        });

        var areaD = pathD + ' L ' + x(history.length - 1).toFixed(1) + ' ' + y(0) + ' L ' + x(0).toFixed(1) + ' ' + y(0) + ' Z';
        var areaHtml = '<path d="' + areaD + '" fill="url(#growthGrad)" opacity="0.25"/>';
        var gradHtml = '<defs><linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + color + '"/><stop offset="100%" stop-color="' + color + '" stop-opacity="0"/></linearGradient></defs>';

        var gridHtml = '';
        for (var g = 0; g <= 4; g++) {
            var gy = H - PAD_BOT - (g / 4) * (H - PAD_TOP - PAD_BOT);
            var labelVal = Math.round((g / 4) * maxVal);
            gridHtml += '<line x1="' + PAD_LEFT + '" y1="' + gy.toFixed(1) + '" x2="' + (W - PAD_RIGHT) + '" y2="' + gy.toFixed(1) + '" stroke="#1e1e22" stroke-width="1"/>';
            gridHtml += '<text x="' + (PAD_LEFT - 8) + '" y="' + (gy + 4).toFixed(1) + '" text-anchor="end" fill="#52525b" font-size="9" font-family="Inter,sans-serif">' + fmt(labelVal) + '</text>';
        }

        // X-axis labels inside SVG
        var labelHtml = '';
        var skipStep = Math.max(1, Math.floor(history.length / 6));
        history.forEach(function(d, i) {
            if (history.length > 6 && i % skipStep !== 0 && i !== history.length - 1) return;
            var cx = x(i);
            var date = new Date(d.date);
            var lbl = date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
            labelHtml += '<text x="' + cx.toFixed(1) + '" y="' + (H - 6).toFixed(1) + '" text-anchor="middle" fill="#52525b" font-size="9" font-family="Inter,sans-serif">' + lbl + '</text>';
        });

        var columnsHtml = '';
        history.forEach(function(d, i) {
            var cx = x(i);
            var colW = (W - PAD_LEFT - PAD_RIGHT) / Math.max(history.length - 1, 1);
            columnsHtml += '<rect class="chart-column" x="' + (cx - colW / 2).toFixed(1) + '" y="' + PAD_TOP + '" width="' + colW.toFixed(1) + '" height="' + (H - PAD_TOP - PAD_BOT).toFixed(1) + '" fill="transparent" data-idx="' + i + '"/>';
        });

        svg.innerHTML = gradHtml + gridHtml + areaHtml + '<path d="' + pathD + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>' + columnsHtml + pointsHtml + labelHtml;

        // Tooltip
        var columns = svg.querySelectorAll('.chart-column');
        columns.forEach(function(col, idx) {
            if (idx >= history.length) return;
            col.addEventListener('mouseenter', function() {
                var d = history[idx];
                var date = new Date(d.date);
                var lbl = date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
                tooltip.innerHTML = '<div style="font-weight:600;margin-bottom:2px">' + lbl + '</div>' + fmt(d.member_count || 0) + ' members';
                tooltip.hidden = false;
            });
            col.addEventListener('mousemove', function(e) {
                var rect = svg.getBoundingClientRect();
                tooltip.style.left = ((e.clientX - rect.left) / rect.width * 100) + '%';
                tooltip.style.top = ((e.clientY - rect.top) / rect.height * 100) + '%';
            });
            col.addEventListener('mouseleave', function() { tooltip.hidden = true; });
        });
    }

    function loadGrowthChart(days) {
        document.getElementById('btn-3d').classList.toggle('active', days === 3);
        document.getElementById('btn-7d').classList.toggle('active', days === 7);
        document.getElementById('btn-30d').classList.toggle('active', days === 30);

        var fetchDays = days * 2;
        fetch('/api/guilds/' + serverId + '/stats?days=' + fetchDays, { credentials: 'include' })
            .then(function(r) { return r.json(); })
            .then(function(data) {
                var history = data.history || [];
                var lookup = {};
                history.forEach(function(d) { lookup[d.date.split('T')[0]] = d; });

                var filled = [];
                var today = new Date();
                for (var i = fetchDays - 1; i >= 0; i--) {
                    var d = new Date(today);
                    d.setDate(d.getDate() - i);
                    var key = d.toISOString().split('T')[0];
                    if (lookup[key]) {
                        filled.push(lookup[key]);
                    } else {
                        filled.push({ date: key, member_count: 0 });
                    }
                }

                var prevFilled = filled.slice(0, days);
                var currFilled = filled.slice(days);
                drawChart(currFilled);

                var firstReal = null;
                var lastReal = null;
                for (var hi = 0; hi < prevFilled.length; hi++) {
                    if (prevFilled[hi].member_count > 0) { firstReal = prevFilled[hi].member_count; break; }
                }
                for (var hi = prevFilled.length - 1; hi >= 0; hi--) {
                    if (prevFilled[hi].member_count > 0) { lastReal = prevFilled[hi].member_count; break; }
                }

                var change;
                var pct;
                var cls;
                var pctEl = document.getElementById('growth-pct');
                var changeEl = document.getElementById('growth-change');

                if (firstReal && lastReal && firstReal > 0) {
                    change = lastReal - firstReal;
                    pct = (change / firstReal * 100).toFixed(1);
                    cls = change > 0 ? 'up' : change < 0 ? 'down' : '';
                    if (pctEl) {
                        pctEl.textContent = (pct >= 0 ? '+' : '') + pct + '%';
                        pctEl.className = 'chart-stat-value ' + cls;
                    }
                    if (changeEl) {
                        changeEl.textContent = (change >= 0 ? '+' : '') + fmt(change);
                        changeEl.className = 'chart-stat-value ' + cls;
                    }
                } else {
                    if (pctEl) { pctEl.textContent = '\u2014'; pctEl.className = 'chart-stat-value'; }
                    if (changeEl) { changeEl.textContent = '\u2014'; changeEl.className = 'chart-stat-value'; }
                }

                var peak = 0;
                for (var hi = 0; hi < currFilled.length; hi++) {
                    var v = currFilled[hi].member_count;
                    if (v > peak) peak = v;
                }
                var peakEl = document.getElementById('growth-peak');
                if (peakEl) peakEl.textContent = fmt(peak);

                var botsEl = document.getElementById('growth-bots');
                if (botsEl) botsEl.textContent = fmt(data.botCount);
            })
            .catch(function() {});
    }

    window.loadGrowthChart = loadGrowthChart;

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
                document.getElementById('server-sub').textContent = 'Manage ' + server.name;
                document.querySelector('title').textContent = server.name + ' – Disc-Tools';
                document.getElementById('nav-overview').href = '/manage/' + serverId + '/overview';
                var ns = document.getElementById('nav-settings');
                if (ns) ns.href = '/manage/' + serverId + '/settings';
                var nv = document.getElementById('nav-verification');
                if (nv) nv.href = '/manage/' + serverId + '/verification';

                document.getElementById('stat-members').textContent = fmt(server.memberCount);
                document.getElementById('stat-roles').textContent = fmt(server.roleCount);
                document.getElementById('stat-boosts').textContent = fmt(server.boostCount);
                document.getElementById('stat-online').textContent = fmt(server.onlineCount);

                loadGrowthChart(7);

                if (server.icon) {
                    var isAnimated = server.icon.startsWith('a_');
                    var base = 'https://cdn.discordapp.com/icons/' + serverId + '/' + server.icon;
                    document.getElementById('server-sidebar-icon').innerHTML = '<img src="' + base + '.' + (isAnimated ? 'gif' : 'png') + '" alt="' + server.name + '">';
                }
            });
    });
})();
