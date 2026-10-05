import { useCallback, useEffect, useState } from "react"
import { fallbackAvatar } from "../utils/avatarFallback.js"

const TTL = 12 * 60 * 60 * 1000 // re-check real avatars twice a day
const inflight = new Map()

// A local /img/... file is only a stand-in until the real Discord avatar loads.
const isPlaceholder = (src) => !src || src.startsWith("/img/")

function readCache(id) {
  try {
    const raw = localStorage.getItem(`dt-avatar:${id}`)
    if (!raw) return null
    const { url, t } = JSON.parse(raw)
    return url && Date.now() - t < TTL ? url : null
  } catch {
    return null
  }
}

function writeCache(id, url) {
  try {
    localStorage.setItem(`dt-avatar:${id}`, JSON.stringify({ url, t: Date.now() }))
  } catch {
    /* storage unavailable — fine */
  }
}

function lookup(id) {
  const cached = readCache(id)
  if (cached) return Promise.resolve(cached)
  if (!inflight.has(id)) {
    inflight.set(
      id,
      fetch(`/api/discord-user?id=${id}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          // only trust a real lookup (the API returns an empty name when it
          // could not reach Discord, and that must not replace a good image)
          const url = data && data.name && data.avatar ? data.avatar : null
          if (url) writeCache(id, url)
          return url
        })
        .catch(() => null)
        .finally(() => inflight.delete(id)),
    )
  }
  return inflight.get(id)
}

/**
 * Picks the best avatar for a person:
 *   stored image -> (real Discord avatar if the stored one is only a placeholder)
 *   -> generated monogram if an image ever fails to load.
 */
export default function useAvatar(person, fallbackSrc) {
  const stored = (person && person.image) || ""
  const id = person && person.discordId
  const name = person && person.name
  const [src, setSrc] = useState(stored || fallbackSrc || fallbackAvatar(name))

  useEffect(() => {
    setSrc(stored || fallbackSrc || fallbackAvatar(name))
    if (!id || !isPlaceholder(stored)) return
    let alive = true
    lookup(String(id)).then((url) => {
      if (alive && url) setSrc(url)
    })
    return () => {
      alive = false
    }
  }, [stored, id, name, fallbackSrc])

  const onError = useCallback(
    (e) => {
      const monogram = fallbackAvatar(name)
      if (e.currentTarget.src !== monogram) e.currentTarget.src = monogram
    },
    [name],
  )

  return { src, onError }
}
