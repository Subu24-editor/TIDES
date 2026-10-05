import { useCallback } from "react"

let rafId = 0
let stopListening = null

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

function cancelActiveScroll() {
  cancelAnimationFrame(rafId)
  if (stopListening) {
    stopListening()
    stopListening = null
  }
}

/** Eased, interruptible scroll — slow start, smooth glide, soft landing. */
function animateScrollTo(targetY, duration) {
  cancelActiveScroll()

  const root = document.documentElement
  const startY = window.scrollY
  const distance = targetY - startY
  if (Math.abs(distance) < 2) return

  // native `scroll-behavior: smooth` would fight every frame we set
  const previousBehavior = root.style.scrollBehavior
  root.style.scrollBehavior = "auto"

  const events = ["wheel", "touchstart", "keydown", "mousedown"]
  const finish = () => {
    cancelAnimationFrame(rafId)
    events.forEach((name) => window.removeEventListener(name, finish))
    root.style.scrollBehavior = previousBehavior
    stopListening = null
  }
  events.forEach((name) =>
    window.addEventListener(name, finish, { passive: true, once: true }),
  )
  stopListening = finish

  const startTime = performance.now()
  const step = (now) => {
    const t = Math.min(1, (now - startTime) / duration)
    window.scrollTo(0, startY + distance * easeInOutCubic(t))
    if (t < 1) rafId = requestAnimationFrame(step)
    else finish()
  }
  rafId = requestAnimationFrame(step)
}

/**
 * Smooth-scrolls to a target element with a custom eased animation.
 * Honours the section's scroll-margin-top (fixed navbar) and
 * prefers-reduced-motion.
 */
export default function useSmoothScroll() {
  return useCallback((target, options = {}) => {
    if (!target) return

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0
    const maxY = document.documentElement.scrollHeight - window.innerHeight
    const targetY = Math.max(
      0,
      Math.min(maxY, target.getBoundingClientRect().top + window.scrollY - margin),
    )

    if (prefersReduced) {
      cancelActiveScroll()
      window.scrollTo({ top: targetY, behavior: "instant" })
    } else {
      const distance = Math.abs(targetY - window.scrollY)
      animateScrollTo(targetY, Math.min(1500, Math.max(750, distance * 0.55)))
    }

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
