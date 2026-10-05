import { useEffect } from "react"

/**
 * Scroll-linked motion for the whole page:
 *  - fills the reading-progress bar at the top
 *  - gentle parallax on the moon glow, stars and mist
 *  - hero logo/glow drift and hero content fade as you scroll away
 *
 * Elements are updated directly (no CSS variables on :root) so a scroll
 * frame never triggers a page-wide style recalculation. Everything runs
 * in a single rAF-throttled passive listener and is skipped entirely
 * for prefers-reduced-motion.
 */
export default function useScrollEffects() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const q = (selector) => document.querySelector(selector)
    const bar = q(".scroll-progress__bar")
    const stars = q(".atmosphere__stars")
    const moon = q(".atmosphere__moon")
    const mistA = q(".atmosphere__mist--a")
    const mistB = q(".atmosphere__mist--b")
    const heroGlow = q(".hero__glow")
    const heroLogo = q(".hero__logo")
    const heroInner = q(".hero__inner")

    let ticking = false

    const update = () => {
      ticking = false
      const y = window.scrollY || window.pageYOffset || 0
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      )

      if (bar) bar.style.transform = `scaleX(${Math.min(1, y / max).toFixed(4)})`

      const deep = Math.min(y, 3000)
      if (stars) stars.style.translate = `0 ${(-deep * 0.03).toFixed(1)}px`
      if (moon) moon.style.translate = `0 ${(-deep * 0.07).toFixed(1)}px`
      if (mistA) mistA.style.translate = `0 ${(-deep * 0.05).toFixed(1)}px`
      if (mistB) mistB.style.translate = `0 ${(-deep * 0.09).toFixed(1)}px`

      // hero is only on screen near the top — stop work once it is gone
      const h = Math.min(y, 900)
      if (heroGlow) heroGlow.style.translate = `0 ${(h * 0.28).toFixed(1)}px`
      if (heroLogo) heroLogo.style.translate = `0 ${(h * 0.14).toFixed(1)}px`
      if (heroInner) {
        const fade = 1 - Math.min(y, 640) / 820
        heroInner.style.opacity = fade.toFixed(3)
      }
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    update()

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      ;[stars, moon, mistA, mistB, heroGlow, heroLogo].forEach((el) => {
        if (el) el.style.translate = ""
      })
      if (heroInner) heroInner.style.opacity = ""
    }
  }, [])
}
