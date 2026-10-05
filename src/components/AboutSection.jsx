import { useRef } from "react"
import useScrollReveal from "../hooks/useScrollReveal.js"
import useStore from "../hooks/useStore.js"

const PILLARS_DEFAULT = [
  {
    title: "Gaming",
    text: "Discover what the community is playing and what is currently rising from the depths.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="26"
        height="26"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        <path d="M7 12h4M9 10v4" />
        <circle cx="15.5" cy="11" r="1" />
        <circle cx="17.5" cy="13.5" r="1" />
        <path d="M6.5 7h11a3.5 3.5 0 0 1 3.4 2.7l1 4.6A2.9 2.9 0 0 1 19 18c-1 0-1.7-.5-2.3-1.2L15.4 15H8.6l-1.3 1.8C6.7 17.5 6 18 5 18a2.9 2.9 0 0 1-2.9-3.7l1-4.6A3.5 3.5 0 0 1 6.5 7z" />
      </svg>
    ),
  },
  {
    title: "Community",
    text: "A place for gamers, developers, and enthusiasts to meet, talk, and stay connected.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="26"
        height="26"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        <circle cx="9" cy="8" r="3.2" />
        <path d="M2.8 19a6.4 6.4 0 0 1 12.4 0" />
        <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6" />
        <path d="M18 13.4a6.4 6.4 0 0 1 3.2 5.6" />
      </svg>
    ),
  },
  {
    title: "Projects",
    text: "Share what you are building and follow the tools and projects made for the community.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="26"
        height="26"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        <path d="M9 8.5 5.5 12 9 15.5" />
        <path d="M15 8.5 18.5 12 15 15.5" />
        <path d="M13 6l-2 12" />
      </svg>
    ),
  },
  {
    title: "Updates",
    text: "Patch notes, world events, and announcements land here first — and in Discord.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="26"
        height="26"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        <circle cx="12" cy="12" r="8.2" />
        <path d="M12 7.4V12l3 1.8" />
      </svg>
    ),
  },
]

export default function AboutSection() {
  const ref = useRef(null)
  useScrollReveal(ref)
  const [pillars] = useStore("about", PILLARS_DEFAULT)

  return (
    <section
      className="section"
      id="about"
      aria-labelledby="about-title"
      ref={ref}
    >
      <div className="shell">
        <header className="section-head reveal">
          <p className="eyebrow">The Origin</p>
          <h2 className="section-title" id="about-title">
            About The Dark Tides
          </h2>
          <p className="section-sub">
            Dark Tides is a gaming and community hub focused on games, projects,
            tools, updates, and community experiences.
          </p>
        </header>

        <div className="grid grid--about">
          {pillars.map((p, i) => (
            <article
              className="card pillar reveal"
              key={p.title || i}
              data-tilt
            >
              <span className="pillar__icon" aria-hidden="true">
                {p.icon || PILLARS_DEFAULT[i % 4].icon}
              </span>
              <h3 className="pillar__title">{p.title}</h3>
              <p className="pillar__text">{p.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
