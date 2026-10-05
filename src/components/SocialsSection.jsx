import { useRef } from "react"
import useScrollReveal from "../hooks/useScrollReveal.js"

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" focusable="false">
    <path
      fill="currentColor"
      d="M19.3 5.4A16.6 16.6 0 0 0 15.2 4l-.3.6a12.6 12.6 0 0 1 3.6 1.5 14.9 14.9 0 0 0-12.9 0A12.6 12.6 0 0 1 9.2 4.6L8.8 4a16.6 16.6 0 0 0-4.1 1.4C2.1 9.3 1.4 13 1.7 16.7a16.7 16.7 0 0 0 5.1 2.6l1-1.7a10.8 10.8 0 0 1-1.7-.8l.4-.3a11.9 11.9 0 0 0 11 0l.4.3a10.8 10.8 0 0 1-1.7.8l1 1.7a16.7 16.7 0 0 0 5.1-2.6c.4-4.3-.7-8-2.9-11.3zM8.7 14.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z"
    />
  </svg>
)

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" focusable="false">
    <path
      fill="currentColor"
      d="M22.2 7.4a2.7 2.7 0 0 0-1.9-1.9C18.6 5 12 5 12 5s-6.6 0-8.3.5A2.7 2.7 0 0 0 1.8 7.4 28 28 0 0 0 1.3 12a28 28 0 0 0 .5 4.6 2.7 2.7 0 0 0 1.9 1.9C5.4 19 12 19 12 19s6.6 0 8.3-.5a2.7 2.7 0 0 0 1.9-1.9 28 28 0 0 0 .5-4.6 28 28 0 0 0-.5-4.6zM9.9 14.9V9.1l5.4 2.9-5.4 2.9z"
    />
  </svg>
)

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" focusable="false">
    <path
      fill="currentColor"
      d="M22 11.7a2.3 2.3 0 0 0-3.9-1.6 11.3 11.3 0 0 0-5.6-1.8l1-4.4 3.1.7a1.7 1.7 0 1 0 .2-1.4l-3.8-.8a.7.7 0 0 0-.8.5l-1.2 5.4a11.3 11.3 0 0 0-5.7 1.8A2.3 2.3 0 1 0 3 15.2a4.3 4.3 0 0 0 0 .6c0 3.2 3.9 5.8 8.7 5.8s8.7-2.6 8.7-5.8a4.3 4.3 0 0 0 0-.6 2.3 2.3 0 0 0 1.6-2.2zM7.6 13.4a1.6 1.6 0 1 1 1.6 1.6 1.6 1.6 0 0 1-1.6-1.6zm8.9 4.2a5.9 5.9 0 0 1-4.1 1.3 5.9 5.9 0 0 1-4.1-1.3.6.6 0 0 1 .8-.8 4.8 4.8 0 0 0 3.3 1 4.8 4.8 0 0 0 3.3-1 .6.6 0 1 1 .8.8zm-1.7-2.6a1.6 1.6 0 1 1 1.6-1.6 1.6 1.6 0 0 1-1.6 1.6z"
    />
  </svg>
)

const SOCIALS = [
  {
    href: "https://discord.gg/thedarktides",
    icon: <DiscordIcon />,
    name: "Discord",
    handle: "discord.gg/thedarktides",
  },
  {
    href: "https://www.youtube.com/@TheDarkTides-p1e",
    icon: <YouTubeIcon />,
    name: "YouTube",
    handle: "@TheDarkTides-p1e",
  },
  {
    href: "https://www.reddit.com/r/TheDarkTidess",
    icon: <RedditIcon />,
    name: "Reddit",
    handle: "r/TheDarkTidess",
  },
]

export default function SocialsSection() {
  const ref = useRef(null)
  useScrollReveal(ref)

  return (
    <section
      className="section"
      id="socials"
      aria-labelledby="socials-title"
      ref={ref}
    >
      <div className="shell">
        <header className="section-head reveal">
          <p className="eyebrow">Find Us</p>
          <h2 className="section-title" id="socials-title">
            Socials
          </h2>
          <p className="section-sub">
            Follow along and join the conversation wherever you spend your time.
          </p>
        </header>

        <div className="grid grid--socials">
          {SOCIALS.map((s) => (
            <a
              key={s.name}
              className="card social reveal"
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              data-tilt
            >
              <span className="social__icon" aria-hidden="true">
                {s.icon}
              </span>
              <span className="social__body">
                <span className="social__name">{s.name}</span>
                <span className="social__handle">{s.handle}</span>
              </span>
              <span className="social__arrow" aria-hidden="true">
                →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
