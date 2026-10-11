import { getSession, stillAdmin } from "./_mc-auth.js"
import { MC_CONTENT } from "./_mc-content.js"

// The showcase content only ever leaves the server for verified admins.
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store")
  const s = getSession(req)
  if (!s || !(await stillAdmin(s))) return res.status(401).json({ error: "Unauthorized" })
  res.status(200).json(MC_CONTENT)
}
