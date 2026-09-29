import { useRef } from "react"
import useScrollReveal from "../hooks/useScrollReveal.js"

const REASONS = [
  {
    num: "01",
    title: "Simple & accessible",
    text: "No complicated steps or gatekeeping — everything is built to be quick and easy to use.",
  },
  {
    num: "02",
    title: "Active, friendly community",
    text: "A welcoming space for gamers and developers to connect, share, and build together.",
  },
  {
    num: "03",
    title: "Better than other community servers",
    text: "Built to feel less crowded and more personal — a place where members actually get noticed.",
  },
  {
    num: "04",
    title: "24/7 support",
    text: "Staff and helpers are active around the clock, so questions don't sit unanswered.",
  },
]

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" focusable="false">
    <path
      fill="currentColor"
      d="M19.3 5.4A16.6 16.6 0 0 0 15.2 4l-.3.6a12.6 12.6 0 0 1 3.6 1.5 14.9 14.9 0 0 0-12.9 0A12.6 12.6 0 0 1 9.2 4.6L8.8 4a16.6 16.6 0 0 0-4.1 1.4C2.1 9.3 1.4 13 1.7 16.7a16.7 16.7 0 0 0 5.1 2.6l1-1.7a10.8 10.8 0 0 1-1.7-.8l.4-.3a11.9 11.9 0 0 0 11 0l.4.3a10.8 10.8 0 0 1-1.7.8l1 1.7a16.7 16.7 0 0 0 5.1-2.6c.4-4.3-.7-8-2.9-11.3zM8.7 14.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z"
    />
  </svg>
)

export default function WhySection() {
  const ref = useRef(null)
  useScrollReveal(ref)

  return (
    <section className="section" id="why" aria-labelledby="why-title" ref={ref}>
      <div className="shell">
        <header className="section-head reveal">
          <p className="eyebrow">Get Involved</p>
          <h2 className="section-title" id="why-title">
            Why Choose The Dark Tides?
          </h2>
        </header>

        <div className="why">
          <article className="card card--glass why__feature reveal" data-tilt>
            <h3 className="why__feature-title">
              Where everyone actually talks
            </h3>
            <p className="why__feature-text">
              Discord is where announcements land first, projects get shared,
              and the team is easiest to reach.
            </p>
            <a
              className="why__cta"
              href="https://discord.gg/thedarktides"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="why__cta-icon" aria-hidden="true">
                <DiscordIcon />
              </span>
              <span className="why__cta-copy">
                <span className="why__cta-title">Discord Server</span>
                <span className="why__cta-sub">join the community</span>
              </span>
              <span className="why__cta-arrow" aria-hidden="true">
                →
              </span>
            </a>
          </article>

          <div className="why__list reveal">
            <h3 className="why__list-title">
              Why choose The Dark Tides server?
            </h3>
            <ul className="reasons">
              {REASONS.map((r) => (
                <li className="reason" key={r.num}>
                  <span className="reason__num" aria-hidden="true">
                    {r.num}
                  </span>
                  <div className="reason__body">
                    <h4 className="reason__title">{r.title}</h4>
                    <p className="reason__text">{r.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
