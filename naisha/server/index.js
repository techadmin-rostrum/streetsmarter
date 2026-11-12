import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import multer from 'multer'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'
import { readDb, writeDb, defaultImpact, HINDI_FIELDS } from './db.js'
import { scrapeSource, scrapeAll } from './scraper.js'
import { checkPassword, createSession, destroySession, isAuthed, setSessionCookie, clearSessionCookie, getToken, requireAuth } from './auth.js'
import { sendContactEmail, sendApplicationEmail } from './mailer.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST_DIR = path.join(__dirname, '..', 'dist')

// Lives on the same persistent volume as the DB (DB_DIR, e.g. Fly's mounted
// /data) so uploaded images survive redeploys instead of vanishing with the
// ephemeral container filesystem.
const UPLOADS_DIR = path.join(process.env.DB_DIR || path.join(__dirname, 'data'), 'uploads')
fs.mkdirSync(UPLOADS_DIR, { recursive: true })
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const INTERESTS = ['Teaching and workshops', 'School outreach', 'Content and research', 'Social media', 'Design', 'Events']

const resumeUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => cb(null, randomUUID() + path.extname(file.originalname || '').slice(0, 10)),
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /\.(pdf|doc|docx|txt|rtf)$/i.test(file.originalname || '')
    if (!ok) return cb(new Error('Resume must be a PDF, DOC, DOCX, TXT, or RTF under 8MB'))
    cb(null, true)
  },
})

function asNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : null
}

function sanitizeImpact(input) {
  const out = structuredClone(defaultImpact)
  for (const group of Object.keys(out)) {
    for (const key of Object.keys(out[group])) {
      const n = asNumber(input?.[group]?.[key])
      if (n === null) return null
      out[group][key] = n
    }
  }
  return out
}

function cleanUrl(value) {
  const v = String(value || '').trim()
  if (!v) return ''
  try {
    const u = new URL(v)
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null
    return u.toString()
  } catch {
    return null
  }
}

function wordCount(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length
}

function sheetIdUrl(url) {
  const match = String(url || '').match(/\/s\/([^/]+)\/exec/)
  return match ? `https://script.google.com/macros/s/${match[1]}/exec` : ''
}

async function callSheet(url, row) {
  const target = sheetIdUrl(url) || url
  if (!target || !/script\.google\.com/i.test(target)) return { ok: false, text: 'Not an Apps Script web app link.' }
  const res = await fetch(target, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(row),
  })
  const raw = await res.text()
  const text = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const ok = res.ok && /^ok\b/i.test(raw.trim())
  return { ok, status: res.status, text: text.slice(0, 280) }
}

function explainSheet(result) {
  const text = result.text || ''
  if (result.status === 401 || result.status === 403 || /unauthorized|sign in to/i.test(text)) {
    return 'Google returned Unauthorized. Deploy the script again with Who has access set to Anyone, then paste the new /exec link. It should not contain /a/macros/.'
  }
  if (/Invalid argument: url/i.test(text)) {
    return 'The script is running, but it cannot open the spreadsheet. Open the Google Sheet, choose Extensions, then Apps Script, replace the code with the version on this page, and deploy it again. The old code still has PASTE_YOUR_SHEET_URL in it.'
  }
  if (!text) return 'Google did not confirm the row.'
  return `Google said: ${text}`
}

async function sheetWarning(url) {
  if (!url) return ''
  if (!/script\.google\.com/i.test(url)) return 'That link is saved, but rows are only sent to an Apps Script web app link (script.google.com).'
  try {
    const result = await callSheet(url, { type: 'link-check' })
    if (result.ok) return ''
    return `Saved. ${explainSheet(result)} Applications are still kept under Applications.`
  } catch {
    return 'That link is saved, but Google could not be reached to check it.'
  }
}

async function pushApplicationToSheet(url, row) {
  try {
    const result = await callSheet(url, row)
    if (!result.ok) console.error('[server] sheet push failed:', explainSheet(result))
    return result.ok
  } catch (err) {
    console.error('[server] sheet push failed', err.message)
    return false
  }
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => cb(null, randomUUID() + path.extname(file.originalname || '').slice(0, 10)),
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /^image\//.test(file.mimetype)),
})

