export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json")
  res.setHeader("Access-Control-Allow-Origin", "*")

  const userId = req.query.id

  if (!userId || !/^\d{17,20}$/.test(userId)) {
    res.status(400).json({ error: "Invalid Discord User ID" })
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

      res.status(200).json({
        id: data.id,
        name: name,
        username: data.username,
        avatar: avatarUrl,
        mono: initials,
      })
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

  res.status(200).json({
    id: userId,
    name: "",
    avatar: `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`,
    mono: "",
  })
}
