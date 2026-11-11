import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Users, School, MapPin, Vote, GraduationCap, FileSearch, ShieldCheck, Landmark } from 'lucide-react'
import { CallToAction } from '../common/UI'
import { Breadcrumb } from '../layout/Shell'
import { api } from '../../lib/api'
import { IMPACT_GROUPS, formatImpact } from '../../data/impact'

const ICONS = {
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
  const [error, setError] = useState('')
  useEffect(() => {
    let alive = true
    api.impact().then(d => { if (alive) setData(d) }).catch(err => { if (alive) setError(err.message) })
    return () => { alive = false }
  }, [])
  const [reach, ...rest] = IMPACT_GROUPS
  return (
    <>
      <section className="bg-paper">
        <Breadcrumb trail={['Impact']} />
        <div className="mx-auto max-w-6xl px-5 pb-2 pt-3 md:px-8">
          <p className="tag">Impact</p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-[1.05] md:text-6xl">The difference so far.</h1>
          <p className="mt-4 max-w-xl text-lg leading-7 text-ink/75">Teenagers reached, forms filed, and the steps people took after a session.</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 pb-4 pt-8 md:px-8">
        {error && <p className="font-bold text-coral">{error}</p>}
        {!data && !error && <p className="text-ink/60">Loading…</p>}
        {data && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              {reach.fields.map(([key, label], i) => (
                <div key={key} className={`panel-block flex items-center gap-4 px-5 py-5 ${i === 0 ? 'bg-saffron' : 'bg-white'}`}>
                  <Icon name={key} light={i === 0} />
                  <div>
                    <p className="font-display text-5xl font-extrabold leading-none text-navy">{formatImpact(reach.key, key, data[reach.key]?.[key])}</p>
                    <p className="mt-1 text-sm font-bold text-navy">{label}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {rest.map(group => (
                <article key={group.key} className="panel-block flex h-full flex-col p-5">
                  <div className="flex items-start gap-4">
                    <Icon name={group.key} />
                    <div>
                      <h2 className="text-2xl">{group.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-ink/70">{group.blurb}</p>
                    </div>
                  </div>
                  <dl className={`mt-5 grid gap-3 border-t-2 border-navy/10 pt-4 ${group.fields.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    {group.fields.map(([key, label]) => (
                      <div key={key}>
                        <dd className="font-display text-3xl font-extrabold leading-none text-navy">{formatImpact(group.key, key, data[group.key]?.[key])}</dd>
                        <dt className="mt-2 text-xs font-semibold leading-4 text-ink/60">{label}</dt>
                      </div>
                    ))}
                  </dl>
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