const app = express()

// Only needed when the frontend lives on a different origin (e.g. Vercel/Fly split).
// Same-service and local dev never hit this since there's no cross-origin request to allow.
// Comma-separate multiple allowed origins (e.g. custom domain + the default vercel.app one).
if (process.env.FRONTEND_ORIGIN) {
  const allowedOrigins = process.env.FRONTEND_ORIGIN.split(',').map(s => s.trim())
  app.use(cors({ origin: allowedOrigins, credentials: true }))
}

app.use(express.json())
app.use('/uploads', express.static(UPLOADS_DIR))

app.get('/api/health', (req, res) => res.json({ ok: true }))

// --- image upload (admin) ---
app.post('/api/admin/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded (must be an image file under 8MB)' })
  res.json({ url: `/uploads/${req.file.filename}` })
})

// API_PORT wins locally (avoids colliding with the frontend dev server's PORT);
// hosting platforms set PORT and don't run a separate frontend process.
const PORT = process.env.API_PORT || process.env.PORT || 8787

// --- admin auth ---
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {}
  if (!checkPassword(password)) return res.status(401).json({ error: 'Wrong password' })
  const token = createSession()
  setSessionCookie(res, token)
  res.json({ ok: true })
})

app.post('/api/admin/logout', (req, res) => {
  destroySession(getToken(req))
  clearSessionCookie(res)
  res.json({ ok: true })
})

app.get('/api/admin/me', (req, res) => {
  if (!isAuthed(req)) return res.status(401).json({ authenticated: false })
  res.json({ authenticated: true })
})

// --- sources (admin) ---
app.get('/api/admin/sources', requireAuth, (req, res) => {
  res.json(readDb().sources)
})

app.post('/api/admin/sources', requireAuth, (req, res) => {
  const { label, url, category } = req.body || {}
  if (!label || !url || !category) return res.status(400).json({ error: 'label, url and category are required' })
  const db = readDb()
  const source = { id: randomUUID(), label, url, category }
  db.sources.push(source)
  writeDb(db)
  res.json(source)
})

app.delete('/api/admin/sources/:id', requireAuth, (req, res) => {
  const db = readDb()
  db.sources = db.sources.filter(s => s.id !== req.params.id)
  writeDb(db)
  res.json({ ok: true })
})

app.post('/api/admin/sources/:id/scrape', requireAuth, async (req, res) => {
  const db = readDb()
  const source = db.sources.find(s => s.id === req.params.id)
  if (!source) return res.status(404).json({ error: 'Source not found' })
  try {
    const added = await scrapeSource(source)
    res.json({ added })
  } catch (err) {
    res.status(502).json({ error: 'Could not fetch that feed right now: ' + err.message })
  }
})

app.post('/api/admin/scrape-all', requireAuth, async (req, res) => {
  const added = await scrapeAll()
  res.json({ added })
})

// --- items (admin) ---
app.get('/api/admin/items', requireAuth, (req, res) => {
  const { status } = req.query
  let items = readDb().items
  if (status) items = items.filter(i => i.status === status)
  res.json(items)
})

app.post('/api/admin/items/:id/approve', requireAuth, (req, res) => {
  const db = readDb()
  const item = db.items.find(i => i.id === req.params.id)
  if (!item) return res.status(404).json({ error: 'Not found' })
  item.status = 'approved'
  writeDb(db)
  res.json(item)
})

app.post('/api/admin/items/:id/reject', requireAuth, (req, res) => {
  const db = readDb()
  const item = db.items.find(i => i.id === req.params.id)
  if (!item) return res.status(404).json({ error: 'Not found' })
  item.status = 'rejected'
  writeDb(db)
  res.json(item)
})

