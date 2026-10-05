import { useEffect, useRef, useState } from "react"
import useServerStats from "../hooks/useServerStats.js"

const FALLBACK_COUNT = 10600

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

function formatNumber(value) {
  return Number.isFinite(value) ? Math.round(value).toLocaleString("en-US") : "0"
}

/**
 * Animates toward `target`: the first run counts up from 0 once the section is
 * on screen; later updates glide from the number currently shown.
 */
function useCountUp(target, active) {
  const [value, setValue] = useState(0)
  const valueRef = useRef(0)
  const hasPlayedRef = useRef(false)

  useEffect(() => {
    if (!active || typeof target !== "number") return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const from = hasPlayedRef.current ? valueRef.current : 0
    const duration = hasPlayedRef.current ? 900 : 2000
    hasPlayedRef.current = true

    if (reduced || from === target) {
      valueRef.current = target
      setValue(target)
      return
    }

    let frame = 0
    let start = null
    const step = (now) => {
      if (start === null) start = now
      const t = Math.min((now - start) / duration, 1)
      const next = from + (target - from) * easeOutExpo(t)
      valueRef.current = next
      setValue(next)
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, active])

  return value
}

export default function Counter() {
  const stats = useServerStats()
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el || !("IntersectionObserver" in window)) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const hasMembers = stats.live && typeof stats.members === "number"
  const hasOnlineOnly = stats.live && !hasMembers && typeof stats.online === "number"
  const isLive = hasMembers || hasOnlineOnly
  const target = hasMembers ? stats.members : hasOnlineOnly ? stats.online : null

  const animated = useCountUp(target, visible)
  const shown = isLive ? animated : FALLBACK_COUNT
  const name = stats.name || "The Dark Tides"

  let eyebrow = "Your community is now growing"
  let note = "10,600+ — and growing more every day"
  if (hasMembers) {
    eyebrow = `${name} — Members`
    note =
      typeof stats.online === "number"
        ? `${formatNumber(stats.online)} online right now in Discord`
        : "And the tide keeps rising"
  } else if (hasOnlineOnly) {
    eyebrow = `${name} — Live Online Members`
    note = `${formatNumber(stats.online)} active members online right now in Discord`
  }

  return (
    <section
      className="counter"
      id="pulse"
      aria-labelledby="counter-title"
      ref={sectionRef}
    >
      <div className="shell">
        <div className="counter__inner reveal">
          <p
            className="eyebrow"
            id="counter-title"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {isLive && (
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#22c55e",
                  boxShadow: "0 0 10px #22c55e",
                  display: "inline-block",
                }}
              />
            )}
            {eyebrow}
          </p>

          <p
            className="counter__value"
            aria-label={isLive ? formatNumber(target) : `${formatNumber(FALLBACK_COUNT)}+`}
          >
            <span className="counter__number" aria-hidden="true">
              {formatNumber(shown)}
            </span>
            <span className="counter__suffix" aria-hidden="true">
              {isLive ? "" : "+"}
            </span>
          </p>

          <div className="counter__rule" aria-hidden="true"></div>
          <p className="counter__note">{note}</p>
        </div>
      </div>
    </section>
  )
}
