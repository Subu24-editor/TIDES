import { useState, useEffect } from "react"

const GUILD_ID = import.meta.env.VITE_DISCORD_GUILD_ID || "1498057802499883181"

export default function useDiscordStats() {
  const [stats, setStats] = useState({
    serverName: "The Dark Tides",
    presenceCount: null,
    instantInvite: null,
    members: [],
    loading: true,
    error: null,
    widgetEnabled: true,
  })

  useEffect(() => {
    let isMounted = true

    async function fetchWidget() {
      try {
        const res = await fetch(
          `https://discord.com/api/v10/guilds/${GUILD_ID}/widget.json`,
        )
        if (!isMounted) return

        if (!res.ok) {
          if (res.status === 403 || res.status === 404) {
            if (isMounted) {
              setStats((prev) => ({
                ...prev,
                loading: false,
                widgetEnabled: false,
                error:
                  "Server Widget is disabled in Discord Server Settings -> Widget",
              }))
            }
            return
          }
          throw new Error("Failed to fetch Discord server stats")
        }

        const data = await res.json()
        if (isMounted) {
          setStats({
            serverName: data.name || "The Dark Tides",
            presenceCount: data.presence_count ?? null,
            instantInvite: data.instant_invite || null,
            members: data.members || [],
            loading: false,
            error: null,
            widgetEnabled: true,
          })
        }
      } catch (err) {
        if (isMounted) {
          setStats((prev) => ({
            ...prev,
            loading: false,
            error: err.message,
          }))
        }
      }
    }

    fetchWidget()
    const interval = setInterval(fetchWidget, 30000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  return stats
}
