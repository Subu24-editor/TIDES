import React, { useState } from "react"
import useDiscordAuth from "../hooks/useDiscordAuth.js"
import useDiscordStats from "../hooks/useDiscordStats.js"
import useStore from "../hooks/useStore.js"
import { fetchDiscordUser } from "../utils/discordUser.js"
import {
  DEFAULT_FAQ,
  createFaqItem,
  normalizeFaqItems,
} from "../data/faqDefaults.js"
import "../index.css"
import "../dashboard.css"

// Default initial data structures
const DEFAULT_UPDATES = [
  {
    badge: "Fix",
    badgeClass: "badge--fix",
    date: "2026-08-09",
    dateLabel: "Aug 09, 2026",
    title: "Tides Downloader updated to V1.2.4!",
    text: "Added block for Steam game updates. Added a setting to disable/enable TIDES updates or game updates.",
  },
  {
    badge: "Fix",
    badgeClass: "badge--fix",
    date: "2026-08-08",
    dateLabel: "Aug 08, 2026",
    title: "Tides Downloader updated to V1.2.0!",
    text: "",
  },
  {
    badge: "Featured",
    badgeClass: "badge--featured",
    date: "2026-07-28",
    dateLabel: "Jul 28, 2026",
    title: "Luna, the automation bot, added to server",
    text: "",
  },
]

const DEFAULT_FLEET = [
  {
    art: "/img/games/art-01.svg",
    badge: "Coming soon",
    genre: "Action / RPG",
    title: "Tidal Ascendancy",
    text: "An oceanic tactical warfare game set in ancient depths.",
    url: "",
  },
  {
    art: "/img/games/art-02.svg",
    badge: "Popular",
    genre: "Survival",
    title: "Abyssal Horizon",
    text: "Navigate uncharted oceanic trench zones with your team.",
    url: "",
  },
  {
    art: "/img/games/art-03.svg",
    badge: "Coming soon",
    genre: "MMO",
    title: "Dark Tides Reborn",
    text: "Community-driven persistent world with player economies.",
    url: "",
  },
]

const DEFAULT_DISCORD = {
  url: "https://discord.gg/thedarktides",
}

const DEFAULT_ABOUT = [
  {
    title: "Gaming",
    text: "Discover what the community is playing and what is currently rising from the depths.",
  },
  {
    title: "Community",
    text: "A place for gamers, developers, and enthusiasts to meet, talk, and stay connected.",
  },
  {
    title: "Projects",
    text: "Share what you are building and follow the tools and projects made for the community.",
  },
  {
    title: "Updates",
    text: "Patch notes, world events, and announcements land here first — and in Discord.",
  },
]

const DEFAULT_TOOLS = [
  {
    title: "Tides Downloader",
    text: "Built by Dreamleak. Grab the link and setup details in Discord.",
    ctaText: "Discord link coming soon →",
    href: "",
  },
]

const DEFAULT_FAQ_ADMIN = DEFAULT_FAQ

const DEFAULT_STAFF = {
  owners: [
    {
      mono: "M",
      name: "Maverick",
      role: "Owner",
      text: "Runs the server and guides the staff, with a hand in community leadership and direction.",
      discordId: "",
    },
    {
      mono: "C",
      name: "Chrollo Fake One",
      role: "Owner",
      text: "Community leadership and direction.",
      discordId: "",
    },
    {
      mono: "H",
      name: "Helm",
      role: "Owner",
      text: "Community leadership and direction. Also manages the bot.",
      discordId: "",
    },
  ],
  admins: [
    {
      mono: "DK",
      name: "The Dark Knight",
      role: "Admin",
      text: "Community moderation and guidance",
      discordId: "",
    },
    {
      mono: "X",
      name: "Xei",
      role: "Admin",
      text: "Community moderation and guidance",
      discordId: "",
    },
    {
      mono: "G",
      name: "Ghost",
      role: "Admin",
      text: "Community moderation and guidance",
      discordId: "",
    },
  ],
}

const DEFAULT_DEVS = [
  {
    name: "Dreamleak",
    role: "Developer",
    text: "Founder of Luna bot and the Tides Downloader — building the tools that keep the community running.",
    image: "/img/people/dreamleak.svg",
    lineage: ["Dreamleak", "Developer", "Luna", "Dark Tides Community"],
    discordId: "",
  },
]

const DEFAULT_BOTS = [
  {
    name: "Luna",
    meta: "Created by Dreamleak · Est. 2026",
    text: "I'm Luna, the automation bot of The Dark Tides. I help manage the community, assist members, handle users, and keep things running smoothly behind the scenes.",
    signoff: "Let's meet in the server! 💜",
    image: "/img/people/luna.svg",
    discordId: "",
  },
]

function DiscordSyncField({
  label = "Discord Profile",
  placeholder = "e.g. 356172605658824704",
  discordId = "",
  onChangeId,
  onFetch,
  loading = false,
  profile = null,
  theme = "cyan",
  hint = "Enter a 17–20 digit Discord ID and press Enter or Fetch Profile to auto-populate.",
}) {
  const hasProfile = Boolean(profile && (profile.name || profile.image))
  const themeClass = `dash-discord-box--${theme}`

  return (
    <div className={`dash-discord-box ${themeClass}`}>
      <div className="dash-discord-top">
        <div className="dash-discord-title-wrap">
          <svg
            className="dash-discord-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
          <label className="dash-discord-label">{label}</label>
        </div>
        {hasProfile ? (
          <span className="dash-discord-status dash-discord-status--synced">
            🟢 Synced with Discord
          </span>
        ) : (
          <span className="dash-discord-status">⚪ Awaiting ID</span>
        )}
      </div>

      <div className="dash-discord-bar">
        <span className="dash-discord-badge" title="Discord Snowflake ID">
          #
        </span>
        <input
          type="text"
          className="dash-discord-input"
          placeholder={placeholder}
          value={discordId}
          onChange={(e) => onChangeId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              if (!loading && discordId.trim()) onFetch()
            }
          }}
        />
        <button
          type="button"
          className="dash-discord-btn"
          disabled={loading || !discordId.trim()}
          onClick={onFetch}
          title="Fetch profile from Discord"
        >
          {loading ? (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  strokeDasharray="16"
                  strokeDashoffset="8"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 12 12"
                    to="360 12 12"
                    dur="0.8s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
              <span>Fetching...</span>
            </>
          ) : (
            <>
              <span>⚡</span>
              <span>Fetch Profile</span>
            </>
          )}
        </button>
      </div>

      {hasProfile ? (
        <div className="dash-discord-preview">
          {profile.image ? (
            <img src={profile.image} alt="" className="dash-discord-avatar" />
          ) : (
            <div className="dash-discord-mono">{profile.mono || "DT"}</div>
          )}
          <div className="dash-discord-info">
            <div className="dash-discord-name">
              <span>{profile.name}</span>
              {discordId && (
                <span className="dash-discord-id-pill">ID: {discordId}</span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="dash-btn dash-btn--secondary"
            style={{ padding: "0.25rem 0.65rem", fontSize: "0.75rem" }}
            onClick={onFetch}
            disabled={loading}
            title="Refresh profile details from Discord"
          >
            ↻ Refresh
          </button>
        </div>
      ) : (
        <p className="dash-discord-hint">{hint}</p>
      )}
    </div>
  )
}

