document.getElementById('year').textContent = new Date().getFullYear();

var verifiedRecipientId = null;

function showToast(msg, type) {
    var t = document.getElementById('toast');
    var ic = t.querySelector('i');
    document.getElementById('toast-msg').textContent = msg;
    ic.className = type === 'ok'
        ? 'fa-solid fa-circle-check'
        : 'fa-solid fa-circle-info';
    ic.style.color = type === 'ok' ? '#2ecc71' : '#9b59b6';
    t.classList.add('show');
    setTimeout(function() { t.classList.remove('show'); }, 3800);
}

function toggleCard(id) {
    var body = document.getElementById('body-' + id.replace('card-', ''));
    var chevron = document.getElementById('chevron-' + id.replace('card-', ''));
    var isOpen = body.classList.contains('open');

    document.querySelectorAll('.p-card-body').forEach(function(b) { b.classList.remove('open'); });
    document.querySelectorAll('.p-card-chevron').forEach(function(c) { c.classList.remove('open'); });

    if (!isOpen) {
        body.classList.add('open');
        chevron.classList.add('open');
    }
}

checkAuth().then(function(auth) {
    var headerRight = document.getElementById('header-right');
    if (headerRight) updateHeader(auth, headerRight);

    if (!auth.authenticated) {
        document.getElementById('login-notice').style.display = 'flex';
    }
    if (auth.authenticated && auth.user) {
        var nav = document.getElementById('nav-servers');
        if (nav) {
            nav.href = '/my-servers';
            nav.style.display = '';
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('body-sub').classList.add('open');
    document.getElementById('chevron-sub').classList.add('open');
});

async function startCheckout() {
    var btn = document.getElementById('btn-buy');
    btn.disabled = true;
    btn.innerHTML = 'Redirecting <i class="fa-solid fa-spinner fa-spin"></i>';
    try {
        var auth = await checkAuth();
        if (!auth.authenticated || !auth.user) {
            showToast('Please log in with Discord first.');
            btn.disabled = false;
            btn.innerHTML = 'Subscribe Now <i class="fa-solid fa-arrow-right"></i>';
            return;
        }
        var res  = await fetch('/api/premium/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: auth.user.id,
                successUrl: window.location.origin + '/premium/success',
                cancelUrl:  window.location.href
            })
        });
        var data = await res.json();
        if (data.url) {
            window.location.href = data.url;
        } else {
            showToast(data.error || 'Failed to start checkout.');
            btn.disabled = false;
            btn.innerHTML = 'Subscribe Now <i class="fa-solid fa-arrow-right"></i>';
        }
    } catch (e) {
        showToast('An error occurred. Please try again.');
        btn.disabled = false;
        btn.innerHTML = 'Subscribe Now <i class="fa-solid fa-arrow-right"></i>';
    }
}

async function checkRecipient() {
    var btn = document.getElementById('btn-check');
    var input = document.getElementById('gift-recipient');
    var card = document.getElementById('gift-user-card');
    var id = input.value.trim();

    if (!id || !/^\d{17,20}$/.test(id)) {
        showToast('Enter a valid Discord User ID (17–20 digits).');
        return;
    }
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking';

    try {
        var auth = await checkAuth();
        if (!auth.authenticated) {
            showToast('Please log in first.');
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Lookup';
            return;
        }
        var res = await fetch('/api/premium/lookup-user/' + id);
        if (!res.ok) {
            showToast('User not found. Double-check the ID.');
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Lookup';
            return;
        }
        var user = await res.json();
        document.getElementById('gift-avatar').src = user.avatar;
        document.getElementById('gift-name').textContent = user.globalName || user.username;
        document.getElementById('gift-username').textContent = '@' + user.username;
        var badge = document.getElementById('gift-badge');
        badge.textContent = user.inGuild ? 'In Server' : 'Not in Server';
        badge.className = 'guild-badge ' + (user.inGuild ? 'in' : 'out');
        verifiedRecipientId = id;
        card.style.display = 'flex';
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Lookup';
    } catch (e) {
        showToast('Failed to look up user.');
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Lookup';
    }
}

async function startGiftCheckout() {
    var btn = document.getElementById('btn-confirm-gift');
    if (!verifiedRecipientId) { showToast('Verify recipient first.'); return; }
    btn.disabled = true;
    btn.innerHTML = 'Processing <i class="fa-solid fa-spinner fa-spin"></i>';
    try {
        var auth = await checkAuth();
        if (!auth.authenticated || !auth.user) {
            showToast('Please log in first.');
            btn.disabled = false;
            btn.innerHTML = 'Pay &amp; Gift <i class="fa-solid fa-gift"></i>';
            return;
        }
        var res = await fetch('/api/premium/create-gift-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                buyerId: auth.user.id,
                recipientId: verifiedRecipientId,
                successUrl: window.location.origin + '/premium/success?gift=1',
                cancelUrl: window.location.href
            })
        });
        var data = await res.json();
        if (data.url) {
            window.location.href = data.url;
        } else {
            showToast(data.error || 'Failed to start gift checkout.');
            btn.disabled = false;
            btn.innerHTML = 'Pay &amp; Gift <i class="fa-solid fa-gift"></i>';
        }
    } catch (e) {
        showToast('An error occurred.');
        btn.disabled = false;
        btn.innerHTML = 'Pay &amp; Gift <i class="fa-solid fa-gift"></i>';
    }
}
