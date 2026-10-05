import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { resolve, dirname } from "path"
import fs from "fs"

// Load .env into process.env for Vite middleware
const envFilePath = resolve(__dirname, ".env")
if (fs.existsSync(envFilePath)) {
  const envContent = fs.readFileSync(envFilePath, "utf-8")
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

function jsonDbPlugin() {
  const dbPath = resolve(__dirname, "src/data/db.json")

  const handleDbApi = (req, res) => {
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
        if (fs.existsSync(dbPath)) {
          const data = fs.readFileSync(dbPath, "utf-8")
          res.statusCode = 200
          res.end(data)
        } else {
          res.statusCode = 404
          res.end(JSON.stringify({ error: "Database file not found" }))
        }
      } catch (err) {
        res.statusCode = 500
        res.end(JSON.stringify({ error: "Failed to read DB file" }))
      }
    } else if (req.method === "POST") {
      let body = ""
      req.on("data", (chunk) => {
        body += chunk.toString()
      })
      req.on("end", () => {
        try {
          const json = JSON.parse(body)
          fs.mkdirSync(dirname(dbPath), { recursive: true })
          fs.writeFileSync(dbPath, JSON.stringify(json, null, 2), "utf-8")
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
    } else {
      res.statusCode = 405
      res.end(JSON.stringify({ error: "Method not allowed" }))
    }
  }

  const handleDiscordUserApi = async (req, res) => {
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
  }

  const handleDiscordRolesApi = async (req, res) => {
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
  }

  const handleDiscordStatsApi = async (req, res) => {
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
  }

  return {
    name: "json-db-api",
    configureServer(server) {
      server.middlewares.use("/api/db", handleDbApi)
      server.middlewares.use("/api/discord-user", handleDiscordUserApi)
      server.middlewares.use("/api/discord-roles", handleDiscordRolesApi)
      server.middlewares.use("/api/discord-stats", handleDiscordStatsApi)
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/db", handleDbApi)
      server.middlewares.use("/api/discord-user", handleDiscordUserApi)
      server.middlewares.use("/api/discord-roles", handleDiscordRolesApi)
      server.middlewares.use("/api/discord-stats", handleDiscordStatsApi)
    },
  }
}

export default defineConfig({
  plugins: [react(), jsonDbPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        dashboard: resolve(__dirname, "dashboard.html"),
      },
    },
  },
})
