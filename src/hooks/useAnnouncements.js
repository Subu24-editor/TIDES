import { useEffect, useState } from "react"

/**
 * Recent posts from the Discord announcements channel, via
 * /api/discord-announcements. Returns [] whenever the feed isn't
 * configured or can't be reached, so the timeline simply shows the
 * curated changelog instead.
 */
export default function useAnnouncements(refreshMs = 5 * 60 * 1000) {
  const [items, setItems] = useState([])

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const res = await fetch("/api/discord-announcements", { cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (alive && Array.isArray(data.items)) setItems(data.items)
      } catch (err) {
        /* keep what we have */
      }
    }
    load()
    const id = setInterval(() => {
      if (!document.hidden) load()
    }, refreshMs)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [refreshMs])

  return items
}
