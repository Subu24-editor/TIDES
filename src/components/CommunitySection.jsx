import { useRef } from "react"
import useScrollReveal from "../hooks/useScrollReveal.js"
import useStore from "../hooks/useStore.js"

export default function CommunitySection() {
  const ref = useRef(null)
  useScrollReveal(ref)
  const [discord] = useStore("discord", {
    url: "https://discord.gg/thedarktides",
  })

  return (
    <section
      className="section section--alt"
      id="community"
      aria-labelledby="community-title"
      ref={ref}
    >
      <div className="shell">
        <div className="card card--glass community reveal">
          <div className="community__light" aria-hidden="true"></div>
          <div className="community__inner">
            <p className="eyebrow">Beneath the Tide</p>
            <h2 className="section-title" id="community-title">
              The Community
            </h2>
            <p className="community__text">
              Meet, play, connect, and explore the Dark Tides together.
            </p>
            <a
              className="btn btn--primary btn--lg"
              href={discord.url || "https://discord.gg/thedarktides"}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Discord
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
