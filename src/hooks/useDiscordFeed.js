import { useEffect, useRef, useState } from "react"

/**
 * Live posts from a Discord channel via /api/discord-announcements?feed=...
 *
 * status: "loading" until the first answer, then "ready"; "error" only if the
 * very first request fails (later failures silently keep the last good data).
 * freshIds: ids of posts that appeared AFTER the first load, so a new
 * announcement can animate in while the visitor is on the page.
 * Polls while the tab is visible and again when the tab regains focus.
 */
export default function useDiscordFeed(feed = "announcements", refreshMs = 2 * 60 * 1000) {
  const [state, setState] = useState({ status: "loading", items: [], freshIds: [] })
  const seen = useRef(null)

  useEffect(() => {
    let alive = true

    async function load() {
      try {
        const res = await fetch(`/api/discord-announcements?feed=${encodeURIComponent(feed)}`, {
          cache: "no-store",
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!alive) return
        const items = Array.isArray(data.items) ? data.items : []
        const fresh = seen.current
          ? items.filter((item) => !seen.current.has(item.id)).map((item) => item.id)
          : []
        seen.current = new Set([...(seen.current || []), ...items.map((item) => item.id)])
        setState((prev) => ({
          status: "ready",
          items,
          freshIds: fresh.length ? [...new Set([...prev.freshIds, ...fresh])] : prev.freshIds,
        }))
      } catch (err) {
        if (alive) setState((prev) => (prev.status === "loading" ? { ...prev, status: "error" } : prev))
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
  }, [feed, refreshMs])

  return state
}
