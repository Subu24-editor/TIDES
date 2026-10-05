import { useRef } from "react"
import useScrollReveal from "../hooks/useScrollReveal.js"
import useStore from "../hooks/useStore.js"

const DEFAULT_UPDATES = [
  {
    badge: "Fix",
    badgeClass: "badge--fix",
    date: "2026-08-09",
    dateLabel: "Aug 09, 2026",
    title: "Tides Downloader updated to V1.2.4!",
    text: "Added block for Steam game updates. Added a setting to disable/enable TIDES updates or game updates.",
  },
  {
    badge: "Fix",
    badgeClass: "badge--fix",
    date: "2026-08-08",
    dateLabel: "Aug 08, 2026",
    title: "Tides Downloader updated to V1.2.0!",
    text: null,
  },
  {
    badge: "Featured",
    badgeClass: "badge--featured",
    date: "2026-07-28",
    dateLabel: "Jul 28, 2026",
    title: "Luna, the automation bot, added to server",
    text: null,
  },
]

export default function UpdatesSection() {
  const ref = useRef(null)
  useScrollReveal(ref)
  const [updates] = useStore("changelog", DEFAULT_UPDATES)

  return (
    <section
      className="section section--alt"
      id="updates"
      aria-labelledby="updates-title"
      ref={ref}
    >
      <div className="shell">
        <header className="section-head reveal">
          <p className="eyebrow">Changelog</p>
          <h2 className="section-title" id="updates-title">
            Updates &amp; Events
          </h2>
          <p className="section-sub">
            Patch notes, world events, and season announcements — newest first.
          </p>
        </header>

        <ol className="timeline">
          {updates.map((item, i) => (
            <li className="timeline__item reveal" key={i}>
              <span className="timeline__marker" aria-hidden="true"></span>
              <article className="card timeline__card">
                <div className="timeline__meta">
                  <span
                    className={`badge ${item.badgeClass || (item.badge === "Featured" ? "badge--featured" : "badge--fix")}`}
                  >
                    {item.badge}
                  </span>
                  <time className="timeline__date" dateTime={item.date}>
                    {item.dateLabel || item.date}
                  </time>
                </div>
                <h3 className="timeline__title">{item.title}</h3>
                {item.text && <p className="timeline__text">{item.text}</p>}
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
