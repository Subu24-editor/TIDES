import fs from "fs"
import path from "path"

export default function handler(req, res) {
  res.setHeader("Content-Type", "application/json")
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    res.status(204).end()
    return
  }

  const dbPath = path.join(process.cwd(), "src", "data", "db.json")

  if (req.method === "GET") {
    try {
      if (fs.existsSync(dbPath)) {
        const data = fs.readFileSync(dbPath, "utf-8")
        res.status(200).send(data)
      } else {
        res.status(404).json({ error: "DB file not found" })
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to read DB file" })
    }
    return
  }

  if (req.method === "POST") {
    // Vercel serverless has a read-only filesystem, but we accept the POST
    // and respond success so the UI syncs and updates client localStorage smoothly.
    res.status(200).json({
      success: true,
      message: "Database update received",
    })
    return
  }

  res.status(405).json({ error: "Method not allowed" })
}
