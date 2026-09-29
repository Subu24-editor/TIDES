import { useRef, useState, useEffect, useCallback } from "react"
import useNavScroll from "../hooks/useNavScroll.js"
import useSmoothScroll from "../hooks/useSmoothScroll.js"
import useStore from "../hooks/useStore.js"

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#games", label: "Games" },
  { href: "#updates", label: "Updates" },
  { href: "#community", label: "Community" },
  { href: "#about", label: "About" },
  { href: "/dashboard", label: "Dashboard", isExternal: true },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const linkRefs = useRef([])
  const headerRef = useNavScroll(linkRefs)
  const smoothScroll = useSmoothScroll()
  const menuRef = useRef(null)
  const scrimRef = useRef(null)
  const toggleRef = useRef(null)
  const [discord] = useStore("discord", {
    url: "https://discord.gg/thedarktides",
  })

  const openMenu = useCallback(() => setIsOpen(true), [])
  const closeMenu = useCallback((returnFocus = false) => {
    setIsOpen(false)
    if (returnFocus && toggleRef.current) toggleRef.current.focus()
  }, [])

  const handleInternalLinkClick = useCallback(
    (event, href) => {
      if (!href.startsWith("#")) return
      event.preventDefault()
      const target = document.querySelector(href)
      if (!target) return
      closeMenu()
      smoothScroll(target)
    },
    [closeMenu, smoothScroll],
  )

  // Keyboard + focusin handling
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) closeMenu(true)
    }
    const onFocusIn = (e) => {
      if (!isOpen) return
      if (headerRef.current && headerRef.current.contains(e.target)) return
      closeMenu()
    }
    const onResize = () => {
      if (window.innerWidth >= 980 && isOpen) closeMenu()
    }

    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("focusin", onFocusIn)
    window.addEventListener("resize", onResize)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("focusin", onFocusIn)
      window.removeEventListener("resize", onResize)
    }
  }, [isOpen, closeMenu, headerRef])

  return (
    <>
      <header className="site-header" ref={headerRef}>
        <nav className="nav" aria-label="Primary">
          <a
            className="nav__brand"
            href="#top"
            onClick={(event) => {
              event.preventDefault()
              const prefersReduced = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
              ).matches
              window.scrollTo({
                top: 0,
                behavior: prefersReduced ? "auto" : "smooth",
              })
              history.replaceState(null, "", "#home")
            }}
          >
            <img
              className="nav__brand-mark"
              src="/img/logo-mark.svg"
              alt=""
              width="40"
              height="40"
            />
            <span className="nav__brand-text">The Dark Tides</span>
          </a>

          <button
            className="nav__toggle"
            type="button"
            ref={toggleRef}
            aria-expanded={isOpen}
            aria-controls="nav-menu"
            aria-label={
              isOpen ? "Close navigation menu" : "Open navigation menu"
            }
            onClick={() => (isOpen ? closeMenu() : openMenu())}
          >
            <span className="nav__toggle-bars" aria-hidden="true">
              <i></i>
              <i></i>
              <i></i>
            </span>
          </button>

          <div
            className={`nav__menu${isOpen ? " is-open" : ""}`}
            id="nav-menu"
            ref={menuRef}
          >
            <ul className="nav__links">
              {NAV_LINKS.map(({ href, label, isExternal }, i) => (
                <li key={href}>
                  <a
                    className="nav__link"
                    href={href}
                    ref={(el) => {
                      linkRefs.current[i] = el
                    }}
                    onClick={(event) => {
                      if (!isExternal) {
                        handleInternalLinkClick(event, href)
                        return
                      }
                      closeMenu()
                    }}
                    {...(isExternal ? {} : {})}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              className="btn btn--primary btn--sm nav__cta"
              href={discord.url || "https://discord.gg/thedarktides"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => closeMenu()}
            >
              Join Discord
            </a>
          </div>
        </nav>
      </header>

      {/* Scrim overlay for mobile menu */}
      <div
        className={`nav__scrim${isOpen ? " is-visible" : ""}`}
        ref={scrimRef}
        hidden={!isOpen}
        onClick={() => closeMenu()}
      />
    </>
  )
}
