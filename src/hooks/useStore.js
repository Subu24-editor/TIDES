import { useState, useEffect, useRef } from "react"

const STORAGE_PREFIX = "tdt_data_"
let dbCache = null

export function getStoredData(key, fallback) {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key)
    return item ? JSON.parse(item) : fallback
  } catch (err) {
    console.error(`Error reading ${key} from localStorage`, err)
    return fallback
  }
}

export async function syncWithFileDb() {
  try {
    const res = await fetch("/api/db")
    if (res.ok) {
      const data = await res.json()
      dbCache = data
      Object.keys(data).forEach((key) => {
        try {
          if (data[key] !== undefined && data[key] !== null) {
            localStorage.setItem(
              STORAGE_PREFIX + key,
              JSON.stringify(data[key]),
            )
            window.dispatchEvent(
              new CustomEvent("tdt_store_change", {
                detail: { key, value: data[key] },
              }),
            )
          }
        } catch (e) {
          console.error(e)
        }
      })
      return data
    }
  } catch (err) {
    // API not reachable or running static — fallback to localStorage
  }
  return null
}

export async function saveToFileDb(key, value) {
  try {
    let currentDb = dbCache
    if (!currentDb) {
      const res = await fetch("/api/db")
      if (res.ok) currentDb = await res.json()
    }
    const updatedDb = { ...(currentDb || {}), [key]: value }
    dbCache = updatedDb

    await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedDb, null, 2),
    })
  } catch (err) {
    console.warn(`File DB save fallback: ${err.message}`)
  }
}

export function setStoredData(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
    window.dispatchEvent(
      new CustomEvent("tdt_store_change", { detail: { key, value } }),
    )
    saveToFileDb(key, value)
  } catch (err) {
    console.error(`Error saving ${key} to storage`, err)
  }
}

export function resetStoredData(key) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key)
    window.dispatchEvent(
      new CustomEvent("tdt_store_change", { detail: { key, value: null } }),
    )
  } catch (err) {
    console.error(`Error resetting ${key}`, err)
  }
}

export default function useStore(key, defaultValue) {
  const defaultRef = useRef(defaultValue)
  const [data, setData] = useState(() => getStoredData(key, defaultRef.current))

  useEffect(() => {
    // Sync with local file DB on startup
    syncWithFileDb()

    const handleStoreChange = (e) => {
      if (e.detail && e.detail.key === key) {
        setData(e.detail.value !== null ? e.detail.value : defaultRef.current)
      }
    }

    const handleStorageEvent = (e) => {
      if (e.key === STORAGE_PREFIX + key) {
        try {
          setData(e.newValue ? JSON.parse(e.newValue) : defaultRef.current)
        } catch {
          setData(defaultRef.current)
        }
      }
    }

    window.addEventListener("tdt_store_change", handleStoreChange)
    window.addEventListener("storage", handleStorageEvent)

    return () => {
      window.removeEventListener("tdt_store_change", handleStoreChange)
      window.removeEventListener("storage", handleStorageEvent)
    }
  }, [key])

  const update = (newValue) => {
    setStoredData(key, newValue)
    setData(newValue)
  }

  const reset = () => {
    resetStoredData(key)
    setData(defaultRef.current)
    saveToFileDb(key, defaultRef.current)
  }

  return [data, update, reset]
}
