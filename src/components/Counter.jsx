import { useEffect, useState, useRef } from "react"

const GUILD_ID = import.meta.env.VITE_DISCORD_GUILD_ID || "1498057802499883181"
const DURATION = 2000

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

function formatNumber(value) {
  return value ? value.toLocaleString("en-US") : "0"
}

export default function Counter() {
  const [onlineCount, setOnlineCount] = useState(null)
  const [serverName, setServerName] = useState("The Dark Tides")
  const [isLive, setIsLive] = useState(false)
  const numberRef = useRef(null)
  const suffixRef = useRef(null)
  const frameRef = useRef(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    async function fetchDiscordStats() {
      try {
        const res = await fetch(
          `https://discord.com/api/v10/guilds/${GUILD_ID}/widget.json`,
        )
        if (res.ok && isMountedRef.current) {
          const data = await res.json()
          if (!isMountedRef.current) return
          if (data.name) setServerName(data.name)
          if (typeof data.presence_count === "number") {
            setOnlineCount(data.presence_count)
            setIsLive(true)
            animateCount(data.presence_count)
          }
        }
      } catch (err) {
        console.warn(
          "Could not fetch Discord live widget (Enable Widget in Discord Server Settings -> Widget)",
          err,
        )
      }
    }

    fetchDiscordStats()
    const interval = setInterval(fetchDiscordStats, 30000)

    return () => {
      isMountedRef.current = false
      clearInterval(interval)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  const animateCount = (target) => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    if (prefersReduced) {
      if (numberRef.current)
        numberRef.current.textContent = formatNumber(target)
      return
    }

    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    let start = null

    function step(now) {
      if (!isMountedRef.current) return
      if (start === null) start = now
      const progress = Math.min((now - start) / DURATION, 1)
      const value = Math.round(easeOutExpo(progress) * target)

      if (numberRef.current) numberRef.current.textContent = formatNumber(value)
      if (suffixRef.current)
        suffixRef.current.textContent = progress === 1 ? "+" : ""

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step)
      } else {
        frameRef.current = null
      }
    }

    frameRef.current = requestAnimationFrame(step)
  }

  return (
    <section className="counter" id="pulse" aria-labelledby="counter-title">
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
            {isLive
              ? `${serverName} — Live Online Members`
              : "Your community is now growing"}
          </p>

          <p
            className="counter__value"
            aria-label={`${formatNumber(onlineCount || 10600)}+`}
          >
            <span
              className="counter__number"
              ref={numberRef}
              aria-hidden="true"
            >
              {formatNumber(onlineCount || 10600)}
            </span>
            <span
              className="counter__suffix"
              ref={suffixRef}
              aria-hidden="true"
            >
              +
            </span>
          </p>

          <div className="counter__rule" aria-hidden="true"></div>
          <p className="counter__note">
            {isLive
              ? `${formatNumber(onlineCount)} active members online right now in Discord`
              : "10,600+ — and growing more every day"}
          </p>
        </div>
      </div>
    </section>
  )
}