function GameImagePicker({ value = "", onChange, gameTitle = "" }) {
  const fileInputRef = React.useRef(null)
  const [dragOver, setDragOver] = React.useState(false)
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  const processFile = (file) => {
    if (!file) return

    // 5MB Size Limit Validation
    if (file.size > MAX_FILE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2)
      alert(
        `File "${file.name}" is ${sizeMb}MB, which exceeds the 5MB size limit. Please select an image under 5MB.`,
      )
      return
    }

    // Accept all image formats (via MIME type or common extensions)
    const isImageMime = file.type && file.type.startsWith("image/")
    const isImageExt =
      /\.(png|jpe?g|webp|svg|gif|bmp|ico|avif|tiff?|heic|heif)$/i.test(
        file.name,
      )

    if (!isImageMime && !isImageExt) {
      alert(
        "Please select a valid image file (PNG, JPG, SVG, WebP, GIF, AVIF, BMP, ICO, TIFF, etc.).",
      )
      return
    }

    if (
      file.type === "image/svg+xml" ||
      file.name.toLowerCase().endsWith(".svg")
    ) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onChange(e.target.result)
      }
      reader.readAsDataURL(file)
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const maxDim = 1280
        let width = img.width
        let height = img.height

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          } else {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        ctx.drawImage(img, 0, 0, width, height)

        const dataUrl = canvas.toDataURL("image/webp", 0.88)
        onChange(dataUrl)
      }
      img.onerror = () => {
        onChange(event.target.result)
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
      e.target.value = ""
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const isDataUrl = value && value.startsWith("data:image/")

  return (
    <div
      className="dash-media-box"
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      style={
        dragOver
          ? {
              borderColor: "var(--cyan)",
              backgroundColor: "rgba(0, 199, 232, 0.05)",
            }
          : {}
      }
    >
      <label className="dash-label" style={{ color: "var(--cyan)" }}>
        Game Artwork Image (All formats accepted · Max 5MB)
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.png,.jpg,.jpeg,.webp,.svg,.gif,.bmp,.ico,.avif,.tiff,.tif,.heic,.heif"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <div className="dash-media-bar">
        <input
          type="text"
          className="dash-input dash-media-input"
          placeholder="Enter image URL/path or click 'Open File'..."
          value={
            isDataUrl ? "Uploaded image (Embedded WebP Data)" : value || ""
          }
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="dash-media-btn-open"
          onClick={() => fileInputRef.current?.click()}
          title="Open image file from your device"
        >
          📁 Open File
        </button>
      </div>

      {value && (
        <div className="dash-media-preview-container">
          <img
            src={value}
            alt={gameTitle || "Game artwork"}
            className="dash-media-thumb"
            onError={(e) => {
              e.currentTarget.style.opacity = "0.3"
            }}
          />
          <div className="dash-media-details">
            <span className="dash-media-filename">
              {isDataUrl ? "Custom image loaded & optimized" : value}
            </span>
            <span className="dash-media-status">
              {isDataUrl
                ? "Auto-compressed WebP · Saved to Database"
                : "Active path / URL"}
            </span>
            <div className="dash-media-presets">
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text-dim)",
                  alignSelf: "center",
                }}
              >
                Presets:
              </span>
              <button
                type="button"
                className="dash-media-preset-btn"
                onClick={() => onChange("/img/games/art-01.svg")}
              >
                Art 1
              </button>
              <button
                type="button"
                className="dash-media-preset-btn"
                onClick={() => onChange("/img/games/art-02.svg")}
              >
                Art 2
              </button>
              <button
                type="button"
                className="dash-media-preset-btn"
                onClick={() => onChange("/img/games/art-03.svg")}
              >
                Art 3
              </button>
              <button
                type="button"
                className="dash-media-preset-btn"
                style={{ color: "#fca5a5" }}
                onClick={() => onChange("")}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const auth = useDiscordAuth()
  const discordStats = useDiscordStats()
  const [activeTab, setActiveTab] = useState("changelog")
  const [statusMsg, setStatusMsg] = useState(null)
  const [fetchLoading, setFetchLoading] = useState({})

  // Store hooks
  const [changelog, setChangelog, resetChangelog] = useStore(
    "changelog",
    DEFAULT_UPDATES,
  )
  const [fleet, setFleet, resetFleet] = useStore("fleet", DEFAULT_FLEET)
  const [discord, setDiscord, resetDiscord] = useStore(
    "discord",
    DEFAULT_DISCORD,
  )
  const [about, setAbout, resetAbout] = useStore("about", DEFAULT_ABOUT)
  const [tools, setTools, resetTools] = useStore("tools", DEFAULT_TOOLS)
  const [faq, setFaq, resetFaq] = useStore("faq", DEFAULT_FAQ_ADMIN)
  const [staff, setStaff, resetStaff] = useStore("staff", DEFAULT_STAFF)
  const [dev, setDev, resetDev] = useStore("developer", DEFAULT_DEVS)
  const [luna, setLuna, resetLuna] = useStore("luna", DEFAULT_BOTS)

  const showStatus = (msg) => {
    setStatusMsg(msg)
    setTimeout(() => setStatusMsg(null), 3000)
  }

  const safeChangelog = Array.isArray(changelog) ? changelog : DEFAULT_UPDATES
  const safeFleet = Array.isArray(fleet) ? fleet : DEFAULT_FLEET
  const safeAbout = Array.isArray(about) ? about : DEFAULT_ABOUT
  const safeTools = Array.isArray(tools) ? tools : DEFAULT_TOOLS
  const safeFaq = normalizeFaqItems(faq)
  const safeOwners = Array.isArray(staff?.owners)
    ? staff.owners
    : DEFAULT_STAFF.owners
  const safeAdmins = Array.isArray(staff?.admins)
    ? staff.admins
    : DEFAULT_STAFF.admins
  const safeDevs = Array.isArray(dev)
    ? dev
    : dev && typeof dev === "object"
      ? [dev]
      : DEFAULT_DEVS
  const safeBots = Array.isArray(luna)
    ? luna
    : luna && typeof luna === "object"
      ? [luna]
      : DEFAULT_BOTS

  const handleFetchDiscordForCard = async (key, discordId, onSuccess) => {
    if (!discordId) {
      alert("Please enter a valid 17-20 digit Discord User ID.")
      return
    }
    setFetchLoading((prev) => ({ ...prev, [key]: true }))
    try {
      const userInfo = await fetchDiscordUser(discordId)
      onSuccess(userInfo)
      showStatus(
        `Fetched Discord profile: ${userInfo.name || userInfo.username || userInfo.id}`,
      )
    } catch (err) {
      alert(err.message || "Could not fetch Discord User details")
    } finally {
      setFetchLoading((prev) => ({ ...prev, [key]: false }))
    }
  }

  if (auth.loading) {
    return (
      <div className="dash-auth-screen">
        <div className="dash-auth-card">
          <div className="dash-auth-icon">
            <svg
              viewBox="0 0 24 24"
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                strokeDasharray="32"
                strokeDashoffset="12"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>
          <h2 className="dash-auth-title">Verifying Credentials</h2>
          <p className="dash-auth-desc">
            Checking your Discord membership and server roles...
          </p>
        </div>
      </div>
    )
  }

  if (!auth.authorized) {
    return (
      <div className="dash-auth-screen">
        <div className="dash-auth-card">
          <div className="dash-auth-icon">
            <svg
              viewBox="0 0 24 24"
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h2 className="dash-auth-title">Admin Dashboard</h2>
          <p className="dash-auth-desc">
            Access to this section requires member authorisation with a
            designated role in <strong>The Dark Tides</strong> Discord server.
          </p>

          {auth.error && (
            <div className="dash-alert dash-alert--error">{auth.error}</div>
          )}

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {auth.clientIdConfigured ? (
              <button
                className="dash-btn dash-btn--primary"
                onClick={auth.login}
                style={{ width: "100%" }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="currentColor"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Sign in with Discord
              </button>
            ) : (
              <div
                className="dash-alert dash-alert--info"
                style={{ textAlign: "left" }}
              >
                <strong>OAuth Setup Notice:</strong>{" "}
                <code>VITE_DISCORD_CLIENT_ID</code> is not configured in{" "}
                <code>.env</code>.
                <br />
                <br />
                Target Guild ID: <code>{auth.guildId}</code>
                <br />
                Allowed Role ID: <code>{auth.allowedRoles.join(", ")}</code>
                <br />
                <br />
                You can use Local Developer Bypass below to inspect and test the
                dashboard editor.
              </div>
            )}

            {import.meta.env.DEV && (
              <button
                className="dash-btn dash-btn--secondary"
                onClick={auth.enableDevBypass}
                style={{ width: "100%" }}
              >
                Developer Bypass Mode
              </button>
            )}

            <a
              className="dash-btn dash-btn--secondary"
              href="/"
              style={{ textDecoration: "none" }}
            >
              ← Return to Main Website
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dash-layout">
      {/* Sidebar Navigation */}
      <aside className="dash-sidebar">
        <div className="dash-sidebar__header">
          <img src="/img/logo-mark.svg" alt="" width="32" height="32" />
          <span className="dash-sidebar__brand-text">Tides Admin</span>
        </div>

        <nav className="dash-sidebar__nav">
          <button
            className={`dash-nav-btn ${activeTab === "changelog" ? "is-active" : ""}`}
            onClick={() => setActiveTab("changelog")}
          >
            📝 Changelog
          </button>
          <button
            className={`dash-nav-btn ${activeTab === "fleet" ? "is-active" : ""}`}
            onClick={() => setActiveTab("fleet")}
          >
            🚀 The Fleet (Games)
          </button>
          <button
            className={`dash-nav-btn ${activeTab === "discord" ? "is-active" : ""}`}
            onClick={() => setActiveTab("discord")}
          >
            💬 Discord Link & Stats
          </button>
          <button
            className={`dash-nav-btn ${activeTab === "about" ? "is-active" : ""}`}
            onClick={() => setActiveTab("about")}
          >
            ℹ️ About Pillars
          </button>
          <button
            className={`dash-nav-btn ${activeTab === "tools" ? "is-active" : ""}`}
            onClick={() => setActiveTab("tools")}
          >
            🛠️ Tools
          </button>
          <button
            className={`dash-nav-btn ${activeTab === "faq" ? "is-active" : ""}`}
            onClick={() => setActiveTab("faq")}
          >
            ❓ FAQ ({safeFaq.length})
          </button>
          <button
            className={`dash-nav-btn ${activeTab === "staff" ? "is-active" : ""}`}
            onClick={() => setActiveTab("staff")}
          >
            🛡️ Staff (Owners & Admins)
          </button>
          <button
            className={`dash-nav-btn ${activeTab === "developer" ? "is-active" : ""}`}
            onClick={() => setActiveTab("developer")}
          >
            💻 Developer Info ({safeDevs.length})
          </button>
          <button
            className={`dash-nav-btn ${activeTab === "luna" ? "is-active" : ""}`}
            onClick={() => setActiveTab("luna")}
          >
            🤖 Bot Section ({safeBots.length})
          </button>
        </nav>

        <div className="dash-sidebar__footer">
          <div className="dash-user-badge">
            <div
              className="dash-avatar"
              style={{
                background: "var(--cyan-14)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {auth.user?.avatar ? (
                <img
                  src={`https://cdn.discordapp.com/avatars/${auth.user.id}/${auth.user.avatar}.png?size=64`}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                "👤"
              )}
            </div>
            <div className="dash-user-info">
              <span className="dash-user-name">
                {auth.user?.global_name ||
                  auth.user?.username ||
                  "Authorized Member"}
              </span>
              <span className="dash-user-role">
                {auth.devMode ? "Dev Mode" : auth.roleName || "Admin"}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <a
              className="dash-btn dash-btn--secondary"
              href="/"
              style={{ flex: 1, fontSize: "0.8rem", padding: "0.4rem 0.6rem" }}
            >
              View Site
            </a>
            <button
              className="dash-btn dash-btn--danger"
              onClick={auth.logout}
              style={{ fontSize: "0.8rem", padding: "0.4rem 0.6rem" }}
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dash-main">
        {statusMsg && (
          <div className="dash-alert dash-alert--success">{statusMsg}</div>
        )}

        {/* --- CHANGELOG TAB --- */}
        {activeTab === "changelog" && (
          <div>
            <div className="dash-header">
              <div>
                <h1 className="dash-title">Changelog Management</h1>
                <p className="dash-subtitle">
                  Manage patch notes, updates, and events displayed on the site
                  timeline.
                </p>
              </div>
              <button
                className="dash-btn dash-btn--primary"
                onClick={() => {
                  const newEntry = {
                    badge: "Fix",
                    badgeClass: "badge--fix",
                    date: new Date().toISOString().split("T")[0],
                    dateLabel: new Date().toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    }),
                    title: "New Update Title",
                    text: "Description of the update or patch notes.",
                  }
                  setChangelog([newEntry, ...safeChangelog])
                  showStatus("Added new changelog entry")
                }}
              >
                + Add Update Entry
              </button>
            </div>

            {safeChangelog.map((item, index) => (
              <div key={index} className="dash-panel">
                <div className="dash-panel__title">
                  <span>
                    Entry #{index + 1} — {item.title}
                  </span>
                  <button
                    className="dash-btn dash-btn--danger"
                    style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem" }}
                    onClick={() => {
                      setChangelog(safeChangelog.filter((_, i) => i !== index))
                      showStatus("Removed changelog entry")
                    }}
                  >
                    Delete
                  </button>
                </div>

                <div className="dash-grid-2">
                  <div className="dash-form-group">
                    <label className="dash-label">Badge Type</label>
                    <select
                      className="dash-select"
                      value={item.badge}
                      onChange={(e) => {
                        const badge = e.target.value
                        const badgeClass =
                          badge === "Featured"
                            ? "badge--featured"
                            : "badge--fix"
                        const updated = [...safeChangelog]
                        updated[index] = {
                          ...updated[index],
                          badge,
                          badgeClass,
                        }
                        setChangelog(updated)
                      }}
                    >
                      <option value="Fix">Fix (Cyan)</option>
                      <option value="Featured">Featured (Gold)</option>
                    </select>
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">Date (YYYY-MM-DD)</label>
                    <input
                      type="date"
                      className="dash-input"
                      value={item.date || ""}
                      onChange={(e) => {
                        const date = e.target.value
                        const d = new Date(date)
                        const dateLabel = isNaN(d.getTime())
                          ? date
                          : d.toLocaleDateString("en-US", {
                              month: "short",
                              day: "2-digit",
                              year: "numeric",
                            })
                        const updated = [...safeChangelog]
                        updated[index] = { ...updated[index], date, dateLabel }
                        setChangelog(updated)
                      }}
                    />
                  </div>
                </div>

                <div className="dash-form-group">
                  <label className="dash-label">Title</label>
                  <input
                    type="text"
                    className="dash-input"
                    value={item.title || ""}
                    onChange={(e) => {
                      const updated = [...safeChangelog]
                      updated[index] = {
                        ...updated[index],
                        title: e.target.value,
                      }
                      setChangelog(updated)
                    }}
                  />
                </div>

                <div className="dash-form-group">
                  <label className="dash-label">
                    Description / Details (Optional)
                  </label>
                  <textarea
                    className="dash-textarea"
                    value={item.text || ""}
                    onChange={(e) => {
                      const updated = [...safeChangelog]
                      updated[index] = {
                        ...updated[index],
                        text: e.target.value,
                      }
                      setChangelog(updated)
                    }}
                  />
                </div>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
                marginTop: "1.5rem",
              }}
            >
              <button
                className="dash-btn dash-btn--secondary"
                onClick={() => {
                  resetChangelog()
                  showStatus("Reset changelog to defaults")
                }}
              >
                Reset Defaults
              </button>
            </div>
          </div>
        )}

        {/* --- FLEET / GAMES TAB --- */}
        {activeTab === "fleet" && (
          <div>
            <div className="dash-header">
              <div>
                <h1 className="dash-title">The Fleet (Games & Hype)</h1>
                <p className="dash-subtitle">
                  Manage games rising from the depths shown in the Fleet
                  section.
                </p>
              </div>
              <button
                className="dash-btn dash-btn--primary"
                onClick={() => {
                  const newGame = {
                    art: "/img/games/art-01.svg",
                    badge: "Hype",
                    genre: "Genre",
                    title: "New Game Title",
                    text: "A short description of this game.",
                  }
                  setFleet([...safeFleet, newGame])
                  showStatus("Added game to Fleet")
                }}
              >
                + Add Game Card
              </button>
            </div>

            {safeFleet.map((game, index) => (
              <div key={index} className="dash-panel">
                <div className="dash-panel__title">
                  <span>
                    Game #{index + 1} — {game.title}
                  </span>
                  <button
                    className="dash-btn dash-btn--danger"
                    style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem" }}
                    onClick={() => {
                      setFleet(safeFleet.filter((_, i) => i !== index))
                      showStatus("Removed game from Fleet")
                    }}
                  >
                    Delete
                  </button>
                </div>

                <div className="dash-grid-2">
                  <div className="dash-form-group">
                    <label className="dash-label">Title</label>
                    <input
                      type="text"
                      className="dash-input"
                      value={game.title || ""}
                      onChange={(e) => {
                        const updated = [...safeFleet]
                        updated[index] = {
                          ...updated[index],
                          title: e.target.value,
                        }
                        setFleet(updated)
                      }}
                    />
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">Genre</label>
                    <input
                      type="text"
                      className="dash-input"
                      value={game.genre || ""}
                      onChange={(e) => {
                        const updated = [...safeFleet]
                        updated[index] = {
                          ...updated[index],
                          genre: e.target.value,
                        }
                        setFleet(updated)
                      }}
                    />
                  </div>
                </div>

                <div className="dash-form-group">
                  <label className="dash-label">
                    Badge Label (e.g. Coming soon, Popular, Hype)
                  </label>
                  <input
                    type="text"
                    className="dash-input"
                    value={game.badge || ""}
                    onChange={(e) => {
                      const updated = [...safeFleet]
                      updated[index] = {
                        ...updated[index],
                        badge: e.target.value,
                      }
                      setFleet(updated)
                    }}
                  />
                </div>

                <GameImagePicker
                  value={game.art || ""}
                  gameTitle={game.title}
                  onChange={(newArt) => {
                    const updated = [...safeFleet]
                    updated[index] = {
                      ...updated[index],
                      art: newArt,
                    }
                    setFleet(updated)
                  }}
                />

                <div className="dash-form-group">
                  <label className="dash-label">Description</label>
                  <textarea
                    className="dash-textarea"
                    value={game.text || ""}
                    onChange={(e) => {
                      const updated = [...safeFleet]
                      updated[index] = {
                        ...updated[index],
                        text: e.target.value,
                      }
                      setFleet(updated)
                    }}
                  />
                </div>

                <div className="dash-form-group">
                  <label className="dash-label">
                    🔗 Game URL{" "}
                    <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>
                      (optional — opens in new tab when clicking "View Game")
                    </span>
                  </label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      type="url"
                      className="dash-input"
                      placeholder="https://store.steampowered.com/app/..."
                      value={game.url || ""}
                      onChange={(e) => {
                        const updated = [...safeFleet]
                        updated[index] = {
                          ...updated[index],
                          url: e.target.value,
                        }
                        setFleet(updated)
                      }}
                    />
                    {game.url && (
                      <a
                        href={game.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dash-btn dash-btn--secondary"
                        style={{
                          whiteSpace: "nowrap",
                          fontSize: "0.8rem",
                          padding: "0 0.75rem",
                        }}
                        title="Preview the URL"
                      >
                        ↗ Preview
                      </a>
                    )}
                  </div>
                  {game.url && (
                    <p
                      style={{
                        margin: "0.35rem 0 0",
                        fontSize: "0.72rem",
                        color: "var(--cyan)",
                        opacity: 0.8,
                      }}
                    >
                      ✓ "View Game" button is active and will open this URL in a
                      new tab.
                    </p>
                  )}
                  {!game.url && (
                    <p
                      style={{
                        margin: "0.35rem 0 0",
                        fontSize: "0.72rem",
                        color: "var(--text-dim)",
                      }}
                    >
                      Leave empty to keep the button disabled on the public
                      site.
                    </p>
                  )}
                </div>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
                marginTop: "1.5rem",
              }}
            >
              <button
                className="dash-btn dash-btn--secondary"
                onClick={() => {
                  resetFleet()
                  showStatus("Reset Fleet to defaults")
                }}
              >
                Reset Defaults
              </button>
            </div>
          </div>
        )}

        {/* --- DISCORD LINK TAB --- */}
        {activeTab === "discord" && (
          <div>
            <div className="dash-header">
              <div>
                <h1 className="dash-title">Discord Link & Live Stats</h1>
                <p className="dash-subtitle">
                  Update the site-wide Discord invite link and inspect real-time
                  server member stats.
                </p>
              </div>
            </div>

            {/* REAL-TIME DISCORD STATS PANEL */}
            <div
              className="dash-panel"
              style={{ borderLeft: "4px solid var(--cyan)" }}
            >
              <div
                className="dash-panel__title"
                style={{ color: "var(--cyan)" }}
              >
                <span>📡 Live Discord Server Widget Status</span>
                <span className="dash-tag dash-tag--cyan">
                  Guild ID: {auth.guildId}
                </span>
              </div>

              {discordStats.loading ? (
                <p style={{ color: "var(--text-dim)" }}>
                  Fetching real-time Discord server status...
                </p>
              ) : discordStats.presenceCount !== null ? (
                <div>
                  <div className="dash-grid-2" style={{ marginBottom: "1rem" }}>
                    <div
                      style={{
                        background: "var(--bg)",
                        padding: "1rem",
                        borderRadius: "var(--r-sm)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <span className="dash-label">Server Name</span>
                      <strong
                        style={{ fontSize: "1.1rem", color: "var(--text)" }}
                      >
                        {discordStats.serverName}
                      </strong>
                    </div>
                    <div
                      style={{
                        background: "var(--bg)",
                        padding: "1rem",
                        borderRadius: "var(--r-sm)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <span className="dash-label">
                        Realtime Online Members
                      </span>
                      <strong
                        style={{
                          fontSize: "1.4rem",
                          color: "#22c55e",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: "#22c55e",
                            boxShadow: "0 0 10px #22c55e",
                          }}
                        />
                        {discordStats.presenceCount} Online Now
                      </strong>
                    </div>
                  </div>

                  {discordStats.members.length > 0 && (
                    <div>
                      <span className="dash-label">
                        Online Members Sample ({discordStats.members.length})
                      </span>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.5rem",
                          marginTop: "0.5rem",
                        }}
                      >
                        {discordStats.members.slice(0, 10).map((m, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem",
                              background: "var(--bg)",
                              padding: "0.3rem 0.6rem",
                              borderRadius: "var(--r-pill)",
                              fontSize: "0.82rem",
                            }}
                          >
                            <img
                              src={m.avatar_url}
                              alt=""
                              width="20"
                              height="20"
                              style={{ borderRadius: "50%" }}
                            />
                            <span>{m.username}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="dash-alert dash-alert--info"
                  style={{ textAlign: "left" }}
                >
                  <strong>Realtime Stats Notice:</strong> Server Widget is
                  currently disabled or unreachable.
                  <br />
                  <br />
                  To display real-time live member counts on your website:
                  <ol style={{ marginLeft: "1.2rem", marginTop: "0.5rem" }}>
                    <li>
                      Open Discord → Server Settings → <strong>Widget</strong>
                    </li>
                    <li>
                      Toggle <strong>Enable Server Widget</strong> to ON
                    </li>
                  </ol>
                </div>
              )}
            </div>

            <div className="dash-panel">
              <div className="dash-form-group">
                <label className="dash-label">Discord Invite URL</label>
                <input
                  type="url"
                  className="dash-input"
                  value={discord?.url || ""}
                  onChange={(e) => {
                    setDiscord({ url: e.target.value })
                  }}
                  placeholder="https://discord.gg/thedarktides"
                />
              </div>

              <div
                style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}
              >
                <button
                  className="dash-btn dash-btn--primary"
                  onClick={() => showStatus("Discord link saved successfully")}
                >
                  Save Link
                </button>
                <button
                  className="dash-btn dash-btn--secondary"
                  onClick={() => {
                    resetDiscord()
                    showStatus("Reset Discord link")
                  }}
                >
                  Reset Default
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- ABOUT TAB --- */}
        {activeTab === "about" && (
          <div>
            <div className="dash-header">
              <div>
                <h1 className="dash-title">About Pillars</h1>
                <p className="dash-subtitle">
                  Configure the core pillars of The Dark Tides community hub.
                </p>
              </div>
            </div>

            {safeAbout.map((pillar, index) => (
              <div key={index} className="dash-panel">
                <div className="dash-panel__title">
                  Pillar #{index + 1} — {pillar.title}
                </div>
                <div className="dash-form-group">
                  <label className="dash-label">Title</label>
                  <input
                    type="text"
                    className="dash-input"
                    value={pillar.title || ""}
                    onChange={(e) => {
                      const updated = [...safeAbout]
                      updated[index] = {
                        ...updated[index],
                        title: e.target.value,
                      }
                      setAbout(updated)
                    }}
                  />
                </div>
                <div className="dash-form-group">
                  <label className="dash-label">Description</label>
                  <textarea
                    className="dash-textarea"
                    value={pillar.text || ""}
                    onChange={(e) => {
                      const updated = [...safeAbout]
                      updated[index] = {
                        ...updated[index],
                        text: e.target.value,
                      }
                      setAbout(updated)
                    }}
                  />
                </div>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
                marginTop: "1.5rem",
              }}
            >
              <button
                className="dash-btn dash-btn--secondary"
                onClick={() => {
                  resetAbout()
                  showStatus("Reset About pillars")
                }}
              >
                Reset Defaults
              </button>
            </div>
          </div>
        )}

        {/* --- TOOLS TAB --- */}
        {activeTab === "tools" && (
          <div>
            <div className="dash-header">
              <div>
                <h1 className="dash-title">Tools & Activations</h1>
                <p className="dash-subtitle">
                  Manage community tools such as Tides Downloader.
                </p>
              </div>
              <button
                className="dash-btn dash-btn--primary"
                onClick={() => {
                  const newTool = {
                    title: "New Tool Name",
                    text: "Description of the tool.",
                    ctaText: "Download / Info →",
                    href: "",
                  }
                  setTools([...safeTools, newTool])
                  showStatus("Added new tool")
                }}
              >
                + Add Tool Card
              </button>
            </div>

            {safeTools.map((tool, index) => (
              <div key={index} className="dash-panel">
                <div className="dash-panel__title">
                  <span>
                    Tool #{index + 1} — {tool.title}
                  </span>
                  <button
                    className="dash-btn dash-btn--danger"
                    style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem" }}
                    onClick={() => {
                      setTools(safeTools.filter((_, i) => i !== index))
                      showStatus("Removed tool")
                    }}
                  >
                    Delete
                  </button>
                </div>

                <div className="dash-form-group">
                  <label className="dash-label">Tool Title</label>
                  <input
                    type="text"
                    className="dash-input"
                    value={tool.title || ""}
                    onChange={(e) => {
                      const updated = [...safeTools]
                      updated[index] = {
                        ...updated[index],
                        title: e.target.value,
                      }
                      setTools(updated)
                    }}
                  />
                </div>

                <div className="dash-form-group">
                  <label className="dash-label">Description</label>
                  <textarea
                    className="dash-textarea"
                    value={tool.text || ""}
                    onChange={(e) => {
                      const updated = [...safeTools]
                      updated[index] = {
                        ...updated[index],
                        text: e.target.value,
                      }
                      setTools(updated)
                    }}
                  />
                </div>

                <div className="dash-grid-2">
                  <div className="dash-form-group">
                    <label className="dash-label">CTA Label</label>
                    <input
                      type="text"
                      className="dash-input"
                      value={tool.ctaText || ""}
                      onChange={(e) => {
                        const updated = [...safeTools]
                        updated[index] = {
                          ...updated[index],
                          ctaText: e.target.value,
                        }
                        setTools(updated)
                      }}
                    />
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">
                      CTA Link URL (Leave empty for Discord notice)
                    </label>
                    <input
                      type="text"
                      className="dash-input"
                      value={tool.href || ""}
                      onChange={(e) => {
                        const updated = [...safeTools]
                        updated[index] = {
                          ...updated[index],
                          href: e.target.value,
                        }
                        setTools(updated)
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
                marginTop: "1.5rem",
              }}
            >
              <button
                className="dash-btn dash-btn--secondary"
                onClick={() => {
                  resetTools()
                  showStatus("Reset tools")
                }}
              >
                Reset Defaults
              </button>
            </div>
          </div>
        )}

        {/* --- FAQ TAB --- */}
        {activeTab === "faq" && (
          <div>
            <div className="dash-header">
              <div>
                <h1 className="dash-title">FAQ Management</h1>
                <p className="dash-subtitle">
                  Manage the public FAQ list shown on the site. Changes update
                  the live FAQ section through the shared content store.
                </p>
              </div>
              <button
                className="dash-btn dash-btn--primary"
                onClick={() => {
                  setFaq([...safeFaq, createFaqItem()])
                  showStatus("Added FAQ item")
                }}
              >
                + Add FAQ Item
              </button>
            </div>

            {safeFaq.map((item, index) => (
              <div key={item.id || index} className="dash-panel">
                <div
                  className="dash-panel__title"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span>
                    FAQ #{index + 1} — {item.question || "Untitled question"}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.35rem",
                      marginLeft: "auto",
                    }}
                  >
                    <button
                      className="dash-btn dash-btn--secondary"
                      style={{ padding: "0.28rem 0.6rem", fontSize: "0.75rem" }}
                      onClick={() => {
                        if (index === 0) return
                        const updated = [...safeFaq]
                        ;[updated[index - 1], updated[index]] = [
                          updated[index],
                          updated[index - 1],
                        ]
                        setFaq(updated)
                      }}
                      disabled={index === 0}
                    >
                      ↑
                    </button>
                    <button
                      className="dash-btn dash-btn--secondary"
                      style={{ padding: "0.28rem 0.6rem", fontSize: "0.75rem" }}
                      onClick={() => {
                        if (index === safeFaq.length - 1) return
                        const updated = [...safeFaq]
                        ;[updated[index + 1], updated[index]] = [
                          updated[index],
                          updated[index + 1],
                        ]
                        setFaq(updated)
                      }}
                      disabled={index === safeFaq.length - 1}
                    >
                      ↓
                    </button>
                    <button
                      className="dash-btn dash-btn--danger"
                      style={{
                        padding: "0.28rem 0.75rem",
                        fontSize: "0.75rem",
                      }}
                      onClick={() => {
                        setFaq(safeFaq.filter((_, i) => i !== index))
                        showStatus("Removed FAQ item")
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="dash-form-group">
                  <label className="dash-label">Question</label>
                  <input
                    type="text"
                    className="dash-input"
                    value={item.question || ""}
                    onChange={(e) => {
                      const updated = [...safeFaq]
                      updated[index] = {
                        ...updated[index],
                        question: e.target.value,
                      }
                      setFaq(updated)
                    }}
                  />
                </div>

                <div className="dash-form-group">
                  <label className="dash-label">Answer</label>
                  <textarea
                    className="dash-textarea"
                    value={item.answer || ""}
                    onChange={(e) => {
                      const updated = [...safeFaq]
                      updated[index] = {
                        ...updated[index],
                        answer: e.target.value,
                      }
                      setFaq(updated)
                    }}
                  />
                </div>

                <div className="dash-form-group">
                  <label className="dash-label">Display Style</label>
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "var(--text)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(item.placeholder)}
                      onChange={(e) => {
                        const updated = [...safeFaq]
                        updated[index] = {
                          ...updated[index],
                          placeholder: e.target.checked,
                        }
                        setFaq(updated)
                      }}
                    />
                    Mark as placeholder entry
                  </label>
                </div>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
                marginTop: "1.5rem",
              }}
            >
              <button
                className="dash-btn dash-btn--secondary"
                onClick={() => {
                  resetFaq()
                  showStatus("Reset FAQ to defaults")
                }}
              >
                Reset Defaults
              </button>
            </div>
          </div>
        )}

        {/* --- STAFF TAB (STREAMLINED DISCORD ID AUTO-FETCH) --- */}
        {activeTab === "staff" && (
          <div>
            <div className="dash-header">
              <div>
                <h1 className="dash-title">Staff (Owners & Admins)</h1>
                <p className="dash-subtitle">
                  Manage server owners and administrative crew members simply by
                  entering their Discord User ID.
                </p>
              </div>
            </div>

            {/* OWNERS SECTION */}
            <div style={{ marginBottom: "2.5rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h2 style={{ fontSize: "1.3rem", color: "var(--moon)" }}>
                  Owners
                </h2>
                <button
                  className="dash-btn dash-btn--primary"
                  onClick={() => {
                    const newOwner = {
                      mono: "O",
                      name: "New Owner",
                      role: "Owner",
                      text: "Community leadership.",
                      discordId: "",
                      image: "",
                    }
                    setStaff({ ...staff, owners: [...safeOwners, newOwner] })
                    showStatus("Added Owner")
                  }}
                >
                  + Add Owner
                </button>
              </div>

              {safeOwners.map((owner, index) => (
                <div key={index} className="dash-panel">
                  <div
                    className="dash-panel__title"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    {owner.image ? (
                      <img
                        src={owner.image}
                        alt=""
                        width="28"
                        height="28"
                        style={{ borderRadius: "50%" }}
                      />
                    ) : (
                      <span className="dash-tag dash-tag--gold">
                        {owner.mono || "O"}
                      </span>
                    )}
                    <span>
                      Owner #{index + 1} — {owner.name}
                    </span>
                    <button
                      className="dash-btn dash-btn--danger"
                      style={{
                        padding: "0.3rem 0.75rem",
                        fontSize: "0.8rem",
                        marginLeft: "auto",
                      }}
                      onClick={() => {
                        const updatedOwners = safeOwners.filter(
                          (_, i) => i !== index,
                        )
                        setStaff({ ...staff, owners: updatedOwners })
                        showStatus("Removed Owner")
                      }}
                    >
                      Delete
                    </button>
                  </div>

                  {/* Redesigned Discord Profile Sync Box */}
                  <DiscordSyncField
                    label="Owner Discord Identity"
                    badge="Owner"
                    discordId={owner.discordId || ""}
                    onChangeId={(val) => {
                      const updated = [...safeOwners]
                      updated[index] = {
                        ...updated[index],
                        discordId: val,
                      }
                      setStaff({ ...staff, owners: updated })
                    }}
                    onFetch={() =>
                      handleFetchDiscordForCard(
                        `owner_${index}`,
                        owner.discordId,
                        (userInfo) => {
                          const updated = [...safeOwners]
                          updated[index] = {
                            ...updated[index],
                            name:
                              userInfo.name ||
                              userInfo.username ||
                              updated[index].name,
                            mono: userInfo.mono || updated[index].mono,
                            image: userInfo.avatar || updated[index].image,
                          }
                          setStaff({ ...staff, owners: updated })
                        },
                      )
                    }
                    loading={fetchLoading[`owner_${index}`]}
                    profile={{
                      name: owner.name,
                      image: owner.image,
                      mono: owner.mono,
                    }}
                    theme="gold"
                    hint="Enter Discord User ID and press Enter or Fetch to sync Owner name, monogram & avatar."
                  />

                  <div className="dash-form-group">
                    <label className="dash-label">Bio / Role Description</label>
                    <textarea
                      className="dash-textarea"
                      value={owner.text || ""}
                      onChange={(e) => {
                        const updated = [...safeOwners]
                        updated[index] = {
                          ...updated[index],
                          text: e.target.value,
                        }
                        setStaff({ ...staff, owners: updated })
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* ADMINS SECTION */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h2 style={{ fontSize: "1.3rem", color: "var(--cyan)" }}>
                  Admins
                </h2>
                <button
                  className="dash-btn dash-btn--primary"
                  onClick={() => {
                    const newAdmin = {
                      mono: "A",
                      name: "New Admin",
                      role: "Admin",
                      text: "Community moderation and guidance.",
                      discordId: "",
                      image: "",
                    }
                    setStaff({ ...staff, admins: [...safeAdmins, newAdmin] })
                    showStatus("Added Admin")
                  }}
                >
                  + Add Admin
                </button>
              </div>

              {safeAdmins.map((admin, index) => (
                <div key={index} className="dash-panel">
                  <div
                    className="dash-panel__title"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    {admin.image ? (
                      <img
                        src={admin.image}
                        alt=""
                        width="28"
                        height="28"
                        style={{ borderRadius: "50%" }}
                      />
                    ) : (
                      <span className="dash-tag dash-tag--cyan">
                        {admin.mono || "A"}
                      </span>
                    )}
                    <span>
                      Admin #{index + 1} — {admin.name}
                    </span>
                    <button
                      className="dash-btn dash-btn--danger"
                      style={{
                        padding: "0.3rem 0.75rem",
                        fontSize: "0.8rem",
                        marginLeft: "auto",
                      }}
                      onClick={() => {
                        const updatedAdmins = safeAdmins.filter(
                          (_, i) => i !== index,
                        )
                        setStaff({ ...staff, admins: updatedAdmins })
                        showStatus("Removed Admin")
                      }}
                    >
                      Delete
                    </button>
                  </div>

                  {/* Redesigned Discord Profile Sync Box */}
                  <DiscordSyncField
                    label="Admin Discord Identity"
                    badge="Admin"
                    discordId={admin.discordId || ""}
                    onChangeId={(val) => {
                      const updated = [...safeAdmins]
                      updated[index] = {
                        ...updated[index],
                        discordId: val,
                      }
                      setStaff({ ...staff, admins: updated })
                    }}
                    onFetch={() =>
                      handleFetchDiscordForCard(
                        `admin_${index}`,
                        admin.discordId,
                        (userInfo) => {
                          const updated = [...safeAdmins]
                          updated[index] = {
                            ...updated[index],
                            name:
                              userInfo.name ||
                              userInfo.username ||
                              updated[index].name,
                            mono: userInfo.mono || updated[index].mono,
                            image: userInfo.avatar || updated[index].image,
                          }
                          setStaff({ ...staff, admins: updated })
                        },
                      )
                    }
                    loading={fetchLoading[`admin_${index}`]}
                    profile={{
                      name: admin.name,
                      image: admin.image,
                      mono: admin.mono,
                    }}
                    theme="cyan"
                    hint="Enter Discord User ID and press Enter or Fetch to sync Admin name, monogram & avatar."
                  />

                  <div className="dash-form-group">
                    <label className="dash-label">Bio / Role Description</label>
                    <textarea
                      className="dash-textarea"
                      value={admin.text || ""}
                      onChange={(e) => {
                        const updated = [...safeAdmins]
                        updated[index] = {
                          ...updated[index],
                          text: e.target.value,
                        }
                        setStaff({ ...staff, admins: updated })
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
                marginTop: "1.5rem",
              }}
            >
              <button
                className="dash-btn dash-btn--secondary"
                onClick={() => {
                  resetStaff()
                  showStatus("Reset staff list")
                }}
              >
                Reset Defaults
              </button>
            </div>
          </div>
        )}

        {/* --- MULTIPLE DEVELOPERS TAB --- */}
        {activeTab === "developer" && (
          <div>
            <div className="dash-header">
              <div>
                <h1 className="dash-title">
                  Developer Section (Multiple Developers)
                </h1>
                <p className="dash-subtitle">
                  Add, edit, or remove developer profiles and auto-fetch Name &
                  Avatar from Discord IDs.
                </p>
              </div>
              <button
                className="dash-btn dash-btn--primary"
                onClick={() => {
                  const newDev = {
                    name: "New Developer",
                    role: "Developer",
                    text: "Description of tools and contributions to the community.",
                    image: "/img/people/dreamleak.svg",
                    lineage: [
                      "New Developer",
                      "Developer",
                      "Dark Tides Community",
                    ],
                    discordId: "",
                  }
                  setDev([...safeDevs, newDev])
                  showStatus("Added new Developer")
                }}
              >
                + Add Developer Card
              </button>
            </div>

            {safeDevs.map((devItem, index) => (
              <div key={index} className="dash-panel">
                <div
                  className="dash-panel__title"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  {devItem.image ? (
                    <img
                      src={devItem.image}
                      alt=""
                      width="28"
                      height="28"
                      style={{ borderRadius: "50%" }}
                    />
                  ) : (
                    <span className="dash-tag dash-tag--purple">DEV</span>
                  )}
                  <span>
                    Developer #{index + 1} — {devItem.name}
                  </span>
                  <button
                    className="dash-btn dash-btn--danger"
                    style={{
                      padding: "0.3rem 0.75rem",
                      fontSize: "0.8rem",
                      marginLeft: "auto",
                    }}
                    onClick={() => {
                      setDev(safeDevs.filter((_, i) => i !== index))
                      showStatus("Removed Developer")
                    }}
                  >
                    Delete
                  </button>
                </div>

                {/* Redesigned Discord Profile Sync Box */}
                <DiscordSyncField
                  label="Developer Discord Identity"
                  badge="Developer"
                  discordId={devItem.discordId || ""}
                  onChangeId={(val) => {
                    const updated = [...safeDevs]
                    updated[index] = {
                      ...updated[index],
                      discordId: val,
                    }
                    setDev(updated)
                  }}
                  onFetch={() =>
                    handleFetchDiscordForCard(
                      `dev_${index}`,
                      devItem.discordId,
                      (userInfo) => {
                        const updated = [...safeDevs]
                        updated[index] = {
                          ...updated[index],
                          name:
                            userInfo.name ||
                            userInfo.username ||
                            updated[index].name,
                          image: userInfo.avatar || updated[index].image,
                        }
                        setDev(updated)
                      },
                    )
                  }
                  loading={fetchLoading[`dev_${index}`]}
                  profile={{
                    name: devItem.name,
                    image: devItem.image,
                    mono: devItem.name
                      ? devItem.name.slice(0, 2).toUpperCase()
                      : "DV",
                  }}
                  theme="purple"
                  hint="Enter Developer Discord User ID and press Enter or Fetch to sync developer profile."
                />

                <div className="dash-form-group">
                  <label className="dash-label">Role Title</label>
                  <input
                    type="text"
                    className="dash-input"
                    value={devItem.role || ""}
                    onChange={(e) => {
                      const updated = [...safeDevs]
                      updated[index] = {
                        ...updated[index],
                        role: e.target.value,
                      }
                      setDev(updated)
                    }}
                  />
                </div>

                <div className="dash-form-group">
                  <label className="dash-label">Bio Text</label>
                  <textarea
                    className="dash-textarea"
                    value={devItem.text || ""}
                    onChange={(e) => {
                      const updated = [...safeDevs]
                      updated[index] = {
                        ...updated[index],
                        text: e.target.value,
                      }
                      setDev(updated)
                    }}
                  />
                </div>

                <div className="dash-form-group">
                  <label className="dash-label">
                    Lineage Nodes (Comma separated)
                  </label>
                  <input
                    type="text"
                    className="dash-input"
                    value={
                      Array.isArray(devItem.lineage)
                        ? devItem.lineage.join(", ")
                        : devItem.lineage || ""
                    }
                    onChange={(e) => {
                      const lineage = e.target.value
                        .split(",")
                        .map((s) => s.trim())
                      const updated = [...safeDevs]
                      updated[index] = { ...updated[index], lineage }
                      setDev(updated)
                    }}
                  />
                </div>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
                marginTop: "1.5rem",
              }}
            >
              <button
                className="dash-btn dash-btn--secondary"
                onClick={() => {
                  resetDev()
                  showStatus("Reset developer list to defaults")
                }}
              >
                Reset Defaults
              </button>
            </div>
          </div>
        )}

        {/* --- MULTIPLE BOTS TAB --- */}
        {activeTab === "luna" && (
          <div>
            <div className="dash-header">
              <div>
                <h1 className="dash-title">Bot Section (Multiple Bots)</h1>
                <p className="dash-subtitle">
                  Add, edit, or remove Discord community bots and auto-fetch
                  Name & Avatar from Discord IDs.
                </p>
              </div>
              <button
                className="dash-btn dash-btn--primary"
                onClick={() => {
                  const newBot = {
                    name: "New Bot",
                    meta: "Created by Community · Est. 2026",
                    text: "Description of what this bot does for the server.",
                    signoff: "Let's chat in Discord!",
                    image: "/img/people/luna.svg",
                    discordId: "",
                  }
                  setLuna([...safeBots, newBot])
                  showStatus("Added new Bot")
                }}
              >
                + Add Bot Card
              </button>
            </div>

            {safeBots.map((bot, index) => (
              <div key={index} className="dash-panel">
                <div
                  className="dash-panel__title"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  {bot.image ? (
                    <img
                      src={bot.image}
                      alt=""
                      width="28"
                      height="28"
                      style={{ borderRadius: "50%" }}
                    />
                  ) : (
                    <span className="dash-tag dash-tag--purple">BOT</span>
                  )}
                  <span>
                    Bot #{index + 1} — {bot.name}
                  </span>
                  <button
                    className="dash-btn dash-btn--danger"
                    style={{
                      padding: "0.3rem 0.75rem",
                      fontSize: "0.8rem",
                      marginLeft: "auto",
                    }}
                    onClick={() => {
                      setLuna(safeBots.filter((_, i) => i !== index))
                      showStatus("Removed Bot")
                    }}
                  >
                    Delete
                  </button>
                </div>

                {/* Redesigned Discord Profile Sync Box */}
                <DiscordSyncField
                  label="Bot Discord Identity"
                  badge="Bot"
                  placeholder="e.g. 123456789012345678"
                  discordId={bot.discordId || ""}
                  onChangeId={(val) => {
                    const updated = [...safeBots]
                    updated[index] = {
                      ...updated[index],
                      discordId: val,
                    }
                    setLuna(updated)
                  }}
                  onFetch={() =>
                    handleFetchDiscordForCard(
                      `bot_${index}`,
                      bot.discordId,
                      (userInfo) => {
                        const updated = [...safeBots]
                        updated[index] = {
                          ...updated[index],
                          name:
                            userInfo.name ||
                            userInfo.username ||
                            updated[index].name,
                          image: userInfo.avatar || updated[index].image,
                        }
                        setLuna(updated)
                      },
                    )
                  }
                  loading={fetchLoading[`bot_${index}`]}
                  profile={{
                    name: bot.name,
                    image: bot.image,
                    mono: bot.name ? bot.name.slice(0, 2).toUpperCase() : "BT",
                  }}
                  theme="purple"
                  hint="Enter Bot or Application Discord ID and press Enter or Fetch to sync bot name & avatar."
                />

                <div className="dash-grid-2">
                  <div className="dash-form-group">
                    <label className="dash-label">
                      Meta Line (e.g. Created by Community · Est. 2026)
                    </label>
                    <input
                      type="text"
                      className="dash-input"
                      value={bot.meta || ""}
                      onChange={(e) => {
                        const updated = [...safeBots]
                        updated[index] = {
                          ...updated[index],
                          meta: e.target.value,
                        }
                        setLuna(updated)
                      }}
                    />
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">
                      Sign-off Line (Optional)
                    </label>
                    <input
                      type="text"
                      className="dash-input"
                      value={bot.signoff || ""}
                      onChange={(e) => {
                        const updated = [...safeBots]
                        updated[index] = {
                          ...updated[index],
                          signoff: e.target.value,
                        }
                        setLuna(updated)
                      }}
                    />
                  </div>
                </div>

                <div className="dash-form-group">
                  <label className="dash-label">Description / Bio</label>
                  <textarea
                    className="dash-textarea"
                    value={bot.text || ""}
                    onChange={(e) => {
                      const updated = [...safeBots]
                      updated[index] = {
                        ...updated[index],
                        text: e.target.value,
                      }
                      setLuna(updated)
                    }}
                  />
                </div>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
                marginTop: "1.5rem",
              }}
            >
              <button
                className="dash-btn dash-btn--secondary"
                onClick={() => {
                  resetLuna()
                  showStatus("Reset bot list to defaults")
                }}
              >
                Reset Defaults
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
