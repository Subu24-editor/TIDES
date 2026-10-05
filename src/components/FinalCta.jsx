import { useRef } from "react"
import useScrollReveal from "../hooks/useScrollReveal.js"
import useStore from "../hooks/useStore.js"
import useSmoothScroll from "../hooks/useSmoothScroll.js"

export default function FinalCta() {
  const ref = useRef(null)
  useScrollReveal(ref)
  const smoothScroll = useSmoothScroll()
  const [discord] = useStore("discord", {
    url: "https://discord.gg/thedarktides",
  })

  return (
    <section
      className="final"
      id="join"
      aria-labelledby="final-title"
      ref={ref}
    >
      <div className="final__glow" aria-hidden="true"></div>
      <div className="final__mist" aria-hidden="true"></div>

      <div className="shell">
        <div className="final__inner reveal">
          <h2 className="final__title" id="final-title">
            Enter The Dark Tides
          </h2>
          <p className="final__sub">
            Gaming <span aria-hidden="true">•</span> Community{" "}
            <span aria-hidden="true">•</span> Projects{" "}
            <span aria-hidden="true">•</span> Experiences
          </p>
          <div className="final__actions">
            <a
              className="btn btn--primary btn--lg"
              href={discord.url || "https://discord.gg/thedarktides"}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Discord
            </a>
            <a
              className="btn btn--secondary btn--lg"
              href="#games"
              onClick={(event) => {
                event.preventDefault()
                smoothScroll(document.getElementById("games"))
              }}
            >
              Enter the Tides
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
