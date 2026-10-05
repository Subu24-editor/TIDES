import { useRef } from "react"
import useScrollReveal from "../hooks/useScrollReveal.js"
import useStore from "../hooks/useStore.js"

const DEFAULT_DEVS = [
  {
    name: "Dreamleak",
    role: "Developer",
    text: "Founder of Luna bot and the Tides Downloader — building the tools that keep the community running.",
    image: "/img/people/dreamleak.svg",
    lineage: ["Dreamleak", "Developer", "Luna", "Dark Tides Community"],
  },
  {
    name: "Subu Edits",
    role: "Developer",
    text: "Fullstack developer helping design, build and ship this website.",
    image: "/img/people/subu.svg",
    lineage: ["Subu Edits", "Developer", "Dark Tides Community"],
  },
]

export default function DeveloperSection() {
  const ref = useRef(null)
  useScrollReveal(ref)
  const [storedData] = useStore("developer", DEFAULT_DEVS)

  const devs = Array.isArray(storedData)
    ? storedData
    : storedData && typeof storedData === "object"
      ? [storedData]
      : DEFAULT_DEVS

  return (
    <section
      className="section section--alt"
      id="developer"
      aria-labelledby="dev-title"
      ref={ref}
    >
      <div className="shell">
        <header className="section-head reveal">
          <p className="eyebrow">Behind the Tools</p>
          <h2 className="section-title" id="dev-title">
            Meet the Developers
          </h2>
          <p className="section-sub">
            The creators and engineers building tools for The Dark Tides.
          </p>
        </header>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}
        >
          {devs.map((devItem, i) => {
            const lineageNodes = Array.isArray(devItem.lineage)
              ? devItem.lineage
              : typeof devItem.lineage === "string"
                ? devItem.lineage.split(",").map((s) => s.trim())
                : DEFAULT_DEVS[0]?.lineage || []

            return (
              <div key={devItem.name || i}>
                <article
                  className="card card--glass spotlight reveal"
                  data-tilt
                >
                  <div className="spotlight__light" aria-hidden="true"></div>
                  <div className="spotlight__avatar">
                    <img
                      className="avatar__img"
                      src={devItem.image || "/img/people/dreamleak.svg"}
                      alt=""
                      width="240"
                      height="240"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="spotlight__body">
                    <h3 className="spotlight__name">{devItem.name}</h3>
                    <p className="spotlight__role">
                      {devItem.role || "Developer"}
                    </p>
                    <p className="spotlight__text">{devItem.text}</p>
                  </div>
                </article>

                {lineageNodes.length > 0 && (
                  <p
                    className="lineage reveal"
                    aria-label={`${devItem.name}, ${devItem.role}, builds tools for the Dark Tides community`}
                    style={{ marginTop: "1rem" }}
                  >
                    {lineageNodes.map((node, idx) => (
                      <span
                        key={idx}
                        style={{ display: "inline-flex", alignItems: "center" }}
                      >
                        <span className="lineage__node">{node}</span>
                        {idx < lineageNodes.length - 1 && (
                          <span
                            className="lineage__link"
                            aria-hidden="true"
                            style={{ marginInline: "0.4rem" }}
                          >
                            →
                          </span>
                        )}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
