import { useRef } from "react"
import useScrollReveal from "../hooks/useScrollReveal.js"
import useStore from "../hooks/useStore.js"

const DEFAULT_GAMES = [
  {
    art: "/img/games/art-01.svg",
    badge: "Coming soon",
    genre: "Action / RPG",
    title: "Tidal Ascendancy",
    text: "An oceanic tactical warfare game set in ancient depths.",
  },
  {
    art: "/img/games/art-02.svg",
    badge: "Popular",
    genre: "Survival",
    title: "Abyssal Horizon",
    text: "Navigate uncharted oceanic trench zones with your team.",
  },
  {
    art: "/img/games/art-03.svg",
    badge: "Coming soon",
    genre: "MMO",
    title: "Dark Tides Reborn",
    text: "Community-driven persistent world with player economies.",
  },
]

export default function GamesSection() {
  const ref = useRef(null)
  useScrollReveal(ref)
  const [games] = useStore("fleet", DEFAULT_GAMES)

  return (
    <section
      className="section"
      id="games"
      aria-labelledby="games-title"
      ref={ref}
    >
      <div className="shell">
        <header className="section-head reveal">
          <p className="eyebrow">The Fleet</p>
          <h2 className="section-title" id="games-title">
            Explore the Depths
          </h2>
          <p className="section-sub">
            Discover what's currently rising from the Dark Tides.
          </p>
        </header>

        <div className="grid grid--games">
          {games.map((game, i) => (
            <article className="card game reveal" key={i} data-tilt>
              <div className="game__media">
                <img
                  src={game.art || "/img/games/art-01.svg"}
                  alt=""
                  width="800"
                  height="480"
                  loading="lazy"
                  decoding="async"
                />
                <span className="game__badge">{game.badge}</span>
              </div>
              <div className="card__body">
                <p className="game__genre">{game.genre}</p>
                <h3 className="game__title">{game.title}</h3>
                <p className="game__text">{game.text}</p>
                {game.url ? (
                  <a
                    className="btn btn--ghost btn--sm"
                    href={game.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Game <span aria-hidden="true">→</span>
                  </a>
                ) : (
                  <button
                    className="btn btn--ghost btn--sm"
                    type="button"
                    aria-disabled="true"
                    disabled
                  >
                    View Game <span aria-hidden="true">→</span>
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
