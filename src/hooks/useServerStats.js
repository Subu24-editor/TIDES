import { useEffect, useState } from "react"

/**
 * Live Discord server numbers for the public site (members + online),
 * served by /api/discord-stats. Refreshes every minute while the tab is
 * visible and again when the tab regains focus. If the API is unreachable
 * the previous values are kept and `live` stays false until the first success.
 */
export default function useServerStats(refreshMs = 60000) {
  const [stats, setStats] = useState({
    live: false,
    name: null,
    members: null,
    online: null,
  })

  useEffect(() => {
    let alive = true

    async function load() {
      try {
        const res = await fetch("/api/discord-stats", { cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!alive) return
        setStats({
          live: true,
          name: data.name || null,
          members: typeof data.members === "number" ? data.members : null,
          online: typeof data.online === "number" ? data.online : null,
        })
      } catch (err) {
        // keep whatever we had; the UI falls back gracefully
      }
    }

    load()
    const interval = setInterval(() => {
      if (!document.hidden) load()
    }, refreshMs)
    const onVisible = () => {
      if (!document.hidden) load()
    }
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      alive = false
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [refreshMs])

  return stats
}
