document.getElementById('year').textContent = new Date().getFullYear();

checkAuth().then(function(auth) {
    var headerRight = document.getElementById('header-right');
    if (headerRight) updateHeader(auth, headerRight);
});

(function() {
    var isGift = new URLSearchParams(window.location.search).has('gift');
    if (isGift) {
        document.getElementById('success-title').textContent = 'Gift Sent!';
        document.getElementById('success-text').innerHTML = 'Your gift has been sent. The recipient will receive a DM with their Premium perks and the role will be assigned automatically.';
        document.getElementById('success-btn').innerHTML = 'Back to Premium <i class="fa-solid fa-arrow-right"></i>';
        document.getElementById('success-btn').href = '/premium';
    }
})();
