# Contributing to Disc-Tools Dashboard

Thanks for considering a contribution.

## Setup

This is a vanilla HTML/CSS/JS project — no build tools or package manager needed. Just clone and open any `.html` file to work locally.

The dashboard connects to a [Node.js/Express backend](https://github.com/mistr-kebab/disc-tools-bot) running on port 3005. For local development you can either use the live API or run the backend yourself.

## Component System

Reusable UI blocks (header, footer) are managed through `static/js/components.js`. Pages should use the `<template-header>` and `<template-footer>` placeholder elements instead of duplicating the markup:

```html
<body>
  <template-header></template-header>
  <!-- page content -->
  <template-footer></template-footer>
  <script src="/static/js/components.js"></script>
</body>
```

### Available templates

| Custom Element | Behavior |
|---------------|----------|
| `<template-header data-page="home">` | Renders the site header, highlights the `data-page` nav link |
| `<template-footer data-page="home">` | Renders the full footer with legal links |

Data page values: `home`, `premium`, `stats`, `my-servers`

## Code Style

- **2-space indentation**, no tabs
- **Single quotes** in JavaScript
- **CSS** uses the existing conventions in `static/css/` (kebab-case, no ID selectors)
- **Vanilla JS only** — no frameworks or libraries beyond what's already loaded
- **No inline styles** — use CSS classes from the existing stylesheets
- **No inline event handlers** — use `addEventListener` in the JS files

## File Naming

- HTML pages: `kebab-case/index.html` (e.g. `manage/overview/index.html`)
- CSS: `static/css/<feature>.css`
- JavaScript: `static/js/<feature>.js`
- Images: `static/assets/img/<name>.png`

## PR Checklist

- [ ] HTML passes `html5validator`
- [ ] CSS matches existing conventions
- [ ] JS passes `node -c` syntax check
- [ ] No new inline styles or inline event handlers
- [ ] Header/footer use the `<template-header>` / `<template-footer>` pattern
- [ ] Page works in Chrome, Firefox, and mobile Safari

## Questions?

Open an issue or ask in the [Discord support server](https://discord.gg/rtRs8rhj5u).
