document.getElementById('year').textContent = new Date().getFullYear();

var nav = document.getElementById('nav-servers');
if (nav) nav.href = '/my-servers';

function iconHtml(id, icon, name) {
    if (!icon) return '<div class="server-icon"><i class="fa-solid fa-server"></i></div>';
    var hash = icon;
    var isAnimated = hash.startsWith('a_');
    var base = 'https://cdn.discordapp.com/icons/' + id + '/' + hash;
    return '<div class="server-icon"><picture>'
        + (isAnimated ? '<source srcset="' + base + '.gif" type="image/gif">' : '')
        + '<source srcset="' + base + '.webp" type="image/webp">'
        + '<source srcset="' + base + '.png" type="image/png">'
        + '<img src="' + base + '.' + (isAnimated ? 'gif' : 'png') + '" alt="' + name + '"></picture></div>';
}

function renderServers(data) {
    var area = document.getElementById('content-area');
    var html = '<div class="server-grid">';

    if (data.botServers && data.botServers.length > 0) {
        html += '<div class="servers-section">'
            + '<h2><i class="fa-solid fa-check-circle status-icon success"></i> My Servers with Disc-Tools <span class="count">(' + data.botServers.length + ')</span></h2>'
            + '<div class="server-grid-inner">';
        for (var i = 0; i < data.botServers.length; i++) {
            var s = data.botServers[i];
            html += '<div class="server-card">'
                + iconHtml(s.id, s.icon, s.name)
                + '<div class="server-info"><div class="name">' + escHtml(s.name) + '</div><div class="meta">Disc-Tools is here</div></div>'
                + '<div class="server-action"><a class="btn-manage" href="/manage/' + s.id + '/overview">Manage</a></div>'
                + '</div>';
        }
        html += '</div></div>';
    }

    if (data.servers && data.servers.length > 0) {
        if (data.botServers && data.botServers.length > 0) {
            html += '<hr class="section-divider">';
        }
        html += '<div class="servers-section">'
            + '<h2><i class="fa-solid fa-plus-circle status-icon accent"></i> Other Servers <span class="count">(' + data.servers.length + ')</span></h2>'
            + '<div class="server-grid-inner">';
        for (var j = 0; j < data.servers.length; j++) {
            var sv = data.servers[j];
            var inviteUrl = 'https://discord.com/oauth2/authorize?client_id=' + data.clientId + '&scope=bot&permissions=0&guild_id=' + sv.id + '&disable_guild_select=true';
            html += '<div class="server-card">'
                + iconHtml(sv.id, sv.icon, sv.name)
                + '<div class="server-info"><div class="name">' + escHtml(sv.name) + '</div><div class="meta">Invite Disc-Tools</div></div>'
                + '<div class="server-action"><a class="btn-invite" href="' + inviteUrl + '" target="_blank">Invite</a></div>'
                + '</div>';
        }
        html += '</div></div>';
    }

    if ((!data.botServers || data.botServers.length === 0) && (!data.servers || data.servers.length === 0)) {
        html += '<div class="empty-state"><i class="fa-solid fa-users"></i><p>No servers with matching permissions found.<br>You need the <strong>Manage Server</strong> permission.</p></div>';
    }

    html += '</div>';
    area.innerHTML = html;
}

function escHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

checkAuth().then(function(auth) {
    var r = document.getElementById('header-right');
    if (r) updateHeader(auth, r);

    if (!auth.authenticated) {
        document.getElementById('content-area').innerHTML =
            '<div class="server-card server-card-empty">' +
                '<div class="server-empty-icon"><i class="fa-solid fa-lock"></i></div>' +
                '<h2 class="server-empty-title">Not signed in</h2>' +
                '<p class="server-empty-text">Please log in to view your servers.</p>' +
                '<a class="btn-discord" href="/api/auth/login"><i class="fa-brands fa-discord"></i> Login</a>' +
            '</div>';
        return;
    }

    var loadStart = Date.now();
    fetch('/api/servers', { credentials: 'include' })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            var elapsed = Date.now() - loadStart;
            var remaining = Math.max(0, 350 - elapsed);
            setTimeout(function() {
                if (data.error === 'no_access_token') {
                    document.getElementById('content-area').innerHTML = '<div class="empty-state"><i class="fa-solid fa-key"></i><p>Please log in again to see your servers.</p><a class="btn-discord" href="/api/auth/login"><i class="fa-brands fa-discord"></i> Login</a></div>';
                    return;
                }
                renderServers(data);
            }, remaining);
        })
        .catch(function() {
            document.getElementById('content-area').innerHTML = '<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><p>Failed to load servers. Please try again later.</p></div>';
        });
});
