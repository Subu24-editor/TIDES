/**
 * Mirrors the Minecraft catalog channel into the admin-only showcase.
 *
 * Server-side env (Vercel):
 *   DISCORD_BOT_TOKEN          bot needs View Channel + Read Message History on the channel
 *   MC_CATALOG_CHANNEL_ID      optional override (defaults to the catalog channel below)
 * The bot also needs "Message Content Intent" enabled (Developer Portal -> Bot),
 * otherwise Discord returns message text as empty.
 *
 * Each message becomes one card. Messages that mention "token" go in the
 * Tokens section; everything else is a game. Adjust classify() if your
 * channel uses a different convention.
 */
import { cleanText } from "./discord-announcements.js"

const API = "https://discord.com/api/v10"
const DEFAULT_CHANNEL_ID = "1500238664310067382"
const FALLBACK_ART = ["/img/games/art-01.svg", "/img/games/art-02.svg", "/img/games/art-03.svg"]

let cache = { at: 0, data: null }
const TTL_MS = 30_000

function imageOf(msg) {
  const att = (msg.attachments || []).find((a) => (a.content_type || "").startsWith("image/") && a.url)
  if (att) return att.url
  for (const e of msg.embeds || []) {
    const u = (e.image && e.image.url) || (e.thumbnail && e.thumbnail.url)
    if (u) return u
  }
  return null
}

function linkOf(msg) {
  const e = (msg.embeds || [])[0]
  if (e && e.url && !/discord\.(com|gg)/.test(e.url)) return e.url
  const m = String(msg.content || "").match(/https?:\/\/[^\s)>]+/)
  return m && !/discord\.(com|gg)/.test(m[0]) ? m[0] : ""
}

export function parseMessage(msg) {
  if (msg.type !== 0 && msg.type !== 19) return null
  const embed = (msg.embeds || [])[0]
  const fields = ((embed && embed.fields) || []).map((f) => ({
    name: cleanText(f.name),
    value: cleanText(f.value),
  }))

  let title = ""
  let text = ""
  if (embed && (embed.title || embed.description)) {
    title = cleanText(embed.title)
    text = cleanText(embed.description)
  }
  const body = cleanText(msg.content)
  if (!title && body) {
    const lines = body.split("\n").filter((l) => l.trim())
    title = lines.shift() || ""
    text = [text, ...lines].filter(Boolean).join("\n")
  } else if (body) {
    text = [body, text].filter(Boolean).join("\n")
  }
  if (!title) return null

  const pick = (re) => (fields.find((f) => re.test(f.name)) || {}).value || ""
  return {
    id: msg.id,
    title: title.slice(0, 120),
    text: text.slice(0, 500),
    genre: pick(/genre|type|category/i),
    badge: pick(/status|badge/i),
    details: fields.filter((f) => !/^(genre|type|category|status|badge)$/i.test(f.name)),
    art: imageOf(msg),
    url: linkOf(msg),
    isToken: /token/i.test([title, text, ...fields.map((f) => f.name)].join(" ")),
  }
}

export async function fetchCatalog() {
  const botToken = process.env.DISCORD_BOT_TOKEN
  if (!botToken) return null
  if (cache.data && Date.now() - cache.at < TTL_MS) return cache.data

  const channel = process.env.MC_CATALOG_CHANNEL_ID || DEFAULT_CHANNEL_ID
  try {
    const r = await fetch(`${API}/channels/${channel}/messages?limit=100`, {
      headers: {
        Authorization: `Bot ${botToken}`,
        "User-Agent": "TheDarkTides/1.0.0 (https://darktides.online)",
      },
    })
    if (!r.ok) return null
    const items = (await r.json()).reverse().map(parseMessage).filter(Boolean) // oldest first

    const data = {
      games: items
        .filter((i) => !i.isToken)
        .map((i, n) => ({ ...i, art: i.art || FALLBACK_ART[n % FALLBACK_ART.length] })),
      tokens: items.filter((i) => i.isToken),
      synced: new Date().toISOString(),
    }
    cache = { at: Date.now(), data }
    return data
  } catch {
    return null
  }
}
