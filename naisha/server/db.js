import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// DB_DIR lets a host with a persistent volume (e.g. Fly.io) point this at
// mounted storage so data survives redeploys. Defaults to local dev path.
const DB_PATH = path.join(process.env.DB_DIR || path.join(__dirname, 'data'), 'db.json')

const seedSources = [
  { id: 's1', label: 'Google News — Voter & election updates', url: 'https://news.google.com/rss/search?q=voter+registration+India+youth&hl=en-IN&gl=IN&ceid=IN:en', category: 'updates' },
  { id: 's2', label: 'Google News — Student scholarships & schemes', url: 'https://news.google.com/rss/search?q=India+government+scholarship+scheme+students&hl=en-IN&gl=IN&ceid=IN:en', category: 'schemes' },
  { id: 's3', label: 'Google News — Youth rights & online safety', url: 'https://news.google.com/rss/search?q=India+students+rights+online+safety&hl=en-IN&gl=IN&ceid=IN:en', category: 'updates' },
  { id: 's4', label: 'Google News — Civic action & local government', url: 'https://news.google.com/rss/search?q=India+civic+action+local+government+youth&hl=en-IN&gl=IN&ceid=IN:en', category: 'updates' },
]

// Verified against official sources (scholarships.gov.in, mybharat.gov.in, nss.gov.in,
// socialjustice.gov.in, dsel.education.gov.in) — see chat for citations. Deadlines are
// described honestly (rolling / scheme-specific) rather than invented single dates.
const seedOpportunities = [
  { id: 'o1', page: 'schemes', title: 'National Scholarship Portal', org: 'Government of India', link: 'https://scholarships.gov.in', description: 'Single-window platform hosting 140+ central and state scholarship schemes, from Class 1 to PhD.', deadline: 'Scheme-specific — check the portal for current windows', kind: 'Scholarship' },
  { id: 'o2', page: 'schemes', title: 'PM YASASVI (Post/Pre-Matric Scholarship for OBC, EBC & DNT students)', org: 'Ministry of Social Justice & Empowerment', link: 'https://www.myscheme.gov.in/schemes/pm-yasasvipmsobcebcdnts', description: 'For OBC/EBC/DNT students from Class 9, family income up to ₹2.5 lakh/year.', deadline: 'Check portal for current cycle', kind: 'Scholarship' },
  { id: 'o3', page: 'schemes', title: 'National Means-cum-Merit Scholarship (NMMSS)', org: 'Ministry of Education', link: 'https://dsel.education.gov.in/scheme/nmmss', description: '₹12,000/year for meritorious Class 9–12 students in government schools, selected via an entrance exam.', deadline: 'Annual exam-based — check portal for dates', kind: 'Scholarship' },
  { id: 'o4', page: 'schemes', title: 'MY Bharat', org: 'Ministry of Youth Affairs & Sports', link: 'https://mybharat.gov.in', description: 'Youth leadership platform (ages 15–29) for volunteering, mentorship, experiential learning and the National Youth Corps.', deadline: 'Open year-round', kind: 'Youth programme' },
  { id: 'o5', page: 'schemes', title: 'National Service Scheme (NSS)', org: 'Ministry of Youth Affairs & Sports', link: 'https://nss.gov.in', description: 'Community service programme for student volunteers in colleges and senior secondary schools.', deadline: 'Enrol through your institution', kind: 'Community service' },
]

const seedOpportunitiesHi = {
  o1: { titleHi: 'राष्ट्रीय छात्रवृत्ति पोर्टल', descriptionHi: 'एक ही जगह पर 140 से ज़्यादा केंद्र और राज्य की छात्रवृत्ति योजनाएँ, कक्षा 1 से पीएचडी तक।', deadlineHi: 'हर योजना की अलग तारीख़ — मौजूदा समय-सीमा पोर्टल पर देखें', kindHi: 'छात्रवृत्ति' },
  o2: { titleHi: 'पीएम यशस्वी (OBC, EBC और DNT छात्रों के लिए प्री/पोस्ट-मैट्रिक छात्रवृत्ति)', descriptionHi: 'कक्षा 9 से OBC/EBC/DNT छात्रों के लिए, परिवार की आय ₹2.5 लाख/वर्ष तक।', deadlineHi: 'मौजूदा चक्र के लिए पोर्टल देखें', kindHi: 'छात्रवृत्ति' },
  o3: { titleHi: 'राष्ट्रीय साधन-सह-योग्यता छात्रवृत्ति (NMMSS)', descriptionHi: 'सरकारी स्कूलों के मेधावी कक्षा 9–12 छात्रों के लिए ₹12,000/वर्ष, प्रवेश परीक्षा से चयन।', deadlineHi: 'हर साल परीक्षा के आधार पर — तारीख़ें पोर्टल पर देखें', kindHi: 'छात्रवृत्ति' },
  o4: { titleHi: 'मेरा युवा भारत (MY Bharat)', descriptionHi: '15–29 साल के युवाओं के लिए नेतृत्व मंच: स्वयंसेवा, मेंटरशिप, अनुभव से सीखना और राष्ट्रीय युवा कोर।', deadlineHi: 'पूरे साल खुला', kindHi: 'युवा कार्यक्रम' },
  o5: { titleHi: 'राष्ट्रीय सेवा योजना (NSS)', descriptionHi: 'कॉलेजों और सीनियर सेकेंडरी स्कूलों के छात्र स्वयंसेवकों के लिए सामुदायिक सेवा कार्यक्रम।', deadlineHi: 'अपने संस्थान के ज़रिए नामांकन करें', kindHi: 'सामुदायिक सेवा' },
}
export const HINDI_FIELDS = ['titleHi', 'descriptionHi', 'deadlineHi', 'kindHi']

export const defaultImpact = {
  reach: { studentsTrained: 0, schoolsVisited: 0, citiesCovered: 0 },
  voterRegistration: { formsSubmitted: 0, rollConfirmations: 0 },
  scholarships: { applications: 0, rupeeValue: 0, disbursements: 0 },
  rti: { filed: 0, responsesReceived: 0, issuesResolved: 0 },
  digitalSafety: { cybercrimeReports: 0, scamComplaints: 0 },
  financialInclusion: { bankAccounts: 0, panApplications: 0, digilockerActivations: 0 },
}

export const defaultSettings = { googleSheetUrl: '', donateUrl: '' }

function ensureDb() {
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ sources: seedSources, items: [], events: [], opportunities: seedOpportunities.map(o => ({ ...o, ...seedOpportunitiesHi[o.id] })), translations: { lessons: {} }, posts: [], stats: { total: 0, byDay: {} }, impact: defaultImpact, settings: defaultSettings, applications: [] }, null, 2))
  }
}

export function readDb() {
  ensureDb()
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
  if (!db.events) db.events = []
  if (!db.opportunities) db.opportunities = []
  if (!db.posts) db.posts = []
  if (!db.stats) db.stats = { total: 0, byDay: {} }
  if (!db.impact) db.impact = structuredClone(defaultImpact)
  if (!db.settings) db.settings = { ...defaultSettings }
  if (!db.applications) db.applications = []
  if (!db.translations) db.translations = { lessons: {} }
  for (const o of db.opportunities) {
    if (seedOpportunitiesHi[o.id] && o.titleHi === undefined) Object.assign(o, seedOpportunitiesHi[o.id])
  }
  return db
}

export function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}
