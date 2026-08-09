document.getElementById('year').textContent = new Date().getFullYear();

checkAuth().then(function(auth) {
    var hr = document.getElementById('header-right');
    if (hr) updateHeader(auth, hr);
});

var backBtn = document.querySelector('.btn-back');
if (backBtn) {
    backBtn.addEventListener('click', function() {
        if (history.length > 1) history.back();
        else window.location.href = '/';
    });
}
