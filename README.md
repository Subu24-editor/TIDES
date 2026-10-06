# THE DARK TIDES — Community Website

> A gaming & community hub for **The Dark Tides** Discord server. Built with React + Vite, featuring a live admin dashboard, Discord OAuth2 authentication, real-time server stats, and a fully animated dark-ocean design system.

---

## ✨ Features

### 🌊 Landing Page

- **Animated hero** — floating logo, pulsing glow, layered wave SVGs, cascading text entrance
- **Custom cursor** — glowing ring + dot that follows the mouse with smooth lag; turns gold on interactive elements, scales on click; automatically disabled on touch devices
- **Scroll-reveal animations** — elements fade and slide up as they enter the viewport, with staggered delays for grid cards
- **Ambient atmosphere** — parallax star field, slow moon breathe, drifting mist particles
- **Smooth scroll navigation** — navbar links scroll to sections with `scrollIntoView`, accounting for the fixed header via `scroll-margin-top`
- **Active nav tracking** — current section highlighted in the navbar as you scroll
- **Responsive** — fully mobile-friendly with a hamburger menu, keyboard accessible, escape-to-close

### 📋 Content Sections

| Section        | Description                                                               |
| -------------- | ------------------------------------------------------------------------- |
| **Counter**    | Animated live member count from Discord Widget API                        |
| **The Fleet**  | Game cards with artwork, genre, badge, description, and external game URL |
| **Updates**    | Changelog timeline with badge types (Fix / Featured)                      |
| **Why Choose** | Feature highlights with icons                                             |
| **Community**  | Discord community overview card                                           |
| **About**      | Four-pillar mission cards                                                 |
| **Tools**      | Community tools (e.g. Drydock)                                   |
| **Staff**      | Owner & Admin cards with Discord avatar sync                              |
| **Developer**  | Developer spotlight with Discord profile integration                      |
| **Luna**       | Bot section with profile info                                             |
| **FAQ**        | Accessible accordion (button + `aria-expanded`)                           |
| **Socials**    | Links to Discord, YouTube, Reddit                                         |
| **Final CTA**  | Discord join call-to-action                                               |

### 🛡️ Admin Dashboard (`/dashboard`)

A protected admin panel for managing all site content without touching code.

**Authentication**

- Discord OAuth2 implicit flow — members sign in with Discord
- Server role verification via bot token — only members with the designated role (e.g. `Tide Guardians🛡️`) can access
- Dynamic role name fetched live from Discord API and displayed in the sidebar
- Discord avatar displayed in sidebar user badge
- Session persistence via `localStorage`

**Content Management**

- **Changelog** — add, edit, delete update entries with badge type and date picker
- **The Fleet (Games)** — manage game cards including title, genre, badge, description, artwork image upload, and game URL
- **Discord Link & Stats** — update the server-wide Discord invite URL; live widget status panel
- **About Pillars** — edit the four mission statement cards
- **Tools** — manage community tool cards with links
- **Staff** — Owner & Admin cards with Discord ID → auto-fetch name + avatar
- **Developer Info** — Developer profiles with Discord ID sync, lineage nodes, bio
- **Bot Section** — Bot cards with Discord ID sync, meta info, sign-off line

**Discord Sync Field** — custom UI component: monospace ID input, animated fetch button, live profile preview pill showing avatar + display name + ID, `🟢 Synced` status badge

**Game Image Picker** — drag & drop or file picker for artwork; supports all image formats (PNG, JPG, WebP, SVG, GIF, AVIF, BMP, ICO, TIFF, HEIC); max 5 MB; auto-compresses to WebP via Canvas API

**Data persistence** — all content saved to a JSON database via `/api/db` endpoint (GET/POST), served by Vite dev middleware (dev) and `server.js` (production)

---

## 🗂️ Project Structure

```
TIDESITE/
├── index.html                  Main site entry
├── dashboard.html              Dashboard entry
├── server.js                   Production Node.js server
├── vite.config.js              Vite config + API middleware
├── .env                        Environment variables (not committed)
├── .env.example                Template for required env vars
│
├── public/
│   └── img/
│       ├── logo-mark.svg
│       ├── favicon.svg
│       ├── games/              Game artwork (art-01..03.svg)
│       └── people/             Avatar images
│
└── src/
    ├── main.jsx                Landing page React root
    ├── dashboard.jsx           Dashboard React root
    ├── index.css               Full design system (~3000 lines)
    ├── dashboard.css           Dashboard-specific styles
    ├── App.jsx                 Landing page component tree
    │
    ├── components/
    │   ├── CustomCursor.jsx    Custom cursor (ring + dot, RAF-based)
    │   ├── Atmosphere.jsx      Stars, moon, mist, particles
    │   ├── Navbar.jsx          Fixed nav with active tracking
    │   ├── Counter.jsx         Animated member counter
    │   ├── Hero.jsx            Hero section
    │   ├── GamesSection.jsx    Fleet / games grid
    │   ├── UpdatesSection.jsx  Changelog timeline
    │   ├── WhySection.jsx      Feature highlights
    │   ├── CommunitySection.jsx
    │   ├── AboutSection.jsx    Mission pillars
    │   ├── ToolsSection.jsx    Community tools
    │   ├── StaffSection.jsx    Owners & admins
    │   ├── DeveloperSection.jsx
    │   ├── LunaSection.jsx     Bot section
    │   ├── FaqSection.jsx      Accordion FAQ
    │   ├── SocialsSection.jsx  Social links
    │   ├── FinalCta.jsx        Discord join CTA
    │   ├── Footer.jsx
    │   └── Dashboard.jsx       Full dashboard UI
    │
    ├── hooks/
    │   ├── useDiscordAuth.js   OAuth2 auth + role check
    │   ├── useDiscordStats.js  Discord Widget API polling
    │   ├── useStore.js         JSON DB state management
    │   ├── useScrollReveal.js  IntersectionObserver reveal
    │   ├── useNavScroll.js     Scroll-spy + is-scrolled header
    │   ├── useSmoothScroll.js  scrollIntoView wrapper
    │   ├── useSmoothScroll.js
    │   └── useParticles.js     Canvas particle system
    │
    └── utils/
        └── discordUser.js      Discord user fetch helper
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
# Discord OAuth2 Application Client ID
VITE_DISCORD_CLIENT_ID=your_client_id_here

# Your Discord Server (Guild) ID
VITE_DISCORD_GUILD_ID=your_guild_id_here

# Role ID(s) allowed to access the dashboard (comma-separated)
VITE_DISCORD_ALLOWED_ROLES=role_id_here

# Display name for the allowed role shown in the sidebar
VITE_DISCORD_ROLE_NAME=Admin

# Bot token for server-side Discord API calls (role verification, avatar fetch)
VITE_DISCORD_BOT_TOKEN=your_bot_token_here
```

