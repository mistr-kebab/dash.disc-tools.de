document.getElementById('year').textContent = new Date().getFullYear();

function showState(id) {
    document.querySelectorAll('#state-login, #state-loading, #state-error, #state-servers').forEach(function(el) {
        el.classList.remove('state-active');
    });
    document.getElementById(id).classList.add('state-active');
}

function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function serverIcon(id, icon, name) {
    if (icon) {
        var ext = icon.startsWith('a_') ? 'gif' : 'png';
        return '<img src="https://cdn.discordapp.com/icons/' + id + '/' + icon + '.' + ext + '?size=64" alt="" class="server-icon-img">';
    }
    var initials = name.replace(/['\u2019]/g, '').split(/[^a-zA-Z0-9]+/).filter(Boolean).slice(0, 2).map(function(w) { return w[0].toUpperCase(); }).join('');
    return '<div class="server-icon-text">' + initials + '</div>';
}

function renderServers(data) {
    var otherServers = data.servers || [];
    var botServers = data.botServers || [];
    var total = otherServers.length + botServers.length;

    document.getElementById('server-count').textContent = 'You manage ' + total + ' server' + (total !== 1 ? 's' : '') + '.';

    var html = '';

    if (otherServers.length > 0) {
        html += '<div class="server-section"><h3 class="server-section-title"><i class="fa-solid fa-circle-plus"></i> Available to invite</h3>';
        otherServers.forEach(function(s) {
            html += '<div class="server-row">' +
                '<div class="server-row-left">' +
                    serverIcon(s.id, s.icon, s.name) +
                    '<span class="server-name">' + escapeHtml(s.name) + '</span>' +
                    (s.owner ? '<span class="server-badge owner">Owner</span>' : '') +
                '</div>' +
                '<a class="btn-invite" href="https://discord.com/oauth2/authorize?client_id=' + data.clientId + '&permissions=8&response_type=code&redirect_uri=' + encodeURIComponent('https://dash.disc-tools.de/success/invite') + '&integration_type=0&scope=bot+guilds.join+identify&guild_id=' + s.id + '&disable_guild_select=true" target="_blank">' +
                    '<i class="fa-solid fa-plus"></i> Add Bot' +
                '</a>' +
            '</div>';
        });
        html += '</div>';
    }

    if (botServers.length > 0) {
        html += '<div class="server-section"><h3 class="server-section-title"><i class="fa-solid fa-circle-check"></i> Bot already added</h3>';
        botServers.forEach(function(s) {
            html += '<div class="server-row">' +
                '<div class="server-row-left">' +
                    serverIcon(s.id, s.icon, s.name) +
                    '<span class="server-name">' + escapeHtml(s.name) + '</span>' +
                    (s.owner ? '<span class="server-badge owner">Owner</span>' : '') +
                '</div>' +
                '<span class="server-added"><i class="fa-solid fa-check"></i> Added</span>' +
            '</div>';
        });
        html += '</div>';
    }

    if (total === 0) {
        html = '<div class="invite-empty"><i class="fa-solid fa-folder-open"></i><p>No servers found where you have the <strong>Manage Server</strong> permission.</p><p class="invite-empty-sub">You need to be a server admin to invite the bot.</p></div>';
    }

    document.getElementById('server-list').innerHTML = html;
    showState('state-servers');
}

checkAuth().then(function(auth) {
    var headerRight = document.getElementById('header-right');
    if (headerRight) updateHeader(auth, headerRight);

    if (!auth.authenticated || !auth.user) {
        return showState('state-login');
    }

    showState('state-loading');

    fetch('/api/servers', { credentials: 'include' })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!data.authenticated || data.error === 'no_access_token') {
                return showState('state-login');
            }
            renderServers(data);
        })
        .catch(function() {
            showState('state-error');
        });
});
