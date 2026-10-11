import crypto from "crypto"

export const COOKIE = "mc_session"
export const STATE_COOKIE = "mc_state"
const SESSION_SECONDS = 60 * 60

export function cfg() {
  return {
    clientId: process.env.DISCORD_CLIENT_ID || process.env.VITE_DISCORD_CLIENT_ID || "",
    clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
    guildId:
      process.env.DISCORD_GUILD_ID ||
      process.env.VITE_DISCORD_GUILD_ID ||
      "1498057802499883181",
    // Fail closed: if no role IDs are configured, nobody gets in.
    roleIds: (process.env.MC_ADMIN_ROLE_IDS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    secret: process.env.MC_SESSION_SECRET || "",
    botToken: process.env.DISCORD_BOT_TOKEN || "",
    origin: process.env.MC_ORIGIN || "https://mc.darktides.online",
  }
}

export function sign(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url")
  return `${body}.${sig}`
}

export function verify(token, secret) {
  if (!token || !secret) return null
  const [body, sig] = token.split(".")
  if (!body || !sig) return null
  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url")
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString())
    if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null
    return data
  } catch {
    return null
  }
}

export function parseCookies(req) {
  const out = {}
  for (const part of (req.headers.cookie || "").split(";")) {
    const i = part.indexOf("=")
    if (i > -1) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim())
  }
  return out
}

export function setCookie(res, name, value, maxAge) {
  const c = `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`
  const prev = res.getHeader("Set-Cookie")
  res.setHeader("Set-Cookie", prev ? [].concat(prev, c) : c)
}

export function newSession(user, secret) {
  return sign(
    {
      uid: user.id,
      name: user.global_name || user.username,
      exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
    },
    secret,
  )
}

export function getSession(req) {
  const { secret } = cfg()
  return verify(parseCookies(req)[COOKIE], secret)
}

// Optional instant-revocation: if a bot token is configured, re-check the
// member's roles against Discord on every protected request.
export async function stillAdmin(session) {
  const { botToken, guildId, roleIds } = cfg()
  if (!botToken) return true
  try {
    const r = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${session.uid}`,
      { headers: { Authorization: `Bot ${botToken}` } },
    )
    if (!r.ok) return false
    const m = await r.json()
    return (m.roles || []).some((id) => roleIds.includes(id))
  } catch {
    return false
  }
}
