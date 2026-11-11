import { useEffect, useState } from 'react'
import { api } from './api'
import { lessonsHi } from '../data/lessonsHi'

const KEY = 'ss-lang'
const EVENT = 'ss-lang-change'
const read = () => (localStorage.getItem(KEY) === 'hi' ? 'hi' : 'en')

export function useLang() {
  const [lang, setLangState] = useState(read)
  useEffect(() => {
    const sync = () => setLangState(read())
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => { window.removeEventListener(EVENT, sync); window.removeEventListener('storage', sync) }
  }, [])
  function setLang(next) {
    localStorage.setItem(KEY, next)
    window.dispatchEvent(new Event(EVENT))
  }
  return [lang, setLang]
}

let overridesPromise = null
export function loadLessonOverrides(force = false) {
  if (!overridesPromise || force) overridesPromise = api.translations().then(t => t.lessons || {}).catch(() => ({}))
  return overridesPromise
}

export function useLessonOverrides() {
  const [overrides, setOverrides] = useState({})
  useEffect(() => { let alive = true; loadLessonOverrides().then(o => { if (alive) setOverrides(o) }); return () => { alive = false } }, [])
  return overrides
}

export function hindiLesson(slug, overrides) {
  const saved = overrides?.[slug]
  const draft = lessonsHi[slug]
  if (saved) return { ...draft, ...saved, reviewed: !!saved.reviewed }
  return draft ? { ...draft, reviewed: false } : null
}

export function localiseLesson(lesson, lang, overrides) {
  if (lang !== 'hi') return { ...lesson, reviewed: true }
  const hi = hindiLesson(lesson.slug, overrides)
  if (!hi) return { ...lesson, reviewed: true, missingHi: true }
  return { ...lesson, title: hi.title, topic: hi.topic || lesson.topic, body: hi.body, reviewed: hi.reviewed }
}
