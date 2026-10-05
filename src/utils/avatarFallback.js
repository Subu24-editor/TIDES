const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }

/** On-brand monogram portrait as a data URI — the last-resort avatar. */
export function fallbackAvatar(name = "") {
  const letter = (String(name).trim()[0] || "?").toUpperCase().replace(/[&<>"']/g, (c) => ESC[c])
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
    '<defs><radialGradient id="g" cx="40%" cy="32%" r="78%"><stop offset="0" stop-color="#10394C"/>' +
    '<stop offset=".56" stop-color="#0A1D2A"/><stop offset="1" stop-color="#05121C"/></radialGradient></defs>' +
    '<circle cx="120" cy="120" r="120" fill="url(#g)"/>' +
    '<circle cx="120" cy="112" r="58" fill="none" stroke="#7DEBFF" stroke-width="3" stroke-opacity=".85"/>' +
    '<text x="120" y="132" text-anchor="middle" font-family="Georgia,serif" font-size="62" font-weight="700" fill="#7DEBFF">' +
    letter +
    "</text>" +
    '<path d="M72 186 C 90 176, 104 196, 120 186 S 150 176, 168 186" fill="none" stroke="#7DEBFF" stroke-opacity=".6" stroke-width="3.4" stroke-linecap="round"/>' +
    "</svg>"
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg)
}
