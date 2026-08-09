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

function formatNum(n) {
    return n.toLocaleString();
}

function pctDiff(now, prev) {
    if (!prev || prev === 0) return { pct: 0, cls: 'neutral' };
    var pct = ((now - prev) / prev * 100);
    return {
        pct: pct,
        cls: pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral'
    };
}

function pctStr(diff) {
    if (diff.pct === 0) return '0%';
    var prefix = diff.pct > 0 ? '+' : '';
    return prefix + diff.pct.toFixed(1) + '%';
}

function setComp(id, now, prev) {
    var valEl = document.getElementById('comp-' + id + '-val');
    var diffEl = document.getElementById('comp-' + id);
    if (valEl) valEl.textContent = formatNum(now);
    if (diffEl) {
        var d = pctDiff(now, prev);
        diffEl.textContent = pctStr(d);
        diffEl.className = 'comp-diff ' + d.cls;
    }
}

function loadLiveStats() {
    if (window.__STATS_LIVE__) {
        var data = window.__STATS_LIVE__;
        document.getElementById('stat-servers').textContent = formatNum(data.servers || 0);
        document.getElementById('stat-community').textContent = formatNum(data.communityMembers || 0);
        document.getElementById('stat-total').textContent = formatNum(data.totalUsers || 0);
        return;
    }

    fetch('/api/stats')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            document.getElementById('stat-servers').textContent = formatNum(data.servers || 0);
            document.getElementById('stat-community').textContent = formatNum(data.communityMembers || 0);
            document.getElementById('stat-total').textContent = formatNum(data.totalUsers || 0);
        })
        .catch(function() {});
}

function drawLineChart(daysData) {
    var svg = document.querySelector('#chart-area svg');
    var labels = document.getElementById('chart-labels');
    var W = 800, H = 320, PAD_LEFT = 50, PAD_RIGHT = 16, PAD_TOP = 16, PAD_BOT = 20;
    var colors = { servers: '#9b59b6', community: '#7c3aed', total: '#c77dff' };
    var keys = ['servers', 'community', 'total'];

    var maxVal = 1;
    daysData.forEach(function(d) {
        keys.forEach(function(k) {
            maxVal = Math.max(maxVal, val(d, k));
        });
    });

    var magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
    var nice = Math.ceil(maxVal / magnitude) * magnitude;
    if (nice > 0 && nice < maxVal * 1.2) nice = Math.ceil(maxVal / (magnitude / 2)) * (magnitude / 2);
    if (nice > 0 && nice < maxVal * 1.1) nice = Math.ceil(maxVal / (magnitude / 5)) * (magnitude / 5);
    maxVal = nice || maxVal;

    function val(d, k) {
        if (k === 'total') return d.total_users || 0;
        return d[k] || d[k + '_members'] || 0;
    }

    function x(i) {
        return PAD_LEFT + (i / Math.max(daysData.length - 1, 1)) * (W - PAD_LEFT - PAD_RIGHT);
    }

    function y(v) {
        return H - PAD_BOT - (v / maxVal) * (H - PAD_TOP - PAD_BOT);
    }

    var paths = {};
    keys.forEach(function(k) { paths[k] = ''; });

    var pointsHtml = '';
    var pointIndex = 0;

    daysData.forEach(function(d, i) {
        keys.forEach(function(k) {
            var v = val(d, k);
            var px = x(i);
            var py = y(v);
            var cmd = (i === 0 ? 'M' : 'L') + ' ' + px.toFixed(1) + ' ' + py.toFixed(1);
            paths[k] += cmd;

            pointsHtml += '<g class="chart-point-group">' +
                '<circle class="chart-dot-hit" cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) +
                '" r="12" fill="transparent" data-idx="' + pointIndex + '"/>' +
                '<circle class="chart-dot" cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) +
                '" r="3" fill="' + colors[k] + '" opacity="0.9"/>' +
                '</g>';
            pointIndex++;
        });
    });

    var gridHtml = '';
    var axisLabels = '';
    for (var g = 0; g <= 4; g++) {
        var gy = H - PAD_BOT - (g / 4) * (H - PAD_TOP - PAD_BOT);
        var labelVal = Math.round((g / 4) * maxVal);
        gridHtml += '<line x1="' + PAD_LEFT + '" y1="' + gy.toFixed(1) + '" x2="' + (W - PAD_RIGHT) + '" y2="' + gy.toFixed(1) +
            '" stroke="#1e1e22" stroke-width="1"/>';
        axisLabels += '<text x="' + (PAD_LEFT - 8) + '" y="' + (gy + 4).toFixed(1) + '" text-anchor="end" fill="#52525b" font-size="9" font-family="Inter,sans-serif">' + formatNum(labelVal) + '</text>';
    }

    var pathHtml = '';
    keys.forEach(function(k) {
        if (paths[k]) {
            pathHtml += '<path d="' + paths[k] + '" fill="none" stroke="' + colors[k] + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>';
        }
    });

    var columnsHtml = '';
    daysData.forEach(function(d, i) {
        var cx = x(i);
        var colW = (W - PAD_LEFT - PAD_RIGHT) / Math.max(daysData.length - 1, 1);
        var left = cx - colW / 2;
        columnsHtml += '<rect class="chart-column" x="' + left.toFixed(1) + '" y="' + PAD_TOP + '" width="' + colW.toFixed(1) + '" height="' + (H - PAD_TOP - PAD_BOT).toFixed(1) + '" fill="transparent" data-idx="' + i + '"/>';
    });

    svg.innerHTML = gridHtml + axisLabels + columnsHtml + pathHtml + pointsHtml;

    var tooltip = document.getElementById('chart-tooltip');
    var columns = svg.querySelectorAll('.chart-column');
    var dayData = [];
    daysData.forEach(function(d, i) {
        var lines = [];
        keys.forEach(function(k) {
            var v = val(d, k);
            var label = k.charAt(0).toUpperCase() + k.slice(1);
            lines.push('<span style="display:flex;align-items:center;gap:4px"><span style="width:6px;height:6px;border-radius:50%;background:' + colors[k] + ';flex-shrink:0"></span>' + label + ': ' + formatNum(v) + '</span>');
        });
        var date = new Date(d.date);
        var lbl = date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
        dayData.push({ html: '<div style="font-weight:600;margin-bottom:3px">' + lbl + '</div>' + lines.join(''), cx: x(i) });
    });

    columns.forEach(function(col, idx) {
        if (idx >= dayData.length) return;
        col.addEventListener('mouseenter', function() {
            tooltip.innerHTML = dayData[idx].html;
            tooltip.hidden = false;
        });
        col.addEventListener('mousemove', function(e) {
            var rect = svg.getBoundingClientRect();
            var xPct = ((e.clientX - rect.left) / rect.width * 100);
            var yPct = ((e.clientY - rect.top) / rect.height * 100);
            tooltip.style.left = xPct + '%';
            tooltip.style.top = yPct + '%';
        });
        col.addEventListener('mouseleave', function() {
            tooltip.hidden = true;
        });
    });

    var labelHtml = '';
    daysData.forEach(function(d) {
        var date = new Date(d.date);
        var lbl = date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
        labelHtml += '<span>' + lbl + '</span>';
    });
    labels.innerHTML = labelHtml;
}

