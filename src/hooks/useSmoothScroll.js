import { useCallback } from "react"

/**
 * Smooth-scrolls to a target element using scrollIntoView.
 * Sections have scroll-margin-top in CSS to account for the fixed navbar.
 * Respects prefers-reduced-motion.
 */
export default function useSmoothScroll() {
  return useCallback((target, options = {}) => {
    if (!target) return

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    // Use scrollIntoView — universally supported, works with scroll-margin-top
    target.scrollIntoView({
      behavior: prefersReduced ? "instant" : "smooth",
      block: "start",
    })

    if (options.updateHash !== false && target.id) {
      history.replaceState(null, "", `#${target.id}`)
    }

    if (options.focus !== false) {
      const hadTabIndex = target.hasAttribute("tabindex")
      if (!hadTabIndex) target.setAttribute("tabindex", "-1")
      target.focus({ preventScroll: true })
      if (!hadTabIndex) {
        window.setTimeout(() => target.removeAttribute("tabindex"), 100)
      }
    }
  }, [])
}
