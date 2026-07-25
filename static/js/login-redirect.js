var params = new URLSearchParams(window.location.search);
var code = params.get('code');
var state = params.get('state');
if (code) {
    var url = '/api/auth/callback?code=' + encodeURIComponent(code);
    if (state) url += '&state=' + encodeURIComponent(state);
    window.location.replace(url);
} else {
    document.querySelector('h2').textContent = 'Error';
    document.querySelector('p').textContent = 'No authorization code received.';
    document.querySelector('.success-spinner').style.display = 'none';
}
