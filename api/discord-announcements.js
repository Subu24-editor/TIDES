/**
 * Pulls recent messages from a Discord announcements channel so the
 * "Updates & Events" timeline stays in sync with the server.
 *
 * Setup (all server-side, in Vercel -> Settings -> Environment Variables):
 *   DISCORD_ANNOUNCEMENTS_CHANNEL_ID  the channel to mirror (use a PUBLIC channel)
 *   DISCORD_BOT_TOKEN                 bot needs View Channel + Read Message History there
 * The bot also needs the "Message Content Intent" switched on in the Discord
 * Developer Portal (Bot tab), otherwise Discord returns every message with empty text.
 */

const API = "https://discord.com/api/v10"
const DEFAULT_GUILD_ID = "1498057802499883181"

// Two feeds, two channels (each can be overridden from Vercel env vars):
//   announcements -> the public Announcements section   (DISCORD_ANNOUNCEMENTS_CHANNEL_ID)
//   updates       -> merged into the Updates timeline   (DISCORD_UPDATES_CHANNEL_ID)
const FEEDS = {
  announcements: { env: "DISCORD_ANNOUNCEMENTS_CHANNEL_ID", fallback: "1498745528534565075" },
  updates: { env: "DISCORD_UPDATES_CHANNEL_ID", fallback: "1547570522663948349" },
}
const USER_AGENT = "TheDarkTides/1.0.0 (https://darktides.online)"
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function dateLabel(iso) {
  const d = new Date(iso)
  return `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, "0")}, ${d.getUTCFullYear()}`
}

