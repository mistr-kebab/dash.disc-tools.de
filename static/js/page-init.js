document.getElementById('year').textContent = new Date().getFullYear();

checkAuth().then(function(auth) {
    var hr = document.getElementById('header-right');
    if (hr) updateHeader(auth, hr);

    if (auth.authenticated && auth.user) {
        var nav = document.getElementById('nav-servers');
        if (nav) {
            nav.href = '/my-servers';
            nav.classList.remove('hidden');
        }
    }
});
