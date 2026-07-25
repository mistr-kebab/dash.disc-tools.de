document.getElementById('year').textContent = new Date().getFullYear();

checkAuth().then(function(auth) {
    var hr = document.getElementById('header-right');
    if (hr) updateHeader(auth, hr);
});
