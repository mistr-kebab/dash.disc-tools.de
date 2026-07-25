// OG Image Generator for Disc-Tools
// Usage: node generate-og-images.mjs

import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';

const PROJECT_ROOT = '/var/www/dash.disc-tools.de';
const OUT_DIR = `${PROJECT_ROOT}/static/assets/img/og`;
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const BRAND = '#5865f2';
const BG = '#0d0d0f';
const BG_ACCENT = '#141418';
const TEXT = '#e1e1e6';
const TEXT_DIM = '#8b8b9e';

function svgOgImage(title, subtitle, iconSvgPath) {
  const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeSub = subtitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const subLines = safeSub.length > 80
    ? [
        `<tspan x="600" dy="-12">${safeSub.slice(0, safeSub.lastIndexOf(' ', 75))}</tspan>`,
        `<tspan x="600" dy="36">${safeSub.slice(safeSub.lastIndexOf(' ', 75) + 1)}</tspan>`
      ]
    : [`<tspan x="600" dy="0">${safeSub}</tspan>`];

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="85" cy="85" r="400" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${BRAND}" stop-opacity="0.18" />
      <stop offset="100%" stop-color="${BG}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${BRAND}" />
      <stop offset="100%" stop-color="#454fbf" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="${BG}" />
  <rect width="1200" height="630" fill="url(#glow)" />
  <g opacity="0.03">
    ${Array.from({length: 20}, (_, i) => `<line x1="0" y1="${i * 32}" x2="1200" y2="${i * 32}" stroke="${TEXT}" stroke-width="1" />`).join('')}
    ${Array.from({length: 38}, (_, i) => `<line x1="${i * 32}" y1="0" x2="${i * 32}" y2="630" stroke="${TEXT}" stroke-width="1" />`).join('')}
  </g>
  <rect x="60" y="420" width="120" height="4" rx="2" fill="url(#bar)" />
  <circle cx="120" cy="115" r="68" fill="${BG_ACCENT}" stroke="${BRAND}" stroke-width="2.5" />
  <g transform="translate(85, 80)">${iconSvgPath}</g>
  <text x="210" y="118" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="26" fill="${TEXT}">
    Disc<tspan fill="${BRAND}">-</tspan>Tools
  </text>
  <text x="210" y="148" font-family="Arial, Helvetica, sans-serif" font-weight="400" font-size="15" fill="${TEXT_DIM}">
    Free Discord Utilities
  </text>
  <text x="80" y="310" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="56" fill="${TEXT}" letter-spacing="-0.5">
    ${safeTitle}
  </text>
  <text font-family="Arial, Helvetica, sans-serif" font-weight="400" font-size="22" fill="${TEXT_DIM}" text-anchor="middle">
    ${subLines.join('')}
  </text>
  <line x1="80" y1="560" x2="1120" y2="560" stroke="${BG_ACCENT}" stroke-width="1" />
  <text x="80" y="595" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="16" fill="${TEXT_DIM}">
    disc-tools.de
  </text>
  <text x="1120" y="595" font-family="Arial, Helvetica, sans-serif" font-weight="400" font-size="14" fill="${TEXT_DIM}" text-anchor="end">
    Open Source Discord Tools
  </text>
</svg>`;
}

const ICONS = {
  home: '<path d="M35 10 L10 33 L15 33 L15 60 L55 60 L55 33 L60 33 Z" fill="none" stroke="#5865f2" stroke-width="3" stroke-linejoin="round"/><rect x="28" y="40" width="14" height="20" rx="2" fill="none" stroke="#5865f2" stroke-width="3" />',
  image: '<rect x="8" y="16" width="54" height="38" rx="4" fill="none" stroke="#5865f2" stroke-width="3"/><circle cx="22" cy="32" r="6" fill="none" stroke="#5865f2" stroke-width="3"/><path d="M8 48 L38 26 L54 40 L62 32 L62 54 L8 54 Z" fill="#5865f2" opacity="0.3" stroke="#5865f2" stroke-width="2.5" stroke-linejoin="round"/>',
  palette: '<circle cx="35" cy="35" r="27" fill="none" stroke="#5865f2" stroke-width="3"/><path d="M35 8 A27 27 0 0 0 35 62 A12 12 0 0 1 35 38 A12 12 0 0 0 35 8 Z" fill="#5865f2" opacity="0.4"/><circle cx="25" cy="28" r="4" fill="#5865f2"/><circle cx="40" cy="22" r="4" fill="#5865f2"/><circle cx="48" cy="38" r="4" fill="#5865f2"/>',
  code: '<polyline points="20,18 4,35 20,52" fill="none" stroke="#5865f2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><polyline points="50,18 66,35 50,52" fill="none" stroke="#5865f2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><line x1="31" y1="16" x2="39" y2="54" stroke="#5865f2" stroke-width="3" stroke-linecap="round"/>',
  emoji: '<circle cx="35" cy="35" r="27" fill="none" stroke="#5865f2" stroke-width="3"/><circle cx="23" cy="28" r="3.5" fill="#5865f2"/><circle cx="47" cy="28" r="3.5" fill="#5865f2"/><path d="M23 43 Q35 54 47 43" fill="none" stroke="#5865f2" stroke-width="3" stroke-linecap="round"/>',
  link: '<path d="M30 15 L40 15 C52 15 60 23 60 35 C60 47 52 55 40 55 L30 55" fill="none" stroke="#5865f2" stroke-width="3" stroke-linecap="round"/><path d="M40 55 L30 55 C18 55 10 47 10 35 C10 23 18 15 30 15 L40 15" fill="none" stroke="#5865f2" stroke-width="3" stroke-linecap="round"/>',
  file: '<path d="M18 8 L42 8 L55 22 L55 62 L18 62 Z" fill="none" stroke="#5865f2" stroke-width="3" stroke-linejoin="round"/><path d="M42 8 L42 22 L55 22" fill="none" stroke="#5865f2" stroke-width="3" stroke-linejoin="round"/><line x1="26" y1="38" x2="44" y2="38" stroke="#5865f2" stroke-width="2.5" stroke-linecap="round"/><line x1="26" y1="48" x2="38" y2="48" stroke="#5865f2" stroke-width="2.5" stroke-linecap="round"/>',
  gift: '<rect x="6" y="20" width="58" height="20" rx="3" fill="none" stroke="#5865f2" stroke-width="3"/><rect x="32" y="20" width="6" height="42" fill="none" stroke="#5865f2" stroke-width="3"/><path d="M35 8 L25 20 L35 20 Z" fill="none" stroke="#5865f2" stroke-width="3" stroke-linejoin="round"/><path d="M35 8 L45 20 L35 20 Z" fill="none" stroke="#5865f2" stroke-width="3" stroke-linejoin="round"/>',
  server: '<rect x="8" y="8" width="54" height="16" rx="3" fill="none" stroke="#5865f2" stroke-width="3"/><rect x="8" y="27" width="54" height="16" rx="3" fill="none" stroke="#5865f2" stroke-width="3"/><rect x="8" y="46" width="54" height="16" rx="3" fill="none" stroke="#5865f2" stroke-width="3"/><circle cx="16" cy="16" r="3" fill="#5865f2"/><circle cx="16" cy="35" r="3" fill="#5865f2"/><circle cx="16" cy="54" r="3" fill="#5865f2"/>',
  snowflake: '<g transform="translate(35,35)"><line x1="0" y1="-28" x2="0" y2="28" stroke="#5865f2" stroke-width="3" stroke-linecap="round"/><line x1="-24" y1="-14" x2="24" y2="14" stroke="#5865f2" stroke-width="3" stroke-linecap="round"/><line x1="-24" y1="14" x2="24" y2="-14" stroke="#5865f2" stroke-width="3" stroke-linecap="round"/></g>',
  clock: '<circle cx="35" cy="35" r="27" fill="none" stroke="#5865f2" stroke-width="3"/><polyline points="35,16 35,35 48,40" fill="none" stroke="#5865f2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
  plug: '<path d="M22 8 L22 28 C22 38 12 44 12 54 L12 60" fill="none" stroke="#5865f2" stroke-width="3" stroke-linecap="round"/><path d="M48 8 L48 28 C48 38 58 44 58 54 L58 60" fill="none" stroke="#5865f2" stroke-width="3" stroke-linecap="round"/><line x1="12" y1="60" x2="58" y2="60" stroke="#5865f2" stroke-width="3" stroke-linecap="round"/>',
  tools: '<rect x="14" y="14" width="18" height="18" rx="3" fill="none" stroke="#5865f2" stroke-width="3"/><rect x="38" y="14" width="18" height="18" rx="3" fill="none" stroke="#5865f2" stroke-width="3"/><rect x="14" y="38" width="18" height="18" rx="3" fill="none" stroke="#5865f2" stroke-width="3"/><rect x="38" y="38" width="18" height="18" rx="3" fill="none" stroke="#5865f2" stroke-width="3"/>',
  premium: '<path d="M35 8 L46 32 L62 32 L50 46 L56 62 L35 52 L14 62 L20 46 L8 32 L24 32 Z" fill="none" stroke="#5865f2" stroke-width="3" stroke-linejoin="round"/>',
  stats: '<rect x="10" y="42" width="12" height="18" rx="2" fill="#5865f2" opacity="0.7" stroke="#5865f2" stroke-width="2"/><rect x="29" y="28" width="12" height="32" rx="2" fill="#5865f2" opacity="0.85" stroke="#5865f2" stroke-width="2"/><rect x="48" y="14" width="12" height="46" rx="2" fill="#5865f2" stroke="#5865f2" stroke-width="2"/>',
};

const PAGES = [
  { slug: 'home',       title: 'Disc-Tools',          subtitle: 'Free Discord Tools & Server Dashboard', icon: 'home' },
  { slug: 'tools',      title: 'Free Discord Tools',   subtitle: '11 Open-Source Utilities — Avatar CDN, Embeds, Lookups & More', icon: 'tools' },
  { slug: 'premium',    title: 'Premium',              subtitle: 'Alt Detection, HD Quote GIFs & Early Access — Starting from €5/month', icon: 'premium' },
  { slug: 'stats',      title: 'Statistics',           subtitle: 'Real-Time Bot Growth — Servers, Users & Community Metrics', icon: 'stats' },
  { slug: 'avatar-cdn', title: 'Avatar CDN',           subtitle: 'Get Any Discord Avatar, Banner & Server Icon URL in All Formats', icon: 'image' },
  { slug: 'color-picker', title: 'Color Picker',       subtitle: 'Convert Colors Between Hex, RGB & HSL Directly in Discord', icon: 'palette' },
  { slug: 'embed-builder', title: 'Embed Builder',     subtitle: 'Create & Preview Rich Discord Message Embeds with Custom Content', icon: 'code' },
  { slug: 'emoji-stealer', title: 'Emoji Stealer',     subtitle: 'Extract & Download Custom Emojis and Stickers from Any Server', icon: 'emoji' },
  { slug: 'invite-lookup', title: 'Invite Lookup',     subtitle: 'Resolve Discord Invite Links — Server Info, Members & Expiration', icon: 'link' },
  { slug: 'markdown-generator', title: 'Markdown Generator', subtitle: 'Format Discord Messages — Bold, Code Blocks, Spoilers & Colors', icon: 'file' },
  { slug: 'nitro-checker', title: 'Nitro Checker',     subtitle: 'Verify Discord Nitro Gift Links — Check Validity Without Redeeming', icon: 'gift' },
  { slug: 'server-lookup', title: 'Server Lookup',     subtitle: 'View Detailed Guild Information — Members, Boosts & Vanity URL', icon: 'server' },
  { slug: 'snowflake-decoder', title: 'Snowflake Decoder', subtitle: 'Decode Discord IDs to Exact Creation Timestamps & Dates', icon: 'snowflake' },
  { slug: 'timestamp-generator', title: 'Timestamp Generator', subtitle: 'Convert Dates to Discord Dynamic Timestamps — All 6 Styles', icon: 'clock' },
  { slug: 'webhook-manager', title: 'Webhook Manager', subtitle: 'Send, Edit & Delete Webhook Messages — Custom Names & Avatars', icon: 'plug' },
];

async function generate() {
  for (const page of PAGES) {
    const svg = svgOgImage(page.title, page.subtitle, ICONS[page.icon] || ICONS.home);
    const pngPath = `${OUT_DIR}/${page.slug}.png`;

    try {
      await sharp(Buffer.from(svg))
        .resize(1200, 630)
        .png({ compressionLevel: 9 })
        .toFile(pngPath);
      console.log(`  OK  ${page.slug}.png`);
    } catch (err) {
      console.error(`  FAIL  ${page.slug}.png — ${err.message}`);
    }
  }
  console.log(`\nGenerated ${PAGES.length} OG images -> ${OUT_DIR}`);
}

generate();