app.delete('/api/admin/items/:id', requireAuth, (req, res) => {
  const db = readDb()
  db.items = db.items.filter(i => i.id !== req.params.id)
  writeDb(db)
  res.json({ ok: true })
})

// --- events (admin) ---
app.get('/api/admin/events', requireAuth, (req, res) => {
  res.json(readDb().events.slice().sort((a, b) => a.date.localeCompare(b.date)))
})

function eventFields(body, existing = {}) {
  const src = body || {}
  const images = Array.isArray(src.images)
    ? src.images.map(s => String(s || '').trim()).filter(Boolean).slice(0, 8)
    : (src.image ? [String(src.image).trim()] : (existing.images || (existing.image ? [existing.image] : [])))
  const date = String(src.date ?? existing.date ?? '').trim()
  const today = new Date().toISOString().slice(0, 10)
  const status = src.status === 'past' || src.status === 'upcoming'
    ? src.status
    : (existing.status || (date && date < today ? 'past' : 'upcoming'))
  const link = src.link !== undefined ? (cleanUrl(src.link) || '') : (existing.link || '')
  return {
    title: String(src.title ?? existing.title ?? '').trim(),
    date,
    place: String(src.place ?? existing.place ?? '').trim(),
    type: String(src.type ?? existing.type ?? '').trim(),
    description: String(src.description ?? existing.description ?? '').trim(),
    status,
    link,
    images,
    image: images[0] || '',
  }
}

app.post('/api/admin/events', requireAuth, (req, res) => {
  const fields = eventFields(req.body)
  if (!fields.title || !fields.date || !fields.place || !fields.type) return res.status(400).json({ error: 'title, date, place and type are required' })
  const db = readDb()
  const event = { id: randomUUID(), ...fields }
  db.events.push(event)
  writeDb(db)
  res.json(event)
})

app.patch('/api/admin/events/:id', requireAuth, (req, res) => {
  const db = readDb()
  const event = db.events.find(e => e.id === req.params.id)
  if (!event) return res.status(404).json({ error: 'Not found' })
  Object.assign(event, eventFields({ ...event, ...(req.body || {}) }))
  writeDb(db)
  res.json(event)
})

app.delete('/api/admin/events/:id', requireAuth, (req, res) => {
  const db = readDb()
  db.events = db.events.filter(e => e.id !== req.params.id)
  writeDb(db)
  res.json({ ok: true })
})

// --- opportunities (admin) ---
app.get('/api/admin/opportunities', requireAuth, (req, res) => {
  res.json(readDb().opportunities)
})

app.post('/api/admin/opportunities', requireAuth, (req, res) => {
  const { page, title, org, link, description, deadline, kind, image } = req.body || {}
  if (!page || !title || !org || !kind) return res.status(400).json({ error: 'page, title, org and kind are required' })
  const db = readDb()
  const opportunity = { id: randomUUID(), page, title, org, link: link || '', description: description || '', deadline: deadline || '', kind, image: image || '' }
  for (const f of HINDI_FIELDS) opportunity[f] = String(req.body[f] || '').trim()
  db.opportunities.push(opportunity)
  writeDb(db)
  res.json(opportunity)
})

app.patch('/api/admin/opportunities/:id', requireAuth, (req, res) => {
  const db = readDb()
  const opportunity = db.opportunities.find(o => o.id === req.params.id)
  if (!opportunity) return res.status(404).json({ error: 'Not found' })
  if ('image' in (req.body || {})) opportunity.image = req.body.image || ''
  for (const f of HINDI_FIELDS) if (f in (req.body || {})) opportunity[f] = String(req.body[f] || '').trim()
  writeDb(db)
  res.json(opportunity)
})

app.delete('/api/admin/opportunities/:id', requireAuth, (req, res) => {
  const db = readDb()
  db.opportunities = db.opportunities.filter(o => o.id !== req.params.id)
  writeDb(db)
  res.json({ ok: true })
})

// --- posts (admin) ---
function slugify(title, existingSlugs) {
  const base = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) || 'post'
  let slug = base, n = 2
  while (existingSlugs.has(slug)) slug = `${base}-${n++}`
  return slug
}

