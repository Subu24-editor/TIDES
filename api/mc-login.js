import crypto from "crypto"
import { cfg, setCookie, STATE_COOKIE } from "./_mc-auth.js"

export default function handler(req, res) {
  const { clientId, origin } = cfg()
  if (!clientId) return res.status(500).send("Discord client ID not configured")
  const state = crypto.randomBytes(16).toString("hex")
  setCookie(res, STATE_COOKIE, state, 600)
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${origin}/api/mc-callback`,
    response_type: "code",
    scope: "identify guilds.members.read",
    state,
    prompt: "none",
  })
  res.setHeader("Cache-Control", "no-store")
  res.redirect(302, `https://discord.com/api/oauth2/authorize?${params}`)
}
