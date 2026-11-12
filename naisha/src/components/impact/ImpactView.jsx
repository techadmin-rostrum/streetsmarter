import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Users, School, MapPin, Vote, GraduationCap, FileSearch, ShieldCheck, Landmark } from 'lucide-react'
import { CallToAction } from '../common/UI'
import { Breadcrumb } from '../layout/Shell'
import { api } from '../../lib/api'
import { IMPACT_GROUPS, formatImpact } from '../../data/impact'

const ICONS = {
  reach: Users,
  studentsTrained: Users,
  schoolsVisited: School,
  citiesCovered: MapPin,
  voterRegistration: Vote,
  scholarships: GraduationCap,
  rti: FileSearch,
  digitalSafety: ShieldCheck,
  financialInclusion: Landmark,
}

function Icon({ name, light }) {
  const I = ICONS[name] || Users
  return <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-md border-2 border-navy text-navy ${light ? 'bg-white' : 'bg-saffron'}`}><I size={20} /></span>
}

export function ImpactView() {
  const [data, setData] = useState(null)
  useEffect(() => {
    let alive = true
    api.impact().then(d => { if (alive) setData(d || {}) }).catch(() => { if (alive) setData({}) })
    return () => { alive = false }
  }, [])
  const [reach, ...steps] = IMPACT_GROUPS
  return (
    <>
      <section className="bg-paper">
        <Breadcrumb trail={['Impact']} />
        <div className="mx-auto max-w-6xl px-5 pb-2 pt-3 md:px-8">
          <p className="tag">Impact</p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-[1.05] md:text-6xl">The difference so far.</h1>
          <p className="mt-4 max-w-xl text-lg leading-7 text-ink/75">First, who sat in a session. Then, what they did afterwards.</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 pb-4 pt-8 md:px-8">
        {!data && <p className="text-ink/60">Loading…</p>}
        {data && (
          <>
            <p className="eyebrow">Who we reached</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {reach.fields.map(([key, label], i) => (
                <div key={key} className={`panel-block px-6 py-6 ${i === 0 ? 'bg-saffron' : 'bg-white'}`}>
                  <Icon name={key} light={i === 0} />
                  <p className="mt-5 font-display text-5xl font-extrabold leading-none text-navy">{formatImpact(reach.key, key, data[reach.key]?.[key])}</p>
                  <p className="mt-3 text-base font-bold text-navy">{label}</p>
                </div>
              ))}
            </div>
            <p className="eyebrow mt-14">What people did next</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {steps.map(group => (
                <article key={group.key} className="panel-block flex flex-col p-6">
                  <div className="flex items-start gap-4">
                    <Icon name={group.key} />
                    <div>
                      <h2 className="text-2xl">{group.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-ink/70">{group.blurb}</p>
                    </div>
                  </div>
                  <ul className="mt-5 border-t-2 border-navy/10">
                    {group.fields.map(([key, label]) => (
                      <li key={key} className="flex items-center justify-between gap-4 border-b-2 border-navy/10 py-3 last:border-b-0">
                        <span className="text-sm font-semibold leading-5 text-ink">{label}</span>
                        <span className="font-display text-3xl font-extrabold leading-none text-navy">{formatImpact(group.key, key, data[group.key]?.[key])}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
      <CallToAction title="Help move these numbers." copy="Run a session, or help a teenager take the next step.">
        <Link to="/contribute" className="btn-primary w-full">Get involved <ArrowRight size={16} /></Link>
      </CallToAction>
    </>
  )
}
