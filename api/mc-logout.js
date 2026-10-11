import { setCookie, COOKIE } from "./_mc-auth.js"

export default function handler(req, res) {
  setCookie(res, COOKIE, "", 0)
  res.setHeader("Cache-Control", "no-store")
  res.redirect(302, "/")
}
