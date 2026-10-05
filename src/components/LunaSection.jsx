import { useRef } from "react"
import useScrollReveal from "../hooks/useScrollReveal.js"
import useStore from "../hooks/useStore.js"
import SpotlightAvatar from "./SpotlightAvatar.jsx"

const DEFAULT_BOTS = [
  {
    name: "Luna",
    meta: "Created by Dreamleak · Est. 2026",
    text: "I'm Luna, the automation bot of The Dark Tides. I help manage the community, assist members, handle users, and keep things running smoothly behind the scenes.",
    signoff: "Let's meet in the server! 💜",
    image: "/img/people/luna.svg",
  },
]

export default function LunaSection() {
  const ref = useRef(null)
  useScrollReveal(ref)
  const [storedData] = useStore("luna", DEFAULT_BOTS)

  // Normalize single object or array
  const bots = Array.isArray(storedData)
    ? storedData
    : storedData && typeof storedData === "object"
      ? [storedData]
      : DEFAULT_BOTS

  return (
    <section
      className="section"
      id="luna"
      aria-labelledby="luna-title"
      ref={ref}
    >
      <div className="shell">
        <header className="section-head reveal">
          <p className="eyebrow">The Bots</p>
          <h2 className="section-title" id="luna-title">
            Meet Our Bots
          </h2>
          <p className="section-sub">
            Automated assistants and tools keeping the Dark Tides running
            smoothly.
          </p>
        </header>

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {bots.map((bot, i) => (
            <article
              className="card card--glass spotlight spotlight--luna reveal"
              key={bot.name || i}
              data-tilt
            >
              <div className="spotlight__light" aria-hidden="true"></div>
              <SpotlightAvatar person={bot} fallbackSrc="/img/people/luna.svg" />
              <div className="spotlight__body">
                <h3 className="spotlight__name">{bot.name}</h3>
                {bot.meta && <p className="spotlight__meta">{bot.meta}</p>}
                <p className="spotlight__text">{bot.text}</p>
                {bot.signoff && (
                  <p className="spotlight__signoff">{bot.signoff}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
