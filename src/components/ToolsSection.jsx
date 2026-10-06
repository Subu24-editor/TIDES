import { useRef } from "react"
import useScrollReveal from "../hooks/useScrollReveal.js"
import useStore from "../hooks/useStore.js"

const DownloadIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="28"
    height="28"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    focusable="false"
  >
    <path
      className="tool__icon-arrow"
      d="M12 3.8v10.4M7.8 10l4.2 4.2L16.2 10"
    />
    <path d="M4.5 17.2v1.6a1.6 1.6 0 0 0 1.6 1.6h11.8a1.6 1.6 0 0 0 1.6-1.6v-1.6" />
  </svg>
)

const DEFAULT_TOOLS = [
  {
    icon: <DownloadIcon />,
    title: "Drydock",
    text: "Built by Dreamleak. Grab the link and setup details in Discord.",
    ctaText: "Discord link coming soon →",
    href: null,
  },
]

export default function ToolsSection() {
  const ref = useRef(null)
  useScrollReveal(ref)
  const [tools] = useStore("tools", DEFAULT_TOOLS)

  return (
    <section
      className="section section--alt"
      id="activations"
      aria-labelledby="tools-title"
      ref={ref}
    >
      <div className="shell">
        <header className="section-head reveal">
          <p className="eyebrow">Resources</p>
          <h2 className="section-title" id="tools-title">
            Tools
          </h2>
        </header>

        <div className="grid grid--tools">
          {tools.map((tool, i) => (
            <article className="card tool reveal" key={i} data-tilt>
              <span className="tool__icon" aria-hidden="true">
                {tool.icon || <DownloadIcon />}
              </span>
              <h3 className="tool__title">{tool.title}</h3>
              <p className="tool__text">{tool.text}</p>
              {tool.href ? (
                <a
                  className="tool__cta"
                  href={tool.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {tool.ctaText}
                </a>
              ) : (
                <span className="tool__cta">{tool.ctaText}</span>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
