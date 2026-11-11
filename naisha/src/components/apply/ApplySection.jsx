import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { api } from '../../lib/api'
import { Select } from '../common/UI'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
export const INTERESTS = ['Teaching and workshops', 'School outreach', 'Content and research', 'Social media', 'Design', 'Events']

function words(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export function ApplySection() {
  const [path, setPath] = useState(null)
  const [donateUrl, setDonateUrl] = useState('')
  const [sent, setSent] = useState(null)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [days, setDays] = useState([])
  const [why, setWhy] = useState('')

  useEffect(() => {
    api.publicSettings().then(d => setDonateUrl(d.donateUrl || '')).catch(() => setDonateUrl(''))
  }, [])

  function toggleDay(day) {
    setDays(current => current.includes(day) ? current.filter(d => d !== day) : [...current, day])
  }

  async function submit(e) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const resume = form.get('resume')
    if (resume instanceof File && resume.size === 0) form.delete('resume')
    form.set('type', path)
    if (path === 'volunteer' && !String(form.get('interest') || '').trim()) {
      setError('Choose an area of interest.')
      return
    }
    if (path === 'trainer') {
      form.set('why', why)
      form.set('availability', days.join(','))
    }
    setSending(true)
    setError('')
    try {
      const result = await api.contribute(form)
      setSent(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    const trainer = path === 'trainer'
    return (
      <div className="panel-block p-8">
        <p className="flex items-center gap-2 font-display text-3xl font-extrabold text-navy"><CheckCircle2 className="text-civic" /> Thank you</p>
        <p className="mt-4 max-w-xl leading-7 text-ink/75">{trainer
          ? 'We have your trainer application. A confirmation is on its way to the email you gave, and someone from StreetSmarter will write back.'
          : 'We have your volunteer details. A confirmation is on its way to the email you gave, and someone from StreetSmarter will write back.'}</p>
        {!sent.emailed && <p className="mt-3 text-sm text-ink/60">Your application is saved. The confirmation email could not be sent just now, and the team can still see it in staff login.</p>}
        <button type="button" className="btn-primary mt-6" onClick={() => { setSent(null); setPath(null); setWhy(''); setDays([]) }}>Submit another</button>
      </div>
    )
  }

  return (
    <div>
      <p className="eyebrow">Get involved</p>
      <h2 className="mt-2 text-4xl md:text-5xl">Train, volunteer, or donate</h2>
      <p className="mt-4 max-w-2xl leading-7 text-ink/75">Three ways to help Indian teenagers learn the civic stuff school skipped.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ['trainer', '01', 'Become a trainer', 'Run a session at a school or colony.'],
          ['volunteer', '02', 'Volunteer', 'Help with workshops, content, design or events.'],
          ['donor', '03', 'Donate', 'Support the sessions and the free guides.'],
        ].map(([key, num, title, copy]) => (
          <button key={key} type="button" onClick={() => { setPath(key); setError('') }} className={`rounded-lg border-2 border-navy p-6 text-left transition ${path === key ? 'bg-navy text-white shadow-[3px_3px_0_0_#FFC107]' : 'bg-white hover:-translate-y-0.5 hover:shadow-hover'}`}>
            <span className="num block">{num}</span>
            <span className="mt-4 block font-display text-2xl font-extrabold">{title}</span>
            <span className={`mt-2 block text-sm ${path === key ? 'text-white/75' : 'text-ink/65'}`}>{copy}</span>
          </button>
        ))}
      </div>

      {path === 'donor' && (
        <div className="panel-block mt-8 bg-saffron p-6 md:p-8">
          <h3 className="text-2xl">Donate to StreetSmarter</h3>
          <p className="mt-2 max-w-xl leading-7 text-navy">The payment page opens in a new tab. Until that link is ready, this button stays here as a placeholder.</p>
          {donateUrl
            ? <a className="btn-primary mt-5" href={donateUrl} target="_blank" rel="noopener noreferrer">Donate <ArrowRight size={16} /></a>
            : <button type="button" className="btn-primary mt-5" disabled>Payment link coming soon</button>}
        </div>
      )}

      {(path === 'trainer' || path === 'volunteer') && (
        <form onSubmit={submit} className="panel-block mt-8 grid gap-4 p-6 md:grid-cols-2 md:p-8">
          <input name="name" required className="input" placeholder="Your name" />
          <input name="email" type="email" required className="input" placeholder="Email address" />
          <input name="phone" required className="input" placeholder="Phone number" />
          {path === 'trainer' ? (
            <>
              <input name="school" required className="input" placeholder="School or college" />
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-navy">Why do you want to be a civic literacy trainer?</span>
                <textarea required value={why} onChange={e => setWhy(e.target.value)} className="input mt-2 min-h-32" placeholder="Up to 300 words" />
                <span className={`mt-1 block text-xs font-bold ${words(why) > 300 ? 'text-coral' : 'text-ink/45'}`}>{words(why)} / 300 words</span>
              </label>
              <fieldset className="md:col-span-2">
                <legend className="text-sm font-bold text-navy">Days you are free</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <label key={day} className={`chip cursor-pointer ${days.includes(day) ? 'bg-navy text-white' : 'bg-white text-navy'}`}>
                      <input type="checkbox" className="sr-only" checked={days.includes(day)} onChange={() => toggleDay(day)} />
                      {day.slice(0, 3)}
                    </label>
                  ))}
                </div>
              </fieldset>
              <input name="linkedin" type="url" className="input" placeholder="LinkedIn link (or upload a resume below)" />
              <label className="block text-sm font-bold text-navy">Resume
                <input name="resume" type="file" accept=".pdf,.doc,.docx,.txt,.rtf,application/pdf" className="mt-2 block w-full text-sm font-medium" />
              </label>
            </>
          ) : (
            <>
              <input name="availability" required className="input" placeholder="When are you free? (days or times)" />
              <Select name="interest" placeholder="Area of interest" options={INTERESTS} />
            </>
          )}
          {error && <p className="text-sm font-bold text-coral md:col-span-2">{error}</p>}
          <button type="submit" disabled={sending} className="btn-accent w-fit">{sending ? 'Sending…' : 'Submit'} <ArrowRight size={16} /></button>
        </form>
      )}
    </div>
  )
}
