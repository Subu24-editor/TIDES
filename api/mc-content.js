import { getSession, stillAdmin } from "./_mc-auth.js"
import { MC_CONTENT } from "./_mc-content.js"
import { fetchCatalog } from "./_mc-catalog.js"

// The showcase content only ever leaves the server for verified admins.
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store")
  const s = getSession(req)
  if (!s || !(await stillAdmin(s))) return res.status(401).json({ error: "Unauthorized" })

  const live = await fetchCatalog() // null if the bot/channel isn't reachable
  res.status(200).json(live ? { ...MC_CONTENT, ...live, live: true } : { ...MC_CONTENT, tokens: [], live: false })
}