function processHistory(data, days) {
    var existing = data.days || [];
    var lookup = {};
    existing.forEach(function(d) {
        var key = d.date.split('T')[0];
        lookup[key] = d;
    });

    var filled = [];
    var today = new Date();
    for (var i = days - 1; i >= 0; i--) {
        var d = new Date(today);
        d.setDate(d.getDate() - i);
        var key = d.toISOString().split('T')[0];
        if (lookup[key]) {
            filled.push(lookup[key]);
        } else {
            filled.push({
                date: key,
                servers: 0,
                community_members: 0,
                total_users: 0
            });
        }
    }

    drawLineChart(filled);

    if (filled.length >= 2) {
        var latest = filled[filled.length - 1];
        var prev = filled[0];
        setComp('servers', latest.servers, prev.servers);
        setComp('community', latest.community_members, prev.community_members);
        setComp('total', latest.total_users, prev.total_users);
    }
}

function loadHistory(days) {
    document.getElementById('btn-7d').classList.toggle('active', days === 7);
    document.getElementById('btn-30d').classList.toggle('active', days === 30);

    var embedded;
    if (days === 7) embedded = window.__STATS_HISTORY_7__;
    if (days === 30) embedded = window.__STATS_HISTORY_30__;

    if (embedded) {
        processHistory(embedded, days);
        return;
    }

    fetch('/api/stats/history?days=' + days)
        .then(function(r) { return r.json(); })
        .then(function(data) {
            processHistory(data, days);
        })
        .catch(function() {});
}

// Buttons use inline onclick in HTML

loadLiveStats();
loadHistory(7);

(function() {
    var btn7 = document.getElementById('btn-7d');
    var btn30 = document.getElementById('btn-30d');
    if (btn7) btn7.addEventListener('click', function() { loadHistory(7); });
    if (btn30) btn30.addEventListener('click', function() { loadHistory(30); });
})();
