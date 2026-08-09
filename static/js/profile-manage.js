async function loadManagePage() {
    var auth = await checkAuth();
    if (!auth.authenticated || !auth.user) return;

    var loading = document.getElementById('manage-loading');
    var content = document.getElementById('manage-content');

    try {
        var res = await fetch('/api/premium/status/' + auth.user.id);
        var data = await res.json();

        loading.style.display = 'none';
        content.style.display = '';

        if (data.premium && data.active) {
            var isGift = data.gifted_by && !data.stripe_subscription_id;
            document.getElementById('manage-plan').innerHTML = '<i class="fa-solid fa-crown" style="color:#9b59b6;"></i> Disc-Tools Premium';
            document.getElementById('manage-price').textContent = isGift ? 'Gifted' : '€5/month';
            document.getElementById('manage-badge').textContent = 'Active';
            document.getElementById('manage-badge').className = 'premium-badge active';
            document.getElementById('manage-next').textContent = data.expires_at ? new Date(data.expires_at).toLocaleDateString() : '-';
            document.getElementById('manage-subtitle').textContent = isGift ? 'Your Premium was gifted.' : 'Your subscription is active.';
            document.getElementById('manage-expires-row').style.display = '';
            document.getElementById('manage-expires').textContent = data.expires_at ? new Date(data.expires_at).toLocaleDateString() : '-';

            if (isGift) {
                document.getElementById('card-cancel').style.display = 'none';
                document.getElementById('card-portal').style.display = 'none';
                document.getElementById('manage-billing-row').style.display = 'none';
            }
        } else if (data.premium) {
            document.getElementById('manage-plan').innerHTML = '<i class="fa-solid fa-crown" style="color:#52525b;"></i> Disc-Tools Premium';
            document.getElementById('manage-price').textContent = 'Expired';
            document.getElementById('manage-badge').textContent = 'Expired';
            document.getElementById('manage-badge').className = 'premium-badge expired';
            document.getElementById('manage-next').textContent = '-';
            document.getElementById('manage-subtitle').textContent = 'Your premium has expired. Resubscribe anytime.';
            document.getElementById('card-cancel').style.display = 'none';
        } else {
            document.getElementById('manage-plan').textContent = 'No active subscription';
            document.getElementById('manage-price').textContent = 'You are not a Premium member.';
            document.getElementById('manage-badge').textContent = 'Inactive';
            document.getElementById('manage-badge').className = 'premium-badge expired';
            document.getElementById('manage-next').textContent = '-';
            document.getElementById('manage-subtitle').textContent = 'Subscribe to unlock Premium features.';
            document.getElementById('card-cancel').style.display = 'none';
            document.getElementById('card-portal').style.display = 'none';
        }
    } catch (e) {
        loading.innerHTML = '<div class="setting-row"><div class="setting-info"><div class="setting-label">Failed to load.</div></div></div>';
    }
}

async function openPortal() {
    var auth = await checkAuth();
    if (!auth.authenticated || !auth.user) return;
    var btn = document.getElementById('btn-portal');
    btn.disabled = true;
    btn.innerHTML = 'Loading…';
    try {
        var res = await fetch('/api/premium/create-portal-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: auth.user.id, returnUrl: window.location.href })
        });
        var data = await res.json();
        if (data.url) window.location.href = data.url;
        else alert(data.error || 'Failed to open portal.');
        btn.disabled = false;
        btn.innerHTML = 'Open Portal <i class="fa-solid fa-arrow-up-right-from-square"></i>';
    } catch (e) {
        btn.disabled = false;
        btn.innerHTML = 'Open Portal <i class="fa-solid fa-arrow-up-right-from-square"></i>';
    }
}

async function cancelSubscription() {
    if (!confirm('Are you sure you want to cancel your Premium subscription? You will lose access at the end of your billing period.')) return;
    var auth = await checkAuth();
    if (!auth.authenticated || !auth.user) return;
    var btn = document.getElementById('btn-cancel');
    btn.disabled = true;
    btn.innerHTML = 'Cancelling…';
    try {
        var res = await fetch('/api/premium/cancel-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: auth.user.id })
        });
        var data = await res.json();
        if (data.success) {
            btn.innerHTML = 'Cancelled <i class="fa-solid fa-check"></i>';
            document.getElementById('manage-badge').textContent = 'Cancelling';
            document.getElementById('manage-badge').className = 'premium-badge expired';
            document.getElementById('manage-subtitle').textContent = 'Your subscription will end at the end of the billing period.';
        } else {
            alert(data.error || 'Failed to cancel.');
            btn.disabled = false;
            btn.innerHTML = 'Cancel <i class="fa-solid fa-xmark"></i>';
        }
    } catch (e) {
        btn.disabled = false;
        btn.innerHTML = 'Cancel <i class="fa-solid fa-xmark"></i>';
    }
}

loadManagePage();

(function() {
    var portal = document.getElementById('btn-portal');
    var cancel = document.getElementById('btn-cancel');
    if (portal) portal.addEventListener('click', openPortal);
    if (cancel) cancel.addEventListener('click', cancelSubscription);
})();