function cleanText(value) {
  return String(value || '').trim()
}

function paragraphs(value) {
  return cleanText(value).split(/\n\s*\n/).map(part => part.trim()).filter(Boolean)
}

app.get('/api/admin/posts', requireAuth, (req, res) => {
  res.json(readDb().posts.slice().sort((a, b) => b.date.localeCompare(a.date)))
})

app.post('/api/admin/posts', requireAuth, (req, res) => {
  const { tag, title, excerpt, body, date, featured, image, tagHi, titleHi, excerptHi, bodyHi } = req.body || {}
  if (!tag || !title || !excerpt || !body || !date) return res.status(400).json({ error: 'tag, title, excerpt, body and date are required' })
  const db = readDb()
  const slug = slugify(title, new Set(db.posts.map(p => p.slug)))
  const post = { id: randomUUID(), slug, tag, title, excerpt, body: paragraphs(body), date, featured: !!featured, image: image || '', tagHi: cleanText(tagHi), titleHi: cleanText(titleHi), excerptHi: cleanText(excerptHi), bodyHi: paragraphs(bodyHi) }
  if (featured) db.posts.forEach(p => { p.featured = false })
  db.posts.push(post)
  writeDb(db)
  res.json(post)
})

app.patch('/api/admin/posts/:id', requireAuth, (req, res) => {
  const db = readDb()
  const post = db.posts.find(p => p.id === req.params.id)
  if (!post) return res.status(404).json({ error: 'Not found' })
  const body = req.body || {}
  if ('image' in body) post.image = body.image || ''
  if ('tagHi' in body) post.tagHi = cleanText(body.tagHi)
  if ('titleHi' in body) post.titleHi = cleanText(body.titleHi)
  if ('excerptHi' in body) post.excerptHi = cleanText(body.excerptHi)
  if ('bodyHi' in body) post.bodyHi = paragraphs(body.bodyHi)
  writeDb(db)
  res.json(post)
})

app.delete('/api/admin/posts/:id', requireAuth, (req, res) => {
  const db = readDb()
  db.posts = db.posts.filter(p => p.id !== req.params.id)
  writeDb(db)
  res.json({ ok: true })
})

// --- Hindi lesson translations (edited in staff login, override the drafts in the frontend) ---
app.get('/api/public/translations', (req, res) => {
  res.json(readDb().translations)
})

app.put('/api/admin/translations/lessons/:slug', requireAuth, (req, res) => {
  const { title, topic, body, reviewed } = req.body || {}
  const paragraphs = Array.isArray(body) ? body : String(body || '').split(/\n\s*\n/)
  const clean = paragraphs.map(p => String(p).trim()).filter(Boolean)
  if (!String(title || '').trim() || !clean.length) return res.status(400).json({ error: 'Hindi title and text are required' })
  const db = readDb()
  db.translations.lessons[req.params.slug] = { title: String(title).trim(), topic: String(topic || '').trim(), body: clean, reviewed: !!reviewed, updatedAt: new Date().toISOString() }
  writeDb(db)
  res.json(db.translations.lessons[req.params.slug])
})

// --- visits ---
app.post('/api/public/visit', (req, res) => {
  const db = readDb()
  const day = new Date().toISOString().slice(0, 10)
  db.stats.total += 1
  db.stats.byDay[day] = (db.stats.byDay[day] || 0) + 1
  writeDb(db)
  res.json({ ok: true })
})

app.get('/api/admin/stats', requireAuth, (req, res) => {
  const db = readDb()
  const today = new Date().toISOString().slice(0, 10)
  const last7 = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
    last7.push({ date: d, count: db.stats.byDay[d] || 0 })
  }
  res.json({ total: db.stats.total, today: db.stats.byDay[today] || 0, last7 })
})

// --- impact ---
app.get('/api/public/impact', (req, res) => {
  res.json(readDb().impact)
})

app.get('/api/admin/impact', requireAuth, (req, res) => {
  res.json(readDb().impact)
})

