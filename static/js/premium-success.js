document.getElementById('year').textContent = new Date().getFullYear();

checkAuth().then(function(auth) {
    var headerRight = document.getElementById('header-right');
    if (headerRight) updateHeader(auth, headerRight);
});

(function() {
    var params = new URLSearchParams(window.location.search);
    if (params.has('onetime')) {
        document.getElementById('success-title').textContent = 'Premium Activated!';
        document.getElementById('success-text').innerHTML = 'Your <strong>1 month of Disc-Tools Premium</strong> is now active. Check your DMs for the confirmation and join the server to get your role automatically.';
        document.getElementById('success-btn').innerHTML = 'Back to Premium <i class="fa-solid fa-arrow-right"></i>';
        document.getElementById('success-btn').href = '/premium';
        return;
    }
    var isGift = params.has('gift');
    if (isGift) {
        document.getElementById('success-title').textContent = 'Gift Sent!';
        document.getElementById('success-text').innerHTML = 'Your gift has been sent. The recipient will receive a DM with their Premium perks and the role will be assigned automatically.';
        document.getElementById('success-btn').innerHTML = 'Back to Premium <i class="fa-solid fa-arrow-right"></i>';
        document.getElementById('success-btn').href = '/premium';
    }
})();
