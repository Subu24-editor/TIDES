import { useRef } from "react"
import useScrollReveal from "../hooks/useScrollReveal.js"
import useStore from "../hooks/useStore.js"
import useAvatar from "../hooks/useAvatar.js"

const DEFAULT_STAFF = {
  owners: [
    {
      mono: "M",
      name: "Maverick",
      role: "Owner",
      text: "Runs the server and guides the staff, with a hand in community leadership and direction.",
    },
    {
      mono: "C",
      name: "Chrollo Fake One",
      role: "Owner",
      text: "Community leadership and direction.",
    },
    {
      mono: "H",
      name: "Helm",
      role: "Owner",
      text: "Community leadership and direction. Also manages the bot.",
    },
  ],
  admins: [
    {
      mono: "DK",
      name: "The Dark Knight",
      role: "Admin",
      text: "Community moderation and guidance",
    },
    {
      mono: "X",
      name: "Xei",
      role: "Admin",
      text: "Community moderation and guidance",
    },
    {
      mono: "G",
      name: "Ghost",
      role: "Admin",
      text: "Community moderation and guidance",
    },
  ],
}

function PersonCard({ person, isOwner }) {
  const { src: avatarSrc, onError, liveName } = useAvatar(person)
  const displayName = liveName || person.name
  const hasAvatar = Boolean(person.image || person.discordId)
  return (
    <article
      className={`card person${isOwner ? " person--owner" : ""} reveal`}
      data-tilt
    >
      <span
        className={`avatar${isOwner ? " avatar--owner" : ""}`}
        aria-hidden="true"
      >
        {hasAvatar ? (
          <img
            src={avatarSrc}
            onError={onError}
            alt=""
            width="80"
            height="80"
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          <span className="avatar__mono">
            {person.mono || (person.name ? person.name.charAt(0) : "S")}
          </span>
        )}
      </span>
      <h4 className="person__name">{displayName}</h4>
      <p className="person__role">
        {person.role || (isOwner ? "Owner" : "Admin")}
      </p>
      <p className="person__text">{person.text}</p>
    </article>
  )
}

export default function StaffSection() {
  const ref = useRef(null)
  useScrollReveal(ref)
  const [staff] = useStore("staff", DEFAULT_STAFF)

  const owners = staff.owners || DEFAULT_STAFF.owners
  const admins = staff.admins || DEFAULT_STAFF.admins

  return (
    <section
      className="section"
      id="staff"
      aria-labelledby="staff-title"
      ref={ref}
    >
      <div className="shell">
        <header className="section-head reveal">
          <p className="eyebrow">The Crew</p>
          <h2 className="section-title" id="staff-title">
            Staff
          </h2>
          <p className="section-sub">
            The people running things behind the scenes. Reach out via Discord
            for anything urgent.
          </p>
        </header>

        <h3 className="subsection-title reveal">Owners</h3>
        <div className="grid grid--people">
          {owners.map((p, i) => (
            <PersonCard key={p.name || i} person={p} isOwner={true} />
          ))}
        </div>

        <h3 className="subsection-title reveal">Admins</h3>
        <div className="grid grid--people">
          {admins.map((p, i) => (
            <PersonCard key={p.name || i} person={p} isOwner={false} />
          ))}
        </div>
      </div>
    </section>
  )
}
