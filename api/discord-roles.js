export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json")
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type")

  if (req.method === "OPTIONS") {
    res.status(204).end()
    return
  }

  const guildId =
    req.query.guildId ||
    process.env.VITE_DISCORD_GUILD_ID ||
    "1498057802499883181"

  const authHeader = req.headers["authorization"]
  const botToken = process.env.VITE_DISCORD_BOT_TOKEN

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
      {
        headers,
      },
    )
    if (discordRes.ok) {
      const roles = await discordRes.json()
      res.status(200).json(roles)
      return
    }
  } catch (err) {
    console.warn("Failed to fetch Discord roles via backend proxy", err)
  }

  res.status(200).json([])
}
