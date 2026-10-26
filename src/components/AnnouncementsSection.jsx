import { useRef } from "react"
import useScrollReveal from "../hooks/useScrollReveal.js"
import useDiscordFeed from "../hooks/useDiscordFeed.js"
import { fallbackAvatar } from "../utils/avatarFallback.js"

const INVITE_URL = "https://discord.gg/thedarktides"
const NEW_WINDOW_MS = 48 * 60 * 60 * 1000
const MAX_POSTS = 7
const URL_RE = /(https?:\/\/[^\s<>()]+[^\s<>().,!?:;'"])/g

function timeAgo(iso, fallbackLabel) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (!Number.isFinite(minutes)) return fallbackLabel
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days} days ago`
  return fallbackLabel
}

function shortUrl(url) {
  const bare = url.replace(/^https?:\/\/(www\.)?/, "")
  return bare.length > 42 ? bare.slice(0, 41) + "…" : bare
}

/** Plain text with safe, clickable http(s) links. */
function Linkified({ text }) {
  return text.split(URL_RE).map((part, i) =>
    i % 2 === 1 ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer nofollow">
        {shortUrl(part)}
      </a>
    ) : (
      part
    ),
  )
}

function Reaction({ r }) {
  return (
    <span className="announce__reaction" title={r.name}>
      {r.customId ? (
        <img
          src={`https://cdn.discordapp.com/emojis/${r.customId}.${r.animated ? "gif" : "png"}?size=32`}
          alt={r.name}
          width="16"
          height="16"
          loading="lazy"
        />
      ) : (
        <span aria-hidden="true">{r.emoji}</span>
      )}
      <span>{r.count}</span>
    </span>
  )
}

function Post({ post, index, featured, fresh }) {
  const isNew = Date.now() - new Date(post.timestamp).getTime() < NEW_WINDOW_MS
  const images = post.images || []
  const paragraphs = post.text ? post.text.split("\n") : []

  return (
    <article
      className={
        "card announce" +
        (featured ? " announce--featured" : "") +
        (fresh ? " announce--fresh" : "")
      }
      style={{ "--i": index }}
    >
      <header className="announce__meta">
        <img
          className="announce__avatar"
          src={(post.author && post.author.avatar) || fallbackAvatar(post.author && post.author.name)}
          onError={(e) => {
            e.currentTarget.src = fallbackAvatar(post.author && post.author.name)
          }}
          alt=""
          width="40"
          height="40"
          loading="lazy"
          decoding="async"
        />
        <div className="announce__who">
          <span className="announce__author">{(post.author && post.author.name) || "The Dark Tides"}</span>
          <time className="announce__time" dateTime={post.timestamp} title={post.dateLabel}>
            {timeAgo(post.timestamp, post.dateLabel)}
            {post.edited ? " · edited" : ""}
          </time>
        </div>
        <div className="announce__badges">
          {post.pinned && <span className="badge badge--featured">Pinned</span>}
          {isNew && <span className="badge badge--new">New</span>}
        </div>
      </header>

      {post.title && <h3 className="announce__title">{post.title}</h3>}

      {paragraphs.length > 0 && (
        <div className="announce__text">
          {paragraphs.map((line, i) => (
            <p key={i}>
              <Linkified text={line} />
            </p>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className={`announce__media announce__media--${Math.min(images.length, 4)}`}>
          {images.map((src, i) => (
            <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="announce__shot">
              <img src={src} alt="" loading="lazy" decoding="async" />
            </a>
          ))}
        </div>
      )}

      {(post.reactions.length > 0 || post.url) && (
        <footer className="announce__foot">
          <div className="announce__reactions">
            {post.reactions.map((r, i) => (
              <Reaction r={r} key={i} />
            ))}
          </div>
          {post.url && (
            <a className="announce__open" href={post.url} target="_blank" rel="noopener noreferrer">
              Open in Discord <span aria-hidden="true">↗</span>
            </a>
          )}
        </footer>
      )}
    </article>
  )
}

function Skeleton() {
  return (
    <div className="announce-grid" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          className={"card announce announce--skeleton" + (i === 0 ? " announce--featured" : "")}
          style={{ "--i": i }}
          key={i}
        >
          <div className="skeleton skeleton--row"></div>
          <div className="skeleton skeleton--title"></div>
          <div className="skeleton skeleton--line"></div>
          <div className="skeleton skeleton--line skeleton--short"></div>
        </div>
      ))}
    </div>
  )
}

export default function AnnouncementsSection({ refreshMs }) {
  const ref = useRef(null)
  useScrollReveal(ref)
  const { status, items, freshIds } = useDiscordFeed("announcements", refreshMs)
  const posts = items.slice(0, MAX_POSTS)

  return (
    <section
      className="section"
      id="announcements"
      aria-labelledby="announcements-title"
      ref={ref}
    >
      <div className="shell">
        <header className="section-head reveal">
          <p className="eyebrow">Announcements</p>
          <h2 className="section-title" id="announcements-title">
            Straight from the Tides
          </h2>
          <p className="section-sub">
            Fresh from our Discord — new announcements appear here on their own.
          </p>
          {status === "ready" && posts.length > 0 && (
            <p className="live-pill">
              <span className="live-pill__dot" aria-hidden="true"></span>
              Live from Discord
            </p>
          )}
        </header>

        {status === "loading" && <Skeleton />}

        {status !== "loading" && posts.length === 0 && (
          <div className="card announce announce--empty">
            <h3 className="announce__title">The next announcement lands here</h3>
            <p className="announce__text">
              We post news, events and updates in Discord first — join the server to be there
              when it happens.
            </p>
            <a className="btn btn--primary" href={INVITE_URL} target="_blank" rel="noopener noreferrer">
              Join the Discord
            </a>
          </div>
        )}

        {posts.length > 0 && (
          <div className="announce-grid" aria-live="polite">
            {posts.map((post, i) => (
              <Post
                key={post.id}
                post={post}
                index={i}
                featured={i === 0}
                fresh={freshIds.includes(post.id)}
              />
            ))}
          </div>
        )}

        {posts.length > 0 && (
          <div className="announce-cta">
            <a className="btn btn--secondary" href={INVITE_URL} target="_blank" rel="noopener noreferrer">
              Read everything in Discord
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
