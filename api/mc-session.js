import { getSession, stillAdmin } from "./_mc-auth.js"

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store")
  const s = getSession(req)
  if (!s || !(await stillAdmin(s))) return res.status(200).json({ authorized: false })
  res.status(200).json({ authorized: true, name: s.name })
}
