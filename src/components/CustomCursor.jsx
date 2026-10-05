import { useEffect, useRef } from "react"

const INTERACTIVE_SELECTOR =
  "a, button, input, textarea, select, summary, label, [role='button'], [data-cursor='interactive']"

export default function CustomCursor() {
  const rootRef = useRef(null)
  const ringRef = useRef(null)
  const dotRef = useRef(null)
  const rafRef = useRef(null)
  const targetRef = useRef({ x: -200, y: -200 })
  const positionRef = useRef({ x: -200, y: -200 })
  const activeRef = useRef(false)
  const visibleRef = useRef(false)

  useEffect(() => {
    // Only skip on explicit reduced-motion preference or strict touch-only devices
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    // Touch-only = coarse pointer AND no hover capability (phones/tablets)
    const isTouchOnly =
      window.matchMedia("(pointer: coarse)").matches &&
      !window.matchMedia("(pointer: fine)").matches

    if (prefersReduced || isTouchOnly) return

    // Hide the native OS cursor by injecting a style tag — most reliable method
    const styleEl = document.createElement("style")
    styleEl.id = "custom-cursor-style"
    styleEl.textContent = `*, *::before, *::after { cursor: none !important; }`
    document.head.appendChild(styleEl)
    document.documentElement.classList.add("has-custom-cursor")

    const root = rootRef.current
    const ring = ringRef.current
    const dot = dotRef.current

    const setCursorState = (visible, active) => {
      if (!root) return
      root.dataset.visible = visible ? "true" : "false"
      root.dataset.active = active ? "true" : "false"
      visibleRef.current = visible
    }

    const update = () => {
      const target = targetRef.current
      const pos = positionRef.current

      pos.x += (target.x - pos.x) * 0.14
      pos.y += (target.y - pos.y) * 0.14

      if (ring) ring.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      if (dot)
        dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`

      rafRef.current = requestAnimationFrame(update)
    }

    // Start the loop immediately (always running)
    rafRef.current = requestAnimationFrame(update)

    const onPointerMove = (e) => {
      targetRef.current = { x: e.clientX, y: e.clientY }
      if (!visibleRef.current) {
        positionRef.current = { x: e.clientX, y: e.clientY }
      }
      setCursorState(true, activeRef.current)
    }

    const onPointerDown = () => {
      if (root) root.dataset.pressed = "true"
    }
    const onPointerUp = () => {
      if (root) root.dataset.pressed = "false"
    }

    const onPointerLeave = () => {
      setCursorState(false, false)
      if (root) root.dataset.pressed = "false"
    }

    const onPointerOver = (e) => {
      activeRef.current = Boolean(e.target.closest(INTERACTIVE_SELECTOR))
      if (visibleRef.current) setCursorState(true, activeRef.current)
    }

    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("pointerup", onPointerUp)
    window.addEventListener("blur", onPointerLeave)
    document.addEventListener("pointerover", onPointerOver)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      document.documentElement.classList.remove("has-custom-cursor")
      const s = document.getElementById("custom-cursor-style")
      if (s) s.remove()
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("pointerup", onPointerUp)
      window.removeEventListener("blur", onPointerLeave)
      document.removeEventListener("pointerover", onPointerOver)
    }
  }, [])

  return (
    <div ref={rootRef} className="custom-cursor" aria-hidden="true">
      <span ref={ringRef} className="custom-cursor__ring"></span>
      <span ref={dotRef} className="custom-cursor__dot"></span>
    </div>
  )
}
