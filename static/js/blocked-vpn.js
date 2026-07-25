(function() {
    var params = new URLSearchParams(window.location.search);
    var map = [
        ['det-ip', 'ip'],
        ['det-type', 'type'],
        ['det-provider', 'provider'],
        ['det-asn', 'asn']
    ];
    map.forEach(function(pair) {
        var el = document.getElementById(pair[0]);
        if (el) el.textContent = params.get(pair[1]) || '—';
    });
})();