app.put('/api/admin/impact', requireAuth, (req, res) => {
  const impact = sanitizeImpact(req.body)
  if (!impact) return res.status(400).json({ error: 'Every impact number must be zero or greater' })
  const db = readDb()
  db.impact = impact
  writeDb(db)
  res.json(impact)
})

// --- site settings (sheet + donate links) ---
app.get('/api/public/settings', (req, res) => {
  res.json({ donateUrl: readDb().settings.donateUrl || '' })
})

app.get('/api/admin/settings', requireAuth, (req, res) => {
  res.json(readDb().settings)
})

app.put('/api/admin/settings', requireAuth, async (req, res) => {
  const db = readDb()
  const current = db.settings || { googleSheetUrl: '', donateUrl: '' }
  const body = req.body || {}
  const hasSheet = Object.prototype.hasOwnProperty.call(body, 'googleSheetUrl')
  const hasDonate = Object.prototype.hasOwnProperty.call(body, 'donateUrl')
  const googleSheetUrl = hasSheet ? cleanUrl(body.googleSheetUrl) : (current.googleSheetUrl || '')
  const donateUrl = hasDonate ? cleanUrl(body.donateUrl) : (current.donateUrl || '')
  if (googleSheetUrl === null || donateUrl === null) return res.status(400).json({ error: 'Links must be empty or start with http:// or https://' })
  db.settings = { googleSheetUrl, donateUrl }
  writeDb(db)
  const warning = hasSheet ? await sheetWarning(googleSheetUrl) : ''
  res.json({ ...db.settings, warning })
})

