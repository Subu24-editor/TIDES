export async function fetchDiscordUser(userId) {
  const cleanId = (userId || "").toString().trim()
  if (!cleanId || !/^\d{17,20}$/.test(cleanId)) {
    throw new Error("Please enter a valid 17 to 20-digit Discord User/Bot ID.")
  }

  // Try fetching via local backend proxy first
  try {
    const res = await fetch(`/api/discord-user?id=${cleanId}`)
    if (res.ok) {
      const data = await res.json()
      if (data && data.name) {
        return data
      }
    }
  } catch (err) {
    console.warn("Local API proxy fetch failed, trying direct Discord API", err)
  }

  // Try direct fetch from Discord API v10
  try {
    const res = await fetch(`https://discord.com/api/v10/users/${cleanId}`)
    if (res.ok) {
      const data = await res.json()
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

      return {
        id: data.id,
        name: name,
        username: data.username,
        avatar: avatarUrl,
        mono: initials,
      }
    }
  } catch (err) {
    console.warn("Direct fetch failed, generating fallback avatar", err)
  }

  // Fallback avatar generation using Discord Snowflake math
  let defaultAvatarIndex = "0"
  try {
    defaultAvatarIndex = ((BigInt(cleanId) >> 22n) % 6n).toString()
  } catch {
    defaultAvatarIndex = "0"
  }

  return {
    id: cleanId,
    name: "",
    avatar: `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`,
    mono: "",
  }
}
