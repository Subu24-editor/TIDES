import http from "http"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env into process.env
const envPath = path.join(__dirname, ".env")
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8")
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (match) {
      const key = match[1]
      let value = match[2] || ""
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1)
      process.env[key] = value.trim()
    }
  })
}

const PORT = process.env.PORT || 3000
const DIST_DIR = path.join(__dirname, "dist")
const DB_PATH = path.join(__dirname, "src", "data", "db.json")

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
}

const server = http.createServer(async (req, res) => {
  // CORS & API Endpoint
  if (req.url === "/api/db" || req.url?.startsWith("/api/db?")) {
    res.setHeader("Content-Type", "application/json")
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")

    if (req.method === "OPTIONS") {
      res.statusCode = 204
      res.end()
      return
    }

    if (req.method === "GET") {
      try {
        if (fs.existsSync(DB_PATH)) {
          const data = fs.readFileSync(DB_PATH, "utf-8")
          res.statusCode = 200
          res.end(data)
        } else {
          res.statusCode = 404
          res.end(JSON.stringify({ error: "DB file not found" }))
        }
      } catch (err) {
        res.statusCode = 500
        res.end(JSON.stringify({ error: "Failed to read DB file" }))
      }
      return
    }

    if (req.method === "POST") {
      let body = ""
      req.on("data", (chunk) => {
        body += chunk.toString()
      })
      req.on("end", () => {
        try {
          const json = JSON.parse(body)
          fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
          fs.writeFileSync(DB_PATH, JSON.stringify(json, null, 2), "utf-8")
          res.statusCode = 200
          res.end(
            JSON.stringify({
              success: true,
              message: "Database updated on disk",
            }),
          )
        } catch (err) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: "Invalid JSON payload" }))
        }
      })
      return
    }

    res.statusCode = 405
    res.end(JSON.stringify({ error: "Method not allowed" }))
    return
  }

  // Discord User Lookup Endpoint
  if (req.url?.startsWith("/api/discord-user")) {
    res.setHeader("Content-Type", "application/json")
    res.setHeader("Access-Control-Allow-Origin", "*")

    const url = new URL(req.url, "http://localhost")
    const userId = url.searchParams.get("id")

    if (!userId || !/^\d{17,20}$/.test(userId)) {
      res.statusCode = 400
      res.end(JSON.stringify({ error: "Invalid Discord User ID" }))
      return
    }

    try {
      const headers = {
        "User-Agent": "TheDarkTides/1.0.0 (https://thedarktides.org)",
      }
      const botToken = (process.env.DISCORD_BOT_TOKEN || process.env.VITE_DISCORD_BOT_TOKEN)
      if (botToken) {
        headers["Authorization"] = `Bot ${botToken}`
      }

      const discordRes = await fetch(
        `https://discord.com/api/v10/users/${userId}`,
        { headers },
      )
      if (discordRes.ok) {
        const data = await discordRes.json()
        const name = data.global_name || data.username
        const avatarUrl = data.avatar
          ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=256`
          : `https://cdn.discordapp.com/embed/avatars/${(BigInt(data.id) >> 22n) % 6n}.png`
        const initials = name
          ? name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : "U"

        res.statusCode = 200
        res.end(
          JSON.stringify({
            id: data.id,
            name: name,
            username: data.username,
            avatar: avatarUrl,
            mono: initials,
          }),
        )
        return
      }
    } catch (err) {
      console.warn("Backend fetch to Discord API failed", err)
    }

    let defaultAvatarIndex = "0"
    try {
      defaultAvatarIndex = ((BigInt(userId) >> 22n) % 6n).toString()
    } catch {
      defaultAvatarIndex = "0"
    }

    res.statusCode = 200
    res.end(
      JSON.stringify({
        id: userId,
        name: "",
        avatar: `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`,
        mono: "",
      }),
    )
    return
  }

  // Discord announcements -> Updates timeline
  if (req.url?.startsWith("/api/discord-announcements")) {
    res.setHeader("Content-Type", "application/json")
    res.setHeader("Access-Control-Allow-Origin", "*")
    try {
      const { fetchAnnouncements } = await import("./api/discord-announcements.js")
      const data = await fetchAnnouncements()
      res.setHeader("Cache-Control", "public, max-age=30")
      res.statusCode = 200
      res.end(JSON.stringify(data))
    } catch (err) {
      res.statusCode = 502
      res.end(JSON.stringify({ error: "Announcements unavailable", hint: err.hint || String(err.message || err), items: [] }))
    }
    return
  }

  // Live Discord server stats (member + online counts)
  if (req.url?.startsWith("/api/discord-stats")) {
    res.setHeader("Content-Type", "application/json")
    res.setHeader("Access-Control-Allow-Origin", "*")
    try {
      const { fetchStats } = await import("./api/discord-stats.js")
      const stats = await fetchStats()
      if (!stats) {
        res.statusCode = 502
        res.end(JSON.stringify({ error: "Discord stats unavailable" }))
        return
      }
      res.setHeader("Cache-Control", "public, max-age=30")
      res.statusCode = 200
      res.end(JSON.stringify(stats))
    } catch (err) {
      res.statusCode = 500
      res.end(JSON.stringify({ error: "Stats handler failed" }))
    }
    return
  }

  // Discord Guild Roles Lookup Endpoint
  if (req.url?.startsWith("/api/discord-roles")) {
    res.setHeader("Content-Type", "application/json")
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type")

    if (req.method === "OPTIONS") {
      res.statusCode = 204
      res.end()
      return
    }

    const url = new URL(req.url, "http://localhost")
    const guildId =
      url.searchParams.get("guildId") ||
      process.env.VITE_DISCORD_GUILD_ID ||
      "1498057802499883181"

    const authHeader = req.headers["authorization"]
    const botToken = (process.env.DISCORD_BOT_TOKEN || process.env.VITE_DISCORD_BOT_TOKEN)

    try {
      const headers = {
        "User-Agent": "TheDarkTides/1.0.0 (https://thedarktides.org)",
      }
      if (botToken) {
        headers["Authorization"] = `Bot ${botToken}`
      } else if (authHeader) {
        headers["Authorization"] = authHeader
      }

      const discordRes = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/roles`,
        { headers },
      )
      if (discordRes.ok) {
        const roles = await discordRes.json()
        res.statusCode = 200
        res.end(JSON.stringify(roles))
        return
      }
    } catch (err) {
      console.warn("Failed to fetch Discord roles via backend proxy", err)
    }

    res.statusCode = 200
    res.end(JSON.stringify([]))
    return
  }

  // Serve static files from dist/
  let filePath = path.join(DIST_DIR, req.url === "/" ? "index.html" : req.url)

  if (req.url === "/dashboard" || req.url === "/dashboard/") {
    filePath = path.join(DIST_DIR, "dashboard.html")
  }

  const ext = path.extname(filePath).toLowerCase()
  const contentType = MIME_TYPES[ext] || "application/octet-stream"

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        fs.readFile(
          path.join(DIST_DIR, "index.html"),
          (indexErr, indexContent) => {
            if (indexErr) {
              res.writeHead(404, { "Content-Type": "text/plain" })
              res.end('404 Not Found — Run "npm run build" first')
            } else {
              res.writeHead(200, { "Content-Type": "text/html" })
              res.end(indexContent, "utf-8")
            }
          },
        )
      } else {
        res.writeHead(500)
        res.end(`Server Error: ${err.code}`)
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType })
      res.end(content, "utf-8")
    }
  })
})

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`)
  console.log(`Dashboard available at http://localhost:${PORT}/dashboard`)
  console.log(`Local JSON DB located at: ${DB_PATH}`)
})