> **Note:** `VITE_DISCORD_BOT_TOKEN` is only used server-side in `vite.config.js` and `server.js`. It is **never** bundled into the client JavaScript.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173` (or next available port). Hot module replacement is enabled.

Dashboard is at `http://localhost:5173/dashboard`.

### Production Build

```bash
npm run build
```

Outputs to `dist/`.

### Production Server

```bash
npm start
# or
node server.js
```

Serves the built `dist/` folder with the API endpoints (`/api/db`, `/api/discord-user`, `/api/discord-roles`) proxied server-side.

### Preview Build Locally

```bash
npm run preview
```

---

## 🔐 Discord Setup

### 1. Create a Discord Application

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Create a new application — set the name and save the **Client ID**
3. Under **OAuth2 → Redirects**, add your site's dashboard URL:
   - Dev: `http://localhost:5173/dashboard`
   - Production: `https://yourdomain.com/dashboard`

### 2. Create a Bot

1. Under **Bot**, click **Add Bot**
2. Copy the **Bot Token** → set as `VITE_DISCORD_BOT_TOKEN` in `.env`
3. Enable **Server Members Intent** under Privileged Gateway Intents

### 3. Invite the Bot to Your Server

The bot needs to be in your server to fetch member roles and resolve role names.

Required bot permissions:

- **View Channels** — to access the server
- **Read Message History** — basic access

Minimum required intent: **Server Members Intent**

### 4. Enable Discord Server Widget _(for live member count)_

In your Discord Server Settings → **Widget** → Enable Server Widget.

This powers the `useDiscordStats` hook that shows online member count on the dashboard.

---

## 🎨 Design System

All design tokens are CSS variables in `src/index.css`:

| Token        | Value     | Used for                                       |
| ------------ | --------- | ---------------------------------------------- |
| `--bg`       | `#030A14` | Page background                                |
| `--bg-2`     | `#061522` | Alternating sections, footer                   |
| `--card`     | `#0A1D2A` | Card backgrounds                               |
| `--cyan`     | `#00C7E8` | Primary accent (buttons, borders, glows)       |
| `--moon`     | `#7DEBFF` | Highlights, cursor dot, hover states           |
| `--gold`     | `#A88A52` | Decorative lines, owner cards (used sparingly) |
| `--text`     | `#E8F7FA` | Body text                                      |
| `--text-dim` | `#8BA6B3` | Secondary / muted text                         |
| `--border`   | `#123847` | Card and element borders                       |

**Fonts:** `Cinzel` (display / headings) · `Inter` (body) — both from Google Fonts with system fallbacks.

**Reusable utility classes:**

- `.btn` — `--primary` / `--secondary` / `--ghost` · `--sm` / `--lg`
- `.card` — `--glass` variant
- `.reveal` — adds scroll-in animation; siblings in a grid stagger automatically
- `.reveal--scale` — scale + fade variant
- `.reveal--left` — slide-in from left variant
- `.section-head` · `.eyebrow` · `.section-title` · `.section-sub`
- `.badge` · `.avatar` · `.timeline__item` · `.faq__item` · `.social`

---

## ♿ Accessibility & Motion

- Semantic HTML landmarks, single `<h1>`, ordered heading levels
- Skip-to-content link
- FAQ uses real `<button>` + `aria-expanded` + `aria-controls`; closed panels are `hidden`
- Mobile menu closes on `Escape`, scrim click, and focus leaving the menu
- Visible focus rings; touch targets ≥ 44px
- Custom cursor auto-disables on touch/coarse-pointer devices
- `prefers-reduced-motion` respected everywhere:
  - Particles, mist, waves, glows stop animating
  - Scroll-reveal content shows immediately
  - Counter jumps to final value instantly
  - Cursor disabled

---

## 📦 Tech Stack

| Layer       | Technology                                                |
| ----------- | --------------------------------------------------------- |
| Framework   | React 18                                                  |
| Build tool  | Vite 5                                                    |
| Styling     | Vanilla CSS (design system, ~3k lines)                    |
| State       | Custom `useStore` hook → JSON file via `/api/db`          |
| Auth        | Discord OAuth2 implicit flow + bot token verification     |
| Server      | Node.js (`server.js`) for production API + static serving |
| Fonts       | Google Fonts (Cinzel + Inter)                             |
| Icons / Art | Original SVG                                              |

No UI library. No CSS framework. No external state manager.
