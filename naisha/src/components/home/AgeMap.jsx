import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { AGES, guideAnchor } from '../../data/ages'

export function AgeLinks(){
  return <div className="mt-5 border-t-2 border-navy/15 pt-4">
    <p className="text-xs font-bold uppercase tracking-[.14em] text-ink/60">Browse by age</p>
    <div className="mt-3 flex flex-wrap gap-2">{AGES.map(a=><Link key={a.age} to={`/learn#age-${a.age}`} className="chip bg-white text-navy hover:bg-saffron">{a.age}</Link>)}</div>
  </div>
}

export function AgeBrowser({age,onChange}){
  const current=AGES.find(a=>a.age===age)||AGES.find(a=>a.age===18)
  return <div id="age-map" className="scroll-mt-24">
    <p className="eyebrow">Browse by age</p>
    <h2 className="mt-2 text-4xl leading-tight">What changes, and when.</h2>
    <p className="mt-3 max-w-2xl leading-7 text-ink/75">Pick an age. Each line is something a guide on this site already covers, and it links straight to that guide.</p>
    <div className="mt-6 flex flex-wrap gap-2">{AGES.map(a=><a key={a.age} id={`age-${a.age}`} href={`#age-${a.age}`} onClick={()=>onChange(a.age)} className={`chip scroll-mt-28 ${a.age===current.age?'bg-navy text-white':'bg-white text-navy hover:bg-saffron'}`}>{a.age}</a>)}</div>
    <div className="panel-block mt-6 p-6 md:p-8">
      <p className="font-display text-5xl font-extrabold text-navy">{current.age}</p>
      <p className="mt-3 max-w-2xl text-lg leading-7">{current.line}</p>
      <ul className="mt-6 grid gap-3">{current.items.map(item=>{
        const guide=item.file?`#${guideAnchor(item.file)}`:''
        return <li key={item.text} className="rounded-md border-2 border-navy/15 p-4">
          <p className="leading-6 text-ink/85">{item.text}</p>
          <div className="mt-3 flex flex-wrap gap-4">
            {guide&&<a href={guide} className="inline-flex items-center gap-1 text-sm font-bold text-signal">Open the guide <ArrowRight size={14}/></a>}
            {item.to&&<Link to={item.to} className="inline-flex items-center gap-1 text-sm font-bold text-navy">{item.file?'Read the lesson':'Open the page'} <ArrowRight size={14}/></Link>}
          </div>
        </li>
      })}</ul>
    </div>
  </div>
}
