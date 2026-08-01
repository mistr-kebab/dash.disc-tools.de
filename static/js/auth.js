let scrollTimer;

function handleScroll() {
    const header = document.querySelector('header');
    if (!header) return;
    if (window.scrollY > 1) {
        header.classList.add('header-scrolled');
    } else {
        header.classList.remove('header-scrolled');
    }
}

document.addEventListener('scroll', function() {
    if (scrollTimer) cancelAnimationFrame(scrollTimer);
    scrollTimer = requestAnimationFrame(handleScroll);
}, { passive: true });

handleScroll();

async function checkAuth() {
    if (window.__AUTH__) {
        return window.__AUTH__;
    }
    try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        return await res.json();
    } catch {
        return { authenticated: false };
    }
}

function updateHeader(auth, headerRight) {
    if (auth.authenticated) {
        const name = auth.user.global_name || auth.user.username;
        const avatarHash = auth.user.avatar;
        const isAnimated = avatarHash && avatarHash.startsWith('a_');
        const base = avatarHash
            ? `https://cdn.discordapp.com/avatars/${auth.user.id}/${avatarHash}`
            : null;

        const avatarHtml = base
            ? `<picture><source srcset="${base}.gif" type="image/gif"><source srcset="${base}.webp" type="image/webp"><source srcset="${base}.png" type="image/png"><img class="user-avatar" src="${base}.${isAnimated ? 'gif' : 'png'}" alt="${name}"></picture>`
            : '<img class="user-avatar" src="https://cdn.discordapp.com/embed/avatars/0.png" alt="">';

        headerRight.innerHTML = `
            <div class="user-menu">
                <button class="user-menu-btn">
                    ${avatarHtml}
                    <span class="user-name">${name}</span>
                    <i class="fa-solid fa-caret-down"></i>
                </button>
                <div class="user-dropdown">
                    <a href="/profile"><i class="fa-solid fa-user"></i> Profile</a>
                    <a href="/my-servers"><i class="fa-solid fa-server"></i> My Servers</a>
                    <div class="dropdown-divider"></div>
                    <button class="logout-btn"><i class="fa-solid fa-arrow-right-from-bracket"></i> Logout</button>
                </div>
            </div>
        `;

        const btn = headerRight.querySelector('.user-menu-btn');
        btn.addEventListener('click', toggleMenu);

        const logoutBtn = headerRight.querySelector('.logout-btn');
        logoutBtn.addEventListener('click', logout);

        const avatarImg = headerRight.querySelector('.user-avatar');
        if (base) {
            avatarImg.addEventListener('error', function() {
                this.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
            }, { once: true });
        }
    } else {
        headerRight.innerHTML = `
            <a class="btn-discord" href="/api/auth/login">
                <i class="fa-brands fa-discord"></i>
                Login
            </a>
        `;
    }
}

function toggleMenu(event) {
    event.stopPropagation();
    const btn = event.currentTarget;
    const dd = btn.nextElementSibling;
    const open = dd.classList.toggle('open');
    btn.classList.toggle('open', open);
    if (open) {
        document.addEventListener('click', closeMenu, { once: true });
    }
}

function closeMenu(e) {
    const dd = document.querySelector('.user-dropdown.open');
    const btn = document.querySelector('.user-menu-btn.open');
    if (dd && !dd.contains(e.target) && btn && !btn.contains(e.target)) {
        dd.classList.remove('open');
        btn.classList.remove('open');
    }
}

async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/success/logout';
}
