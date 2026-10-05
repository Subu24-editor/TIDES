/**
 * Live Discord server stats for the public site.
 *
 * Tries three sources, best first, and returns the first that works:
 *   1. bot   - GET /guilds/{id}?with_counts=true  (needs DISCORD_BOT_TOKEN, bot must be in the server)
 *   2. invite - GET /invites/{code}?with_counts=true (no token; needs a permanent invite code)
 *   3. widget - GET /guilds/{id}/widget.json        (online count only; Widget must be enabled)
 *
 * Discord only exposes `approximate_*` counts over HTTP. In practice they track the
 * real number to within a few members; they are refreshed by Discord every few minutes.
 */

const API = "https://discord.com/api/v10"
const USER_AGENT = "TheDarkTides/1.0.0 (https://darktides.online)"

async function getJson(url, headers = {}) {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, ...headers },
    signal: AbortSignal.timeout(6000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

const isCount = (n) => typeof n === "number" && Number.isFinite(n) && n >= 0

export async function fetchStats() {
  const guildId =
    process.env.DISCORD_GUILD_ID ||
    process.env.VITE_DISCORD_GUILD_ID ||
    "1498057802499883181"
  const inviteCode = process.env.DISCORD_INVITE_CODE || "thedarktides"
  const botToken =
    process.env.DISCORD_BOT_TOKEN || process.env.VITE_DISCORD_BOT_TOKEN

  const sources = []

  if (botToken) {
    sources.push([
      "bot",
      async () => {
        const d = await getJson(`${API}/guilds/${guildId}?with_counts=true`, {
          Authorization: `Bot ${botToken}`,
        })
        return {
          name: d.name,
          members: d.approximate_member_count,
          online: d.approximate_presence_count,
        }
      },
    ])
  }

  sources.push([
    "invite",
    async () => {
      const d = await getJson(
        `${API}/invites/${encodeURIComponent(inviteCode)}?with_counts=true`,
      )
      return {
        name: d.guild && d.guild.name,
        members: d.approximate_member_count,
        online: d.approximate_presence_count,
      }
    },
  ])

  sources.push([
    "widget",
    async () => {
      const d = await getJson(`${API}/guilds/${guildId}/widget.json`)
      return { name: d.name, members: null, online: d.presence_count }
    },
  ])

  for (const [source, load] of sources) {
    try {
      const data = await load()
      if (isCount(data.members) || isCount(data.online)) {
        return {
          name: data.name || "The Dark Tides",
          members: isCount(data.members) ? data.members : null,
          online: isCount(data.online) ? data.online : null,
          source,
          updatedAt: new Date().toISOString(),
        }
      }
    } catch (err) {
      // fall through to the next source
    }
  }
  return null
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json")
  res.setHeader("Access-Control-Allow-Origin", "*")

  if (req.method === "OPTIONS") {
    res.status(204).end()
    return
  }

  const stats = await fetchStats()
  if (!stats) {
    res.setHeader("Cache-Control", "no-store")
    res.status(502).json({ error: "Discord stats unavailable" })
    return
  }

  // Edge-cache for a minute and serve stale while refreshing, so traffic
  // spikes never hammer Discord's rate limits.
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300")
  res.status(200).json(stats)
}
