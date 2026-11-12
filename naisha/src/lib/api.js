// Same origin locally (Vite proxies /api) and in single-service production.
// Set VITE_API_BASE (e.g. https://streetsmarter-api.onrender.com) when the
// frontend and backend are deployed separately, like Vercel + Render.
const API_BASE = import.meta.env.VITE_API_BASE || ''

async function req(path, opts = {}) {
  const res = await fetch(API_BASE + '/api' + path, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...opts })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.status === 204 ? null : res.json()
}

// Uploaded images are stored as backend-relative paths ("/uploads/xyz.png") so
// they stay portable regardless of host. When the frontend and API live on
// different origins (Vercel + Fly), resolve them against the API's origin.
export function resolveImage(path) {
  if (!path) return path
  return path.startsWith('/uploads/') ? API_BASE + path : path
}

async function upload(file) {
  const form = new FormData()
  form.append('image', file)
  const res = await fetch(API_BASE + '/api/admin/upload', { method: 'POST', credentials: 'include', body: form })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Upload failed')
  }
  return res.json()
}

export const api = {
  me: () => req('/admin/me'),
  login: password => req('/admin/login', { method: 'POST', body: JSON.stringify({ password }) }),
  logout: () => req('/admin/logout', { method: 'POST' }),
  sources: () => req('/admin/sources'),
  addSource: s => req('/admin/sources', { method: 'POST', body: JSON.stringify(s) }),
  deleteSource: id => req(`/admin/sources/${id}`, { method: 'DELETE' }),
  scrapeSource: id => req(`/admin/sources/${id}/scrape`, { method: 'POST' }),
  scrapeAll: () => req('/admin/scrape-all', { method: 'POST' }),
  items: status => req(`/admin/items${status ? `?status=${status}` : ''}`),
  approve: id => req(`/admin/items/${id}/approve`, { method: 'POST' }),
  reject: id => req(`/admin/items/${id}/reject`, { method: 'POST' }),
  deleteItem: id => req(`/admin/items/${id}`, { method: 'DELETE' }),
  publicItems: category => req(`/public/items${category ? `?category=${category}` : ''}`),
  events: () => req('/admin/events'),
  addEvent: e => req('/admin/events', { method: 'POST', body: JSON.stringify(e) }),
  updateEvent: (id, data) => req(`/admin/events/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteEvent: id => req(`/admin/events/${id}`, { method: 'DELETE' }),
  publicEvents: () => req('/public/events'),
  opportunities: () => req('/admin/opportunities'),
  addOpportunity: o => req('/admin/opportunities', { method: 'POST', body: JSON.stringify(o) }),
  updateOpportunity: (id, data) => req(`/admin/opportunities/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteOpportunity: id => req(`/admin/opportunities/${id}`, { method: 'DELETE' }),
  publicOpportunities: page => req(`/public/opportunities${page ? `?page=${page}` : ''}`),
  posts: () => req('/admin/posts'),
  addPost: p => req('/admin/posts', { method: 'POST', body: JSON.stringify(p) }),
  updatePost: (id, data) => req(`/admin/posts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePost: id => req(`/admin/posts/${id}`, { method: 'DELETE' }),
  publicPosts: () => req('/public/posts'),
  sendContact: data => req('/public/contact', { method: 'POST', body: JSON.stringify(data) }),
  impact: () => req('/public/impact'),
  tickImpact: key => req('/public/impact/tick', { method: 'POST', body: JSON.stringify({ key }) }),
  reminders: email => req('/public/reminders', { method: 'POST', body: JSON.stringify({ email }) }),
  adminImpact: () => req('/admin/impact'),
  saveImpact: data => req('/admin/impact', { method: 'PUT', body: JSON.stringify(data) }),
  publicSettings: () => req('/public/settings'),
  adminSettings: () => req('/admin/settings'),
  saveSettings: data => req('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
  applications: () => req('/admin/applications'),
  translations: () => req('/public/translations'),
  saveLessonHi: (slug, data) => req(`/admin/translations/lessons/${slug}`, { method: 'PUT', body: JSON.stringify(data) }),
  contribute: async formData => {
    const res = await fetch(API_BASE + '/api/public/contribute', { method: 'POST', credentials: 'include', body: formData })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(err.error || 'Request failed')
    }
    return res.json()
  },
  uploadImage: upload,
  stats: () => req('/admin/stats'),
  trackVisit: () => fetch(API_BASE + '/api/public/visit', { method: 'POST', credentials: 'include' }).catch(() => {}),
}
