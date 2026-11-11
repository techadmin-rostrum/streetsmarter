import crypto from 'crypto'

const sessions = new Map()
const SESSION_TTL_MS = 8 * 60 * 60 * 1000
const COOKIE_NAME = 'ss_session'

export function checkPassword(input) {
  const expected = process.env.ADMIN_PASSWORD || ''
  const a = Buffer.from(String(input || ''))
  const b = Buffer.from(String(expected))
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export function createSession() {
  const token = crypto.randomBytes(24).toString('hex')
  sessions.set(token, Date.now() + SESSION_TTL_MS)
  return token
}

export function destroySession(token) {
  sessions.delete(token)
}

function parseCookies(header = '') {
  const out = {}
  header.split(';').forEach(part => {
    const [k, ...v] = part.trim().split('=')
    if (k) out[k] = decodeURIComponent(v.join('='))
  })
  return out
}

export function isAuthed(req) {
  const cookies = parseCookies(req.headers.cookie)
  const token = cookies[COOKIE_NAME]
  if (!token) return false
  const expiry = sessions.get(token)
  if (!expiry || expiry < Date.now()) { sessions.delete(token); return false }
  return true
}

// Cross-site deploys (separate frontend/backend origins, e.g. Vercel + Render)
// need SameSite=None; Secure for the cookie to survive a cross-origin fetch.
// Local dev and single-service production stay same-site, so Lax still works there.
const CROSS_SITE = process.env.FRONTEND_ORIGIN ? '; SameSite=None; Secure' : '; SameSite=Lax'

export function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; HttpOnly; Path=/${CROSS_SITE}; Max-Age=${SESSION_TTL_MS / 1000}`)
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/${CROSS_SITE}; Max-Age=0`)
}

export function getToken(req) {
  return parseCookies(req.headers.cookie)[COOKIE_NAME]
}

export function requireAuth(req, res, next) {
  if (!isAuthed(req)) return res.status(401).json({ error: 'Not authenticated' })
  next()
}
