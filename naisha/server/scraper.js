import { XMLParser } from 'fast-xml-parser'
import { randomUUID } from 'crypto'
import { readDb, writeDb } from './db.js'

const parser = new XMLParser({ ignoreAttributes: false })

const ENTITIES = { '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&#39;': "'", '&apos;': "'", '&lt;': '<', '&gt;': '>' }
function stripHtml(str = '') {
  let out = String(str).replace(/<[^>]*>/g, '')
  out = out.replace(/&nbsp;|&amp;|&quot;|&#39;|&apos;|&lt;|&gt;/g, m => ENTITIES[m])
  return out.replace(/\s+/g, ' ').trim()
}

async function fetchFeed(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (StreetSmarterBot/1.0; +https://streetsmarter.in)' } })
  if (!res.ok) throw new Error(`Feed request failed: ${res.status}`)
  const xml = await res.text()
  const parsed = parser.parse(xml)
  const items = parsed?.rss?.channel?.item || []
  return Array.isArray(items) ? items : [items]
}

export async function scrapeSource(source) {
  const rawItems = await fetchFeed(source.url)
  const db = readDb()
  const existingLinks = new Set(db.items.map(i => i.link))
  let added = 0
  for (const raw of rawItems.slice(0, 12)) {
    const link = typeof raw.link === 'string' ? raw.link : raw.link?.['#text'] || ''
    if (!link || existingLinks.has(link)) continue
    db.items.unshift({
      id: randomUUID(),
      sourceId: source.id,
      sourceLabel: source.label,
      category: source.category,
      title: stripHtml(raw.title),
      summary: stripHtml(raw.description).slice(0, 220),
      link,
      publishedAt: raw.pubDate || new Date().toISOString(),
      status: 'pending',
      fetchedAt: new Date().toISOString(),
    })
    existingLinks.add(link)
    added++
  }
  writeDb(db)
  return added
}

export async function scrapeAll() {
  const db = readDb()
  let total = 0
  for (const source of db.sources) {
    try {
      total += await scrapeSource(source)
    } catch (err) {
      console.error(`[scraper] failed for ${source.label}:`, err.message)
    }
  }
  return total
}
