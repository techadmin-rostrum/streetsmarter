import { Search, ArrowRight, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { Breadcrumb } from '../layout/Shell'
export function SearchBar({placeholder='Search the portal',value,onChange}){return <label className="relative block max-w-xl"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/50" size={18}/><input value={value} onChange={e=>onChange&&onChange(e.target.value)} className="input pl-11" placeholder={placeholder}/></label>}

export function Select({ value, onChange, options, placeholder = 'Choose', name, className = '' }) {
  const items = options.map(option => typeof option === 'string' ? { value: option, label: option } : option)
  const [open, setOpen] = useState(false)
  const [internal, setInternal] = useState(value ?? '')
  const current = value !== undefined ? value : internal
  const root = useRef(null)
  const label = items.find(item => item.value === current)?.label || ''
  useEffect(() => {
    if (!open) return
    function onDoc(e) { if (root.current && !root.current.contains(e.target)) setOpen(false) }
    function onKey(e) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [open])
  function choose(next) {
    if (value === undefined) setInternal(next)
    onChange && onChange(next)
    setOpen(false)
  }
  return (
    <div ref={root} className={`relative ${className}`}>
      {name && <input type="hidden" name={name} value={current} />}
      <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(o => !o)} className={`input flex items-center justify-between gap-3 text-left font-semibold ${open ? 'ring-2 ring-saffron' : ''} ${label ? '' : 'text-ink/45'}`}>
        <span className="truncate">{label || placeholder}</span>
        <ChevronDown size={18} className={`shrink-0 text-navy transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul role="listbox" className="absolute z-30 mt-2 max-h-80 w-full overflow-auto rounded-md border-2 border-navy bg-white py-1 shadow-[3px_3px_0_0_#0A1B3F]">
          {items.map(item => {
            const selected = item.value === current
            return (
              <li key={item.value}>
                <button type="button" role="option" aria-selected={selected} onClick={() => choose(item.value)} className={`block w-full px-4 py-3 text-left text-sm font-bold ${selected ? 'bg-navy text-white' : 'text-navy hover:bg-saffron'}`}>{item.label}</button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
export function TagFilter({tags,active,onChange}){const [internal,setInternal]=useState(tags[0]);const current=active!==undefined?active:internal;const set=onChange||setInternal;return <div className="flex flex-wrap gap-2">{tags.map(t=><button type="button" onClick={()=>set(t)} className={`chip ${current===t?'bg-navy text-white':'bg-white text-navy hover:bg-saffron'}`} key={t}>{t}</button>)}</div>}
export function SectionHead({eyebrow,title,copy,action,actionHref}){return <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div>{eyebrow&&<p className="eyebrow">{eyebrow}</p>}<h2 className="mt-2 text-4xl leading-[1.05] md:text-5xl">{title}</h2>{copy&&<p className="mt-4 max-w-xl leading-7 text-ink/75">{copy}</p>}</div>{action&&(actionHref?<Link to={actionHref} className="btn-outline self-start md:self-auto">{action}<ArrowRight size={16}/></Link>:<button className="btn-outline self-start md:self-auto">{action}<ArrowRight size={16}/></button>)}</div>}
export function FAQAccordion({items}){const [active,setActive]=useState(0);return <div className="panel divide-y-2 divide-navy/10">{items.map((x,i)=><div key={x.q} className="px-6"><button type="button" onClick={()=>setActive(active===i?-1:i)} className="flex w-full items-center justify-between gap-4 py-5 text-left font-display text-lg font-bold text-navy">{x.q}<ChevronDown className={active===i?'shrink-0 rotate-180 transition':'shrink-0 transition'}/></button>{active===i&&<p className="max-w-2xl pb-5 leading-7 text-ink/75">{x.a}</p>}</div>)}</div>}
export function PageHero({tag,title,copy,children,crumbs,aside}){return <section className="border-b-2 border-navy bg-paper"><Breadcrumb trail={crumbs}/><div className={`mx-auto grid max-w-6xl gap-10 px-5 pb-14 pt-8 md:px-8 md:pb-16 ${aside?'lg:grid-cols-[1.15fr_.85fr] lg:items-center':''}`}><div>{tag&&<p className="tag">{tag}</p>}<h1 className="mt-5 max-w-3xl text-5xl leading-[1.02] md:text-6xl">{title}</h1>{copy&&<p className="mt-5 max-w-xl text-lg leading-8 text-ink/80">{copy}</p>}{children&&<div className="mt-7">{children}</div>}</div>{aside&&<div>{aside}</div>}</div></section>}
export function LangToggle({lang,onChange}){return <div className="flex gap-2" role="group" aria-label="Language">{[['en','English'],['hi','हिंदी']].map(([key,label])=><button key={key} type="button" aria-pressed={lang===key} onClick={()=>onChange(key)} className={`chip !px-4 !py-2 text-sm ${lang===key?'bg-navy text-white':'bg-white text-navy hover:bg-saffron'}`}>{label}</button>)}</div>}
export function Band({words,copy}){return <section className="bg-navy text-white"><div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8"><p className="flex flex-wrap gap-x-10 gap-y-2 font-display text-4xl font-extrabold tracking-tight">{words.map(w=><span key={w}>{w}<span className="text-saffron">.</span></span>)}</p>{copy&&<p className="max-w-sm text-white/80">{copy}</p>}</div></section>}
export function Note({children}){return <p className="rounded-lg border-2 border-dashed border-navy/35 bg-white px-5 py-4 text-sm leading-6 text-ink/80">{children}</p>}
export function EmptyState({children}){return <div className="grid place-items-center rounded-lg border-2 border-dashed border-navy/30 bg-white p-10 text-center text-ink/60">{children}</div>}
export function PhotoPanel({src,alt}){return <div className="panel-block overflow-hidden"><img src={src} alt={alt} className="aspect-[4/3] w-full object-cover object-top"/></div>}
export function CallToAction({title,copy,children}){return <section className="section !pt-0"><div className="panel-block grid gap-8 bg-saffron p-8 md:grid-cols-[1.2fr_.8fr] md:items-center md:p-10"><div><h2 className="text-4xl leading-[1.05] md:text-5xl">{title}</h2>{copy&&<p className="mt-4 max-w-lg leading-7 text-navy">{copy}</p>}</div><div className="flex flex-col gap-3">{children}</div></div></section>}
