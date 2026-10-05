import { useCallback, useEffect, useState } from "react"
import { fallbackAvatar } from "../utils/avatarFallback.js"

const TTL = 12 * 60 * 60 * 1000 // re-check real avatars twice a day
const inflight = new Map()

// A local /img/... file is only a stand-in until the real Discord avatar loads.
const isPlaceholder = (src) => !src || src.startsWith("/img/")

function readCache(id) {
  try {
    const raw = localStorage.getItem(`dt-profile:${id}`)
    if (!raw) return null
    const { url, name, t } = JSON.parse(raw)
    return url && Date.now() - t < TTL ? { url, name: name || "" } : null
  } catch {
    return null
  }
}

function writeCache(id, profile) {
  try {
    localStorage.setItem(`dt-profile:${id}`, JSON.stringify({ ...profile, t: Date.now() }))
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
          const profile =
            data && data.name && data.avatar ? { url: data.avatar, name: data.name } : null
          if (profile) writeCache(id, profile)
          return profile
        })
        .catch(() => null)
        .finally(() => inflight.delete(id)),
    )
  }
  return inflight.get(id)
}

/**
 * Picks the best avatar for a person:
 *   stored image -> real Discord avatar when the stored one is only a local
 *   placeholder, or when the person has `syncDiscord: true` (always follow
 *   their live Discord avatar and display name)
 *   -> generated monogram if an image ever fails to load.
 */
export default function useAvatar(person, fallbackSrc) {
  const stored = (person && person.image) || ""
  const id = person && person.discordId
  const name = person && person.name
  const sync = Boolean(person && person.syncDiscord)
  const wantsLive = Boolean(id) && (sync || isPlaceholder(stored))

  const initial = () => {
    if (wantsLive && sync) {
      const cached = readCache(String(id))
      if (cached) return cached
    }
    return null
  }

  const [profile, setProfile] = useState(initial)
  const [src, setSrc] = useState(
    (profile && profile.url) || stored || fallbackSrc || fallbackAvatar(name),
  )

  useEffect(() => {
    const base = stored || fallbackSrc || fallbackAvatar(name)
    const cached = wantsLive && sync ? readCache(String(id)) : null
    setSrc((cached && cached.url) || base)
    setProfile(cached)
    if (!wantsLive) return
    let alive = true
    lookup(String(id)).then((live) => {
      if (!alive || !live) return
      setSrc(live.url)
      setProfile(live)
    })
    return () => {
      alive = false
    }
  }, [stored, id, name, sync, wantsLive, fallbackSrc])

  const onError = useCallback(
    (e) => {
      const monogram = fallbackAvatar(name)
      if (e.currentTarget.src !== monogram) e.currentTarget.src = monogram
    },
    [name],
  )

  // `liveName` is only returned for people marked syncDiscord
  return { src, onError, liveName: sync && profile ? profile.name : "" }
}