app.get('/api/admin/applications', requireAuth, (req, res) => {
  res.json(readDb().applications.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
})

// --- trainer / volunteer applications ---
app.post('/api/public/contribute', (req, res, next) => {
  resumeUpload.single('resume')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Could not upload that resume' })
    next()
  })
}, async (req, res) => {
  const body = req.body || {}
  const type = body.type === 'trainer' || body.type === 'volunteer' ? body.type : ''
  const name = String(body.name || '').trim()
  const email = String(body.email || '').trim()
  const phone = String(body.phone || '').trim()
  if (!type || !name || !email || !phone) return res.status(400).json({ error: 'Name, email and phone are required' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address' })

  const application = {
    id: randomUUID(),
    type,
    name,
    email,
    phone,
    createdAt: new Date().toISOString(),
  }

  if (type === 'trainer') {
    const school = String(body.school || '').trim()
    const why = String(body.why || '').trim()
    const days = String(body.availability || '').split(',').map(d => d.trim()).filter(Boolean)
    const linkedin = cleanUrl(body.linkedin)
    if (!school || !why) return res.status(400).json({ error: 'School and the why answer are required' })
    if (wordCount(why) > 300) return res.status(400).json({ error: 'Please keep the why answer to 300 words' })
    if (!days.length || days.some(d => !WEEKDAYS.includes(d))) return res.status(400).json({ error: 'Pick at least one day you are free' })
    if (linkedin === null) return res.status(400).json({ error: 'LinkedIn link must be a valid http or https URL' })
    if (!req.file && !linkedin) return res.status(400).json({ error: 'Add a resume or a LinkedIn link' })
    if (body.resume && !req.file) return res.status(400).json({ error: 'Resume must be a PDF, DOC, DOCX, TXT, or RTF under 8MB' })
    Object.assign(application, {
      school,
      why,
      availability: days,
      linkedin: linkedin || '',
      resumeUrl: req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : '',
    })
  } else {
    const availability = String(body.availability || '').trim()
    const interest = String(body.interest || '').trim()
    if (!availability) return res.status(400).json({ error: 'Tell us when you are free' })
    if (!INTERESTS.includes(interest)) return res.status(400).json({ error: 'Pick an area of interest' })
    Object.assign(application, { availability, interest })
  }

  const db = readDb()
  db.applications.push(application)
  writeDb(db)

  const summary = type === 'trainer'
    ? `School: ${application.school}\nDays: ${application.availability.join(', ')}\nWhy: ${application.why}`
    : `Free: ${application.availability}\nInterest: ${application.interest}`
  let emailed = false
  try {
    await sendApplicationEmail({ name, email, type, summary })
    emailed = true
  } catch (err) {
    console.error('[server] application email failed', err.message)
  }

  let sheet = false
  try {
    sheet = await pushApplicationToSheet(db.settings.googleSheetUrl, application)
  } catch (err) {
    console.error('[server] sheet push failed', err.message)
  }

  res.json({ ok: true, emailed, sheet })
})

// --- contact ---
app.post('/api/public/contact', async (req, res) => {
  const name = String(req.body?.name || '').trim()
  const email = String(req.body?.email || '').trim()
  const message = String(req.body?.message || '').trim()
  if (!name || !email || !message) return res.status(400).json({ error: 'name, email and message are required' })
  try {
    await sendContactEmail({ name, email, message })
  } catch (err) {
    return res.status(502).json({ error: err.message })
  }
  try {
    await pushApplicationToSheet(readDb().settings.googleSheetUrl, {
      createdAt: new Date().toISOString(),
      type: 'contact',
      name,
      email,
      message,
    })
  } catch (err) {
    console.error('[server] contact sheet push failed', err.message)
  }
  res.json({ ok: true })
})

// --- public ---
app.get('/api/public/posts', (req, res) => {
  res.json(readDb().posts.slice().sort((a, b) => b.date.localeCompare(a.date)))
})

app.get('/api/public/opportunities', (req, res) => {
  const { page } = req.query
  let opportunities = readDb().opportunities
  if (page) opportunities = opportunities.filter(o => o.page === page)
  res.json(opportunities)
})

app.get('/api/public/events', (req, res) => {
  const today = new Date().toISOString().slice(0, 10)
  const events = readDb().events
  const isPast = e => e.status === 'past' ? true : e.status === 'upcoming' ? false : (e.date || '') < today
  const upcoming = events.filter(e => !isPast(e)).sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'))
  const past = events.filter(isPast).sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  res.json({ upcoming, past })
})

const IMPACT_TICKS = {
  vote: ['voterRegistration', 'formsSubmitted'],
  scholarship: ['scholarships', 'applications'],
  rti: ['rti', 'filed'],
}

app.post('/api/public/impact/tick', (req, res) => {
  const path = IMPACT_TICKS[req.body?.key]
  if (!path) return res.status(400).json({ error: 'Unknown action' })
  const db = readDb()
  const [group, field] = path
  db.impact[group][field] = (Number(db.impact[group][field]) || 0) + 1
  writeDb(db)
  res.json({ ok: true, value: db.impact[group][field] })
})

app.post('/api/public/reminders', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email' })
  const db = readDb()
  if (!Array.isArray(db.reminders)) db.reminders = []
  if (!db.reminders.some(r => r.email === email)) db.reminders.push({ email, createdAt: new Date().toISOString() })
  writeDb(db)
  res.json({ ok: true })
})

app.get('/api/public/items', (req, res) => {
  const { category } = req.query
  let items = readDb().items.filter(i => i.status === 'approved')
  if (category) items = items.filter(i => i.category === category)
  items = items.slice(0, 20).map(({ id, title, summary, link, publishedAt, sourceLabel, category }) => ({ id, title, summary, link, publishedAt, sourceLabel, category }))
  res.json(items)
})

// --- serve built frontend in production (single-service deploy) ---
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')))
}

app.listen(PORT, () => {
  console.log(`[server] StreetSmarter API listening on http://localhost:${PORT}`)
  console.log(`[server] form email is sent from ${process.env.EMAIL_USER || '(EMAIL_USER is not set)'}`)
  scrapeAll().then(added => console.log(`[server] initial scrape added ${added} items`)).catch(err => console.error('[server] initial scrape failed', err.message))
  setInterval(() => { scrapeAll().catch(err => console.error('[server] scheduled scrape failed', err.message)) }, 30 * 60 * 1000)
})
