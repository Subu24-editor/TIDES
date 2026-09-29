import { useEffect } from "react"

/**
 * GPU-composited 3D card tilt — mirrors the darktides.online effect.
 * Cards rotate on the X/Y axis following the mouse cursor with a
 * perspective transform, plus a subtle light-spot that tracks the pointer.
 *
 * Usage: just call useTilt() in any component that contains [data-tilt] elements.
 */
export default function useTilt() {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    const isTouchOnly =
      window.matchMedia("(pointer: coarse)").matches &&
      !window.matchMedia("(pointer: fine)").matches

    if (prefersReduced || isTouchOnly) return

    const MAX_TILT = 10 // degrees
    const PERSPECTIVE = 800 // px
    const SCALE_HOVER = 1.02
    const TRANSITION_IN =
      "transform 0ms linear, box-shadow 400ms cubic-bezier(0.34,1.56,0.64,1)"
    const TRANSITION_OUT =
      "transform 500ms cubic-bezier(0.5,0,0.75,0), box-shadow 400ms cubic-bezier(0.5,0,0.75,0)"

    // Track all tilt cards
    const cards = document.querySelectorAll("[data-tilt]")

    const onMove = (e, card) => {
      const rect = card.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const maxR = Math.max(rect.width, rect.height) / 2

      const rotY = (dx / maxR) * MAX_TILT
      const rotX = -(dy / maxR) * MAX_TILT

      // Clamp
      const rx = Math.max(-MAX_TILT, Math.min(MAX_TILT, rotX))
      const ry = Math.max(-MAX_TILT, Math.min(MAX_TILT, rotY))

      // Light spot percentage
      const lx = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1)
      const ly = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1)

      card.style.transition = TRANSITION_IN
      card.style.transform = `perspective(${PERSPECTIVE}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${SCALE_HOVER})`
      card.style.setProperty("--light-x", `${lx}%`)
      card.style.setProperty("--light-y", `${ly}%`)
      card.dataset.tilting = "true"
    }

    const onLeave = (card) => {
      card.style.transition = TRANSITION_OUT
      card.style.transform = `perspective(${PERSPECTIVE}px) rotateX(0deg) rotateY(0deg) scale(1)`
      card.dataset.tilting = "false"
    }

    const handlers = Array.from(cards).map((card) => {
      const move = (e) => onMove(e, card)
      const leave = () => onLeave(card)
      card.addEventListener("pointermove", move, { passive: true })
      card.addEventListener("pointerleave", leave)
      return { card, move, leave }
    })

    return () => {
      handlers.forEach(({ card, move, leave }) => {
        card.removeEventListener("pointermove", move)
        card.removeEventListener("pointerleave", leave)
        card.style.transform = ""
        card.style.transition = ""
      })
    }
  }, [])
}
