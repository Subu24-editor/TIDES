import useStore from "../hooks/useStore.js"

export default function Footer() {
  const [discord] = useStore("discord", {
    url: "https://discord.gg/thedarktides",
  })

  return (
    <footer className="footer">
      <div className="wave wave--footer" aria-hidden="true">
        <svg
          className="wave__svg"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          focusable="false"
        >
          <path
            className="wave__path wave__path--back"
            d="M0,80 C 200,44 340,116 540,88 C 740,60 880,116 1080,92 C 1240,72 1350,100 1440,86 L1440,160 L0,160 Z"
          />
          <path
            className="wave__path wave__path--front"
            d="M0,110 C 220,84 360,140 560,116 C 760,92 900,134 1100,118 C 1260,104 1360,124 1440,114 L1440,160 L0,160 Z"
          />
        </svg>
      </div>

      <div className="shell footer__inner">
        <div className="footer__brand">
          <img
            className="footer__mark"
            src="/img/logo-mark.svg"
            alt=""
            width="52"
            height="52"
            loading="lazy"
          />
          <p className="footer__name">The Dark Tides</p>
          <p className="footer__est">
            <span className="rule" aria-hidden="true"></span>
            Est. 2026
            <span className="rule" aria-hidden="true"></span>
          </p>
          <p className="footer__tagline">
            Gaming <span aria-hidden="true">•</span> Community{" "}
            <span aria-hidden="true">•</span> Projects{" "}
            <span aria-hidden="true">•</span> Experiences
          </p>
        </div>

        <nav className="footer__socials" aria-label="Social links">
          <a
            className="footer__social"
            href={discord.url || "https://discord.gg/thedarktides"}
            target="_blank"
            rel="noopener noreferrer"
          >
            Discord
          </a>
          <span className="footer__sep" aria-hidden="true">
            ·
          </span>
          <a
            className="footer__social"
            href="https://www.youtube.com/@TheDarkTides-p1e"
            target="_blank"
            rel="noopener noreferrer"
          >
            YouTube
          </a>
          <span className="footer__sep" aria-hidden="true">
            ·
          </span>
          <a
            className="footer__social"
            href="https://www.reddit.com/r/TheDarkTidess"
            target="_blank"
            rel="noopener noreferrer"
          >
            Reddit
          </a>
        </nav>

        <p className="footer__legal">
          &copy; 2026 The Dark Tides. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
