import { cfg, parseCookies, setCookie, newSession, COOKIE, STATE_COOKIE } from "./_mc-auth.js"

export default async function handler(req, res) {
  const c = cfg()
  res.setHeader("Cache-Control", "no-store")
  const { code, state } = req.query
  const saved = parseCookies(req)[STATE_COOKIE]
  setCookie(res, STATE_COOKIE, "", 0)

  if (!c.secret || !c.clientSecret || !c.roleIds.length) {
    return res.status(500).send("Server auth is not configured")
  }
  if (!code || !state || !saved || state !== saved) {
    return res.redirect(302, "/?denied=1")
  }

  try {
    const tokenRes = await fetch("https://discord.com/api/v10/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: c.clientId,
        client_secret: c.clientSecret,
        grant_type: "authorization_code",
        code: String(code),
        redirect_uri: `${c.origin}/api/mc-callback`,
      }),
    })
    if (!tokenRes.ok) return res.redirect(302, "/?denied=1")
    const { access_token } = await tokenRes.json()
    const auth = { Authorization: `Bearer ${access_token}` }

    const memberRes = await fetch(
      `https://discord.com/api/v10/users/@me/guilds/${c.guildId}/member`,
      { headers: auth },
    )
    if (!memberRes.ok) return res.redirect(302, "/?denied=1")
    const member = await memberRes.json()

    const isAdmin = (member.roles || []).some((id) => c.roleIds.includes(id))
    if (!isAdmin) return res.redirect(302, "/?denied=1")

    setCookie(res, COOKIE, newSession(member.user, c.secret), 60 * 60)
    return res.redirect(302, "/")
  } catch {
    return res.redirect(302, "/?denied=1")
  }
}
