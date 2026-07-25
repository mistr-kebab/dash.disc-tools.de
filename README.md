# Disc-Tools Dashboard

[![Dashboard](https://img.shields.io/badge/Dashboard-dash.disc--tools.de-5865f2?style=flat-square&logo=discord)](https://dash.disc-tools.de)
[![Website](https://img.shields.io/badge/Website-disc--tools.de-5865f2?style=flat-square)](https://disc-tools.de)
[![Discord](https://img.shields.io/badge/Discord-Join%20Server-5865f2?style=flat-square&logo=discord)](https://discord.gg/rtRs8rhj5u)
[![Top.gg](https://img.shields.io/badge/Top.gg-Vote%20for%20us-5865f2?style=flat-square)](https://top.gg/bot/1508899864602345582)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)

Web dashboard for the [Disc-Tools](https://disc-tools.de) Discord bot — manage servers, configure verification, handle Premium subscriptions, and more.

## Features

- **Server Management** — View member counts, growth charts, online stats
- **Verification** — Configure verification channels, roles, and embed customization with live preview
- **Audit Logging** — Log dashboard settings changes to a Discord channel
- **Premium** — Subscribe via Stripe, manage billing, gift Premium to others
- **Authentication** — Discord OAuth2 login with session management
- **Bot Invite** — One-click invite flow with guild pre-selection

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML/CSS/JS (no framework) |
| Icons | Font Awesome 6 |
| Fonts | Inter (variable) |
| Backend | Node.js / Express (separate repo) |
| Auth | Discord OAuth2 + JWT cookies |
| Payments | Stripe |

## Getting Started

1. **Invite the bot** — Go to [/invite](https://dash.disc-tools.de/invite) and add Disc-Tools to your server.
2. **Log in** — Sign in with Discord via OAuth2.
3. **Manage servers** — Visit [My Servers](https://dash.disc-tools.de/my-servers) and configure each server.

## Directory Structure

```
.
├── index.html              # Landing page
├── manage/                  # Server management pages
│   ├── overview/            # Stats, member growth chart
│   ├── settings/            # Audit log channel config
│   └── verification/        # Verification setup & embed preview
├── profile/                 # User profile pages
│   ├── billing/             # Premium subscription management
│   ├── general/overview/    # User overview
│   ├── security/sessions/   # Login session management
│   └── settings/            # User preferences
├── invite/                  # Bot invite page
├── premium/                 # Premium subscription page
├── stats/                   # Public bot statistics
├── blocked/                 # Access-denied pages
├── legal/                   # Imprint, privacy, terms, refund policy
├── success/                 # Post-action confirmation pages
├── static/                  # Assets (CSS, JS, fonts, icons, images)
├── .github/workflows/       # CI/CD pipeline
├── .env.example             # Environment variable template
├── CONTRIBUTING.md          # Contribution guidelines
└── LICENSE                  # MIT license
```

## Commands (Disc-Tools Bot)

| Command | Description |
|---------|-------------|
| `/avatar` | Get avatar CDN URLs |
| `/banner` | Get banner CDN URLs |
| `/color` | Hex to RGB/HSL color conversion |
| `/embed` | Create & preview rich message embeds |
| `/emoji` | Extract & download custom emojis/stickers |
| `/invite-lookup` | Look up Discord invite details |
| `/markdown` | Generate formatted Discord messages |
| `/nitro-check` | Verify Nitro gift link validity |
| `/server-lookup` | Look up public server info |
| `/snowflake` | Decode Discord IDs to timestamps |
| `/timestamp` | Convert date/time to Discord formats |
| `/webhook` | Create, send & manage webhook messages |
| `/quote` | Generate animated quote GIF |
| `/alt` | Alt account detection (Premium) |

## Environment Variables (Backend)

| Variable | Description |
|----------|-------------|
| `DISCORD_CLIENT_ID` | Discord bot application ID |
| `DISCORD_CLIENT_SECRET` | Discord OAuth2 secret |
| `DISCORD_BOT_TOKEN` | Discord bot token |
| `STRIPE_SECRET_KEY` | Stripe API key for payments |
| `JWT_SECRET` | Secret for dashboard JWT tokens |
| `IP_HASH_SALT` | Salt for IP hashing |
| `PORT` | HTTP server port (default: 3005) |

## Links

- [Website](https://disc-tools.de)
- [Dashboard](https://dash.disc-tools.de)
- [All Tools](https://dash.disc-tools.de/tools)
- [Premium](https://dash.disc-tools.de/premium)
- [Statistics](https://dash.disc-tools.de/stats)
- [Support Discord](https://discord.gg/rtRs8rhj5u)
- [Top.gg](https://top.gg/bot/1508899864602345582)
- [GitHub](https://github.com/DiscTools)

## License

MIT
