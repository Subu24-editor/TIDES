import useStore from "../hooks/useStore.js"
import useSmoothScroll from "../hooks/useSmoothScroll.js"

export default function Hero() {
  const [discord] = useStore("discord", {
    url: "https://discord.gg/thedarktides",
  })
  const smoothScroll = useSmoothScroll()

  return (
    <section className="hero" id="home" aria-labelledby="hero-title">
      <div className="hero__glow" aria-hidden="true"></div>
      <div className="hero__ring hero__ring--a" aria-hidden="true"></div>
      <div className="hero__ring hero__ring--b" aria-hidden="true"></div>

      <div className="shell hero__inner">
        <div className="hero__logo">
          <img
            src="/img/logo-mark.svg"
            alt="The Dark Tides — an ancient moon rising over dark waves"
            width="512"
            height="512"
            fetchPriority="high"
          />
        </div>

        <p className="hero__wordmark">The Dark Tides</p>
        <h1 className="hero__title" id="hero-title">
          Enter the Depths
        </h1>

        <p className="hero__subtitle">
          Gaming <span aria-hidden="true">•</span> Community{" "}
          <span aria-hidden="true">•</span> Projects{" "}
          <span aria-hidden="true">•</span> Experiences
        </p>

        <div className="hero__actions">
          <a
            className="btn btn--primary"
            href="#games"
            onClick={(event) => {
              event.preventDefault()
              smoothScroll(document.getElementById("games"))
            }}
          >
            Enter the Tides
          </a>
          <a
            className="btn btn--secondary"
            href={discord.url || "https://discord.gg/thedarktides"}
            target="_blank"
            rel="noopener noreferrer"
          >
            Join Discord
          </a>
        </div>

        <div className="hero__signals" aria-hidden="true">
          <span className="hero__signal">
            <span className="hero__signal-dot"></span>
            Live community
          </span>
          <span className="hero__signal">
            <span className="hero__signal-dot"></span>
            Fresh updates
          </span>
          <span className="hero__signal">
            <span className="hero__signal-dot"></span>
            Community tools
          </span>
        </div>
      </div>

      <div className="wave" aria-hidden="true">
        <svg
          className="wave__svg"
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
          focusable="false"
        >
          <path
            className="wave__path wave__path--back"
            d="M0,110 C 180,70 320,150 520,120 C 720,90 860,150 1060,124 C 1220,104 1340,132 1440,116 L1440,200 L0,200 Z"
          />
          <path
            className="wave__path wave__path--mid"
            d="M0,134 C 200,100 340,170 540,142 C 740,114 880,168 1080,146 C 1240,128 1350,152 1440,140 L1440,200 L0,200 Z"
          />
          <path
            className="wave__path wave__path--front"
            d="M0,162 C 220,132 360,190 560,166 C 760,142 900,186 1100,168 C 1260,154 1360,174 1440,164 L1440,200 L0,200 Z"
          />
        </svg>
      </div>
    </section>
  )
}
