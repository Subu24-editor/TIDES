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

export async function fetchAnnouncements(limit = 12) {
  const channelId = process.env.DISCORD_ANNOUNCEMENTS_CHANNEL_ID
  const botToken = process.env.DISCORD_BOT_TOKEN || process.env.VITE_DISCORD_BOT_TOKEN
  if (!channelId || !botToken) return { configured: false, items: [] }

  const res = await fetch(`${API}/channels/${encodeURIComponent(channelId)}/messages?limit=50`, {
    headers: { Authorization: `Bot ${botToken}`, "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(6000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const messages = await res.json()
  const items = (Array.isArray(messages) ? messages : [])
    .map(toUpdate)
    .filter(Boolean)
    .slice(0, limit)
  return { configured: true, items }
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json")
  res.setHeader("Access-Control-Allow-Origin", "*")
  if (req.method === "OPTIONS") {
    res.status(204).end()
    return
  }
  try {
    const data = await fetchAnnouncements()
    res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600")
    res.status(200).json(data)
  } catch (err) {
    res.setHeader("Cache-Control", "no-store")
    res.status(502).json({ error: "Announcements unavailable", items: [] })
  }
}
