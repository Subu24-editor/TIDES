import { useEffect, useRef, useState } from "react"
import Atmosphere from "./components/Atmosphere.jsx"
import CustomCursor from "./components/CustomCursor.jsx"
import Footer from "./components/Footer.jsx"
import useScrollReveal from "./hooks/useScrollReveal.js"
import useScrollEffects from "./hooks/useScrollEffects.js"

const MAIN_SITE = "https://darktides.online"

function Header({ name }) {
  return (
    <header className="site-header">
      <nav className="nav" aria-label="Primary">
        <a className="nav__brand" href="/">
          <img className="nav__brand-mark" src="/img/logo-mark.svg" alt="" width="40" height="40" />
          <span className="nav__brand-text">The Dark Tides</span>
        </a>
        <div className="nav__menu mc-nav">
          <a className="nav__link" href={MAIN_SITE}>
            Main site
          </a>
          {name ? (
            <>
              <span className="mc-nav__user">{name}</span>
              <a className="btn btn--ghost btn--sm" href="/api/mc-logout">
                Sign out
              </a>
            </>
          ) : (
            <a className="btn btn--primary btn--sm" href="/api/mc-login">
              Admin sign in
            </a>
          )}
        </div>
      </nav>
    </header>
  )
}

function Gate({ denied }) {
  return (
    <main id="main">
      <section className="hero mc-gate" aria-labelledby="mc-gate-title">
        <div className="hero__glow" aria-hidden="true"></div>
        <div className="hero__ring hero__ring--a" aria-hidden="true"></div>
        <div className="hero__ring hero__ring--b" aria-hidden="true"></div>

        <div className="shell hero__inner">
          <div className="mc-sign">
            <img
              src="/img/work-in-progress.png"
              alt="A wooden Minecraft sign reading Work in Progress"
              width="237"
              height="246"
              fetchPriority="high"
            />
          </div>

          <p className="hero__wordmark">The Dark Tides · Minecraft</p>
          <h1 className="hero__title mc-gate__title" id="mc-gate-title">
            Something is rising
          </h1>
          <p className="hero__subtitle">This corner of the depths is still being built.</p>

          {denied && (
            <p className="mc-denied" role="alert">
              That Discord account doesn't have access to this area.
            </p>
          )}

          <div className="hero__actions">
            <a className="btn btn--primary" href={MAIN_SITE}>
              Back to The Dark Tides
            </a>
            <a className="btn btn--secondary" href="/api/mc-login">
              Admin sign in
            </a>
          </div>
        </div>

        <div className="wave" aria-hidden="true">
          <svg className="wave__svg" viewBox="0 0 1440 200" preserveAspectRatio="none" focusable="false">
            <path className="wave__path wave__path--back" d="M0,110 C 180,70 320,150 520,120 C 720,90 860,150 1060,124 C 1220,104 1340,132 1440,116 L1440,200 L0,200 Z" />
            <path className="wave__path wave__path--mid" d="M0,134 C 200,100 340,170 540,142 C 740,114 880,168 1080,146 C 1240,128 1350,152 1440,140 L1440,200 L0,200 Z" />
            <path className="wave__path wave__path--front" d="M0,162 C 220,132 360,190 560,166 C 760,142 900,186 1100,168 C 1260,154 1360,174 1440,164 L1440,200 L0,200 Z" />
          </svg>
        </div>
      </section>
    </main>
  )
}

function ServerCard({ server }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(server.address).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <div className="card card--glass mc-server reveal">
      <div className="card__body">
        <p className="game__genre">{server.label}</p>
        <p className="mc-server__addr">{server.address}</p>
        <button className="btn btn--primary btn--sm" type="button" onClick={copy}>
          {copied ? "Copied" : "Copy address"}
        </button>
      </div>
    </div>
  )
}

function Showcase() {
  const [content, setContent] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    fetch("/api/mc-content", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setContent)
      .catch(() => setFailed(true))
  }, [])

  if (failed) {
    return (
      <main id="main" className="mc-pad">
        <div className="shell">
          <p className="section-sub">Your session has expired. Please sign in again.</p>
          <a className="btn btn--primary" href="/api/mc-login">
            Admin sign in
          </a>
        </div>
      </main>
    )
  }
  if (!content) return <main id="main" className="mc-pad" />
  return <ShowcaseBody content={content} />
}

// Mounted only after the admin-only content has loaded, so the reveal hook sees the cards.
function ShowcaseBody({ content }) {
  const ref = useRef(null)
  const [query, setQuery] = useState("")
  useScrollReveal(ref)

  const q = query.trim().toLowerCase()
  const groups = content.groups
    .map((g) => ({ ...g, games: g.games.filter((n) => n.toLowerCase().includes(q)) }))
    .filter((g) => g.games.length)
  const total = content.groups.reduce((n, g) => n + g.games.length, 0)

  return (
    <main id="main" ref={ref}>
      <section className="section mc-pad" id="games" aria-labelledby="mc-title">
        <div className="shell">
          <header className="section-head section-head--center reveal">
            <p className="eyebrow">{content.eyebrow}</p>
            <h1 className="section-title" id="mc-title">
              {content.title}
            </h1>
            <p className="section-sub">{content.intro}</p>
          </header>

          {content.server && <ServerCard server={content.server} />}

          <div className="mc-search reveal">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${total} games…`}
              aria-label="Search games"
            />
          </div>

          {groups.length === 0 && <p className="section-sub mc-empty">No games match your search.</p>}

          {groups.map((g) => (
            <section className="card card--glass mc-group reveal" key={g.name} aria-label={g.name}>
              <div className="card__body">
                <h2 className="mc-group__title">
                  {g.name} <span className="mc-group__count">{g.games.length}</span>
                </h2>
                <ul className="mc-games">
                  {g.games.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  )
}

export default function McApp() {
  const [session, setSession] = useState(null) // null = checking
  const denied = new URLSearchParams(window.location.search).has("denied")
  useScrollEffects()

  useEffect(() => {
    fetch("/api/mc-session", { credentials: "same-origin" })
      .then((r) => r.json())
      .then(setSession)
      .catch(() => setSession({ authorized: false }))
  }, [])

  return (
    <>
      <div className="scroll-progress" aria-hidden="true">
        <span className="scroll-progress__bar"></span>
      </div>
      <CustomCursor />
      <Atmosphere />
      <Header name={session?.authorized ? session.name : null} />
      {session === null ? (
        <main id="main" className="mc-pad" />
      ) : session.authorized ? (
        <Showcase />
      ) : (
        <Gate denied={denied} />
      )}
      <Footer />
    </>
  )
}
