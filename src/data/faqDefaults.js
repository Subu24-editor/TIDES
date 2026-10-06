const DEFAULT_FAQ = [
  {
    id: "q1",
    question: "What is The Dark Tides server?",
    answer:
      "THE DARK TIDES is a gaming and community hub for gamers, developers, and enthusiasts. It's a place to discover games, share projects, access tools, get updates, and connect with the community.",
    placeholder: false,
  },
  {
    id: "q2",
    question: "What is Drydock?",
    answer:
      "Drydock is a tool built by Dreamleak for The Dark Tides community. Setup details and access information are provided through the Discord server.",
    placeholder: false,
  },
  {
    id: "q3",
    question: "How do I join the Discord?",
    answer:
      "Use the JOIN DISCORD button on the website to enter The Dark Tides community. Once you're in, you'll be able to access announcements, community channels, projects, support, and more.",
    placeholder: false,
  },
  {
    id: "q4",
    question: "How can I contact staff?",
    answer:
      "Join the Discord server and reach out through the appropriate support or community channels. The Dark Tides staff team is there to help members with questions and issues.",
    placeholder: false,
  },
  {
    id: "q5",
    question: "[Add question here]",
    answer: "[Add answer here]",
    placeholder: true,
  },
  {
    id: "q6",
    question: "[Add question here]",
    answer: "[Add answer here]",
    placeholder: true,
  },
  {
    id: "q7",
    question: "[Add question here]",
    answer: "[Add answer here]",
    placeholder: true,
  },
]

function createFaqId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `faq-${crypto.randomUUID()}`
  }

  return `faq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function createFaqItem(overrides = {}) {
  return {
    id: createFaqId(),
    question: "New question",
    answer: "New answer",
    placeholder: false,
    ...overrides,
  }
}

function normalizeFaqItems(items) {
  if (!Array.isArray(items)) {
    return DEFAULT_FAQ
  }

  return items.map((item, index) => ({
    id: item?.id || `faq-${index + 1}`,
    question: item?.question || "",
    answer: item?.answer || "",
    placeholder: Boolean(item?.placeholder),
  }))
}

export { DEFAULT_FAQ, createFaqItem, normalizeFaqItems }
