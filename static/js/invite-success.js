document.getElementById('year').textContent = new Date().getFullYear();

checkAuth().then(function(auth) {
    var headerRight = document.getElementById('header-right');
    if (headerRight) updateHeader(auth, headerRight);
});

(async function() {
    var params = new URLSearchParams(window.location.search);
    var code = params.get('code');

    if (code) {
        try {
            var res = await fetch('/api/invite/bot/callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code })
            });
            var data = await res.json();

            document.getElementById('processing-state').classList.remove('state-active');

            if (res.ok && data.success) {
                document.getElementById('user-name').textContent = data.user ? (data.user.global_name || data.user.username) : '—';
                document.getElementById('server-name').textContent = data.guild ? data.guild.name : 'Disc-Tools';
                document.getElementById('success-state').classList.add('state-active');
                history.replaceState({}, '', '/success/invite');
                setTimeout(function() { window.location.href = '/my-servers'; }, 2500);
            } else {
                document.getElementById('error-desc').textContent = data.error || 'Bot may be offline.';
                document.getElementById('error-state').classList.add('state-active');
            }
        } catch (e) {
            document.getElementById('processing-state').classList.remove('state-active');
            document.getElementById('error-desc').textContent = 'Connection error.';
            document.getElementById('error-state').classList.add('state-active');
        }
    } else {
        document.getElementById('processing-state').classList.remove('state-active');
        document.getElementById('error-desc').textContent = 'No authorization code received.';
        document.getElementById('error-state').classList.add('state-active');
    }
})();