/** Discord markdown -> plain, readable text. */
export function cleanText(input) {
  return String(input || "")
    .replace(/<a?:\w+:\d+>/g, "") // custom emoji
    .replace(/<@&\d+>/g, "@role")
    .replace(/<@!?\d+>/g, "@member")
    .replace(/<#\d+>/g, "#channel")
    .replace(/<t:\d+(?::\w)?>/g, "")
    .replace(/@(everyone|here)/g, "")
    .replace(/^\s{0,3}#{1,3}\s+/gm, "") // headings
    .replace(/^\s*-#\s+/gm, "") // subtext
    .replace(/(\*\*|__|~~|\|\|)/g, "") // bold / underline / strike / spoiler
    .replace(/(^|[^\w*])\*(?!\s)([^*\n]+?)\*(?!\w)/g, "$1$2") // italics
    .replace(/`{1,3}/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function firstImage(msg) {
  const att = (msg.attachments || []).find(
    (a) => (a.content_type || "").startsWith("image/") && a.url,
  )
  if (att) return att.proxy_url || att.url
  const emb = (msg.embeds || []).find((e) => (e.image && e.image.url) || (e.thumbnail && e.thumbnail.url))
  if (emb) return (emb.image && emb.image.url) || emb.thumbnail.url
  return null
}

export function toUpdate(msg) {
  // 0 = normal message, 19 = reply; ignore joins, pins notices, etc.
  if (msg.type !== 0 && msg.type !== 19) return null

  let body = cleanText(msg.content)
  const embed = (msg.embeds || [])[0]
  if (!body && embed) body = cleanText([embed.title, embed.description].filter(Boolean).join("\n"))
  if (!body) return null

  const lines = body.split("\n").map((l) => l.trim()).filter(Boolean)
  let title = lines[0]
  let text = lines.slice(1).join("\n")
  if (title.length > 90) {
    // no natural headline: use the start of the message as the title
    const cut = title.slice(0, 90).replace(/\s+\S*$/, "")
    text = [title.slice(cut.length).trim(), text].filter(Boolean).join("\n")
    title = cut + "…"
  }
  if (text.length > 320) text = text.slice(0, 320).replace(/\s+\S*$/, "") + "…"

  const pinned = Boolean(msg.pinned)
  return {
    source: "discord",
    id: msg.id,
    badge: pinned ? "Featured" : "Announcement",
    badgeClass: pinned ? "badge--featured" : "badge--announce",
    date: msg.timestamp.slice(0, 10),
    dateLabel: dateLabel(msg.timestamp),
    title,
    text: text || null,
    image: firstImage(msg),
  }
}

function avatarUrl(user) {
  if (!user) return null
  if (user.avatar) {
    const ext = user.avatar.startsWith("a_") ? "gif" : "png"
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=64`
  }
  try {
    return `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(user.id) >> 22n) % 6n)}.png`
  } catch {
    return null
  }
}

function allImages(msg, max = 4) {
  const urls = []
  for (const a of msg.attachments || []) {
    if ((a.content_type || "").startsWith("image/") && a.url) urls.push(a.proxy_url || a.url)
  }
  for (const e of msg.embeds || []) {
    const u = (e.image && e.image.url) || (e.thumbnail && e.thumbnail.url)
    if (u) urls.push(u)
  }
  return [...new Set(urls)].slice(0, max)
}

function topReactions(msg, max = 4) {
  return (msg.reactions || [])
    .filter((r) => r && r.emoji && r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, max)
    .map((r) => ({
      count: r.count,
      emoji: r.emoji.id ? null : r.emoji.name,
      customId: r.emoji.id || null,
      animated: Boolean(r.emoji.animated),
      name: r.emoji.name || "",
    }))
}

/** Full announcement post for the public Announcements section. */
export function toPost(msg, ctx = {}) {
  if (msg.type !== 0 && msg.type !== 19) return null
  let body = cleanText(msg.content)
  const embed = (msg.embeds || [])[0]
  if (!body && embed) body = cleanText([embed.title, embed.description].filter(Boolean).join("\n"))
  const images = allImages(msg)
  if (!body && images.length === 0) return null

  const lines = body.split("\n").map((l) => l.trim()).filter(Boolean)
  let title = lines[0] || ""
  let text = lines.slice(1).join("\n")
  if (title.length > 110) {
    const cut = title.slice(0, 110).replace(/\s+\S*$/, "")
    text = [title.slice(cut.length).trim(), text].filter(Boolean).join("\n")
    title = cut + "…"
  }
  if (text.length > 1400) text = text.slice(0, 1400).replace(/\s+\S*$/, "") + "…"

  const guild = ctx.guildId || DEFAULT_GUILD_ID
  const channel = ctx.channelId || ""
  return {
    source: "discord",
    id: msg.id,
    url: channel ? `https://discord.com/channels/${guild}/${channel}/${msg.id}` : null,
    author: {
      name: (msg.author && (msg.author.global_name || msg.author.username)) || "",
      avatar: avatarUrl(msg.author),
    },
    timestamp: msg.timestamp,
    edited: Boolean(msg.edited_timestamp),
    date: msg.timestamp.slice(0, 10),
    dateLabel: dateLabel(msg.timestamp),
    title,
    text: text || null,
    images,
    pinned: Boolean(msg.pinned),
    reactions: topReactions(msg),
  }
}

function hintFor(status) {
  if (status === 401) return "Bot token rejected (401): reset the token in the Discord Developer Portal and update DISCORD_BOT_TOKEN in Vercel, then redeploy."
  if (status === 403) return "The bot cannot see this channel (403): give it View Channel and Read Message History there, and make sure it is in the server."
  if (status === 404) return "Channel not found (404): check the channel ID, and that the bot is in the server."
  return `Discord answered HTTP ${status}.`
}

export async function fetchAnnouncements({ feed = "announcements", limit } = {}) {
  const cfg = FEEDS[feed] || FEEDS.announcements
  const channelId = process.env[cfg.env] || cfg.fallback
  const guildId =
    process.env.DISCORD_GUILD_ID || process.env.VITE_DISCORD_GUILD_ID || DEFAULT_GUILD_ID
  const botToken = process.env.DISCORD_BOT_TOKEN || process.env.VITE_DISCORD_BOT_TOKEN
  if (!botToken) {
    return {
      configured: false,
      items: [],
      hint: "No bot token on the server: add DISCORD_BOT_TOKEN in Vercel (Settings -> Environment Variables) and redeploy.",
    }
  }

  const res = await fetch(`${API}/channels/${encodeURIComponent(channelId)}/messages?limit=50`, {
    headers: { Authorization: `Bot ${botToken}`, "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(6000),
  })
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`)
    err.hint = hintFor(res.status)
    throw err
  }
  const messages = await res.json()
  const list = Array.isArray(messages) ? messages : []
  const rich = feed !== "updates"
  const items = list
    .map((m) => (rich ? toPost(m, { guildId, channelId }) : toUpdate(m)))
    .filter(Boolean)
    .slice(0, limit || (rich ? 9 : 12))

  let hint
  if (list.length === 0) {
    hint = "The channel returned no messages: it may be empty, or the bot lacks Read Message History."
  } else if (items.length === 0) {
    hint = "Messages were found but all came back empty: turn on Message Content Intent in the Discord Developer Portal (Bot tab) for this bot."
  }
  return { configured: true, feed, items, ...(hint ? { hint } : {}) }
}

export function feedFromRequest(req) {
  try {
    const q = req.query && req.query.feed
    const feed = q || new URL(req.url || "", "http://local").searchParams.get("feed")
    return FEEDS[feed] ? feed : "announcements"
  } catch {
    return "announcements"
  }
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json")
  res.setHeader("Access-Control-Allow-Origin", "*")
  if (req.method === "OPTIONS") {
    res.status(204).end()
    return
  }
  try {
    const feed = feedFromRequest(req)
    const data = await fetchAnnouncements({ feed })
    // short edge cache: new announcements show up within about a minute
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300")
    res.status(200).json(data)
  } catch (err) {
    res.setHeader("Cache-Control", "no-store")
    res.status(502).json({ error: "Announcements unavailable", hint: err.hint || String(err.message || err), items: [] })
  }
}
