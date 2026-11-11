import { useState, useMemo, useEffect } from 'react'
import { Link, useParams, useSearchParams, useLocation } from 'react-router-dom'
import { ArrowRight, CheckCircle2, RotateCcw, RefreshCw, Radio, Mail } from 'lucide-react'
import { ResourceCard, ArticleCard, EventCard, OpportunityCard, DownloadCard } from '../components/cards/Cards'
import { SearchBar, TagFilter, SectionHead, FAQAccordion, PageHero, Band, Note, EmptyState, PhotoPanel, CallToAction, LangToggle, Select } from '../components/common/UI'
import { useLang, useLessonOverrides, localiseLesson } from '../lib/lang'
import { lessonsHi, pageHi } from '../data/lessonsHi'
import { HeroSection, HomeSections, PillarGrid } from '../components/home/HomeSections'
import { NewsletterSignup } from '../components/newsletter/NewsletterSignup'
import { AdminSidebar, ItemRow, ImageField, ImageCell, ImpactEditor, SettingsEditor, ApplicationsList, OppHindiEditor, PostHindiEditor, LessonTranslations } from '../components/admin/AdminParts'
import { ImpactView } from '../components/impact/ImpactView'
import { ApplySection } from '../components/apply/ApplySection'
export { ImpactView as Impact }
import { Breadcrumb, InstagramIcon } from '../components/layout/Shell'
import { api } from '../lib/api'
import { resources, faqs, downloadGroups, quizQuestions, pillarSlug, learnCopy } from '../data/content'

function LiveFeed({category,title,items:given,flush=true,query=''}){
  const owned=given===undefined
  const [fetched,setFetched]=useState(null)
  useEffect(()=>{if(!owned)return;let alive=true;api.publicItems(category).then(d=>{if(alive)setFetched(d)}).catch(()=>{if(alive)setFetched([])});return()=>{alive=false}},[category,owned])
  const items=owned?fetched:given
  const visible=(items||[]).filter(it=>textMatch(query,it.title,it.summary,it.sourceLabel))
  if(!items||visible.length===0)return null
  return <section className={flush?'section pt-0':'section'}><SectionHead eyebrow="Updated automatically" title={title}/><div className="grid gap-5 md:grid-cols-2">{visible.map(it=><a key={it.id} href={it.link} target="_blank" rel="noopener noreferrer" className="card p-6"><p className="eyebrow flex items-center gap-1.5"><Radio size={12}/> {it.sourceLabel}</p><h3 className="mt-3 text-xl leading-snug">{it.title}</h3><p className="mt-2 text-sm leading-6 text-ink/75">{it.summary}</p></a>)}</div></section>
}

function formatEventDate(iso){try{return new Date(iso+'T00:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short'}).toUpperCase()}catch{return iso}}

function localPost(post, lang){
  if(!post||lang!=='hi')return post
  const body=Array.isArray(post.bodyHi)&&post.bodyHi.length?post.bodyHi:post.body
  return {...post,tag:post.tagHi||post.tag,title:post.titleHi||post.title,excerpt:post.excerptHi||post.excerpt,body}
}

function textMatch(query,...fields){
  const q=(query||'').trim().toLowerCase()
  if(!q)return true
  return fields.some(f=>{
    if(!f)return false
    const lower=String(f).toLowerCase()
    const words=lower.split(/[^a-z0-9\u0900-\u097F]+/).filter(Boolean)
    if(q.length<=3)return words.some(w=>w===q||w.startsWith(q))
    return lower.includes(q)||words.some(w=>w.startsWith(q))
  })
}

const Loading=()=><p className="text-ink/60">Loading…</p>

export function Home(){return <><HeroSection/><HomeSections/></>}

export function About(){return <><PageHero tag="Why we exist" title="Nobody taught us how to be citizens." copy="They taught us history, trigonometry and the periodic table — but never how to register to vote, what your rights are if something goes wrong online, or which government scholarships you've been eligible for since Class 9" crumbs={['About']} aside={<PhotoPanel src="/images/civic-pride-flag.jpg" alt="Young Indians celebrating with the national flag"/>}><div className="flex flex-wrap gap-3"><Link to="/learn" className="btn-accent">Explore the guides <ArrowRight size={16}/></Link><Link to="/team" className="btn-outline">Meet the team</Link></div></PageHero>
  <Band words={['Free','Peer-led','Plain words']} copy="So we decided to change that."/>
  <section className="section grid gap-10 lg:grid-cols-[.8fr_1.2fr]"><div><p className="eyebrow">What we do</p><h2 className="mt-2 text-4xl leading-[1.05] md:text-5xl">Free sessions and plain-English guides.</h2></div><p className="text-lg leading-8 text-ink/80">StreetSmarter runs free sessions and publishes plain-English guides on everything civic life throws at you before you feel ready for it. Every guide is written by young people, for young people, and is free to download and share.</p></section>
  <section className="section pt-0"><SectionHead eyebrow="The four pillars" title="What we cover" copy="Every guide and session sits under one of these."/><PillarGrid/></section>
  <CallToAction title="Want to help build it?" copy="Train a session, volunteer your skills, or bring StreetSmarter to your school."><Link to="/contribute" className="btn-primary w-full">Get involved <ArrowRight size={16}/></Link><Link to="/contact" className="btn-outline w-full">Contact us</Link></CallToAction></>}

const TEAM=[
  {name:'Naisha Gupta',role:'Founder & Student · StreetSmarter',photo:'/founder-naisha.jpg',bio:"Hi, I'm Naisha, a 16 year old from Delhi. I am an avid debater and fencer. Over the years, I have noticed that there isn't much awareness about basic things teens have to do when they turn 18 — like registering to vote or staying safe online. That's why I'm starting StreetSmarter: to improve civic literacy and help more people my age turn into responsible adults."},
]
export function Team(){return <><PageHero tag="Who's behind this" title="Meet the team." copy="StreetSmarter is peer-led — built by young people who ran into these same gaps themselves. We'll keep adding to this page as the team grows" crumbs={['Our Team']}/><section className="section space-y-16">{TEAM.map(m=><div key={m.name} className="grid gap-10 md:grid-cols-[260px_1fr] md:items-start"><div className="panel-block mx-auto aspect-[3/4] w-52 overflow-hidden md:mx-0 md:w-full"><img src={m.photo} alt={m.name} className="h-full w-full object-cover object-top"/></div><div><p className="eyebrow">Founder</p><p className="mt-2 font-display text-4xl font-extrabold text-navy">{m.name}</p><p className="mt-1 text-sm font-semibold text-ink/70">{m.role}</p><div className="panel mt-6 border-l-[6px] p-6"><p className="text-lg leading-8 text-ink/85">{m.bio}</p></div></div></div>)}</section><CallToAction title="Join the team." copy="We're looking for trainers and volunteers in schools across India."><Link to="/contribute" className="btn-primary w-full">See how to help <ArrowRight size={16}/></Link></CallToAction></>}

export function Learning(){
  const [lang,setLang]=useLang()
  const overrides=useLessonOverrides()
  const t=pageHi.blog[lang]
  const lessons=resources.map(r=>localiseLesson(r,lang,overrides))
  const topics=['all',...Array.from(new Set(lessons.map(r=>r.topic)))]
  const [tag,setTag]=useState('all')
  const [q,setQ]=useState('')
  useEffect(()=>setTag('all'),[lang])
  const filtered=lessons.filter(r=>(tag==='all'||r.topic===tag)&&textMatch(q,r.title,r.topic,(r.body||[]).join(' ')))
  return <><PageHero tag={t.tag} title={t.title} copy={t.copy} crumbs={['Blog']} aside={<div className="panel-block p-6"><p className="eyebrow !text-ink/60">{t.tag}</p><p className="mt-2 font-display text-6xl font-extrabold text-navy">{resources.length}</p><p className="mt-1 font-semibold text-navy">{t.count}</p><p className="mt-4 border-t-2 border-navy/10 pt-4 text-sm text-ink/75">{t.side} <Link to="/learn" className="font-bold text-signal">{t.sideLink}</Link></p></div>}><LangToggle lang={lang} onChange={setLang}/><div className="mt-5"><SearchBar value={q} onChange={setQ} placeholder={t.search}/></div></PageHero><section className="section"><TagFilter tags={topics.map(x=>x==='all'?t.all:x)} active={tag==='all'?t.all:tag} onChange={x=>setTag(x===t.all?'all':x)}/><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.length?filtered.map(r=><ResourceCard key={r.slug} slug={r.slug} title={r.title} topic={r.topic} time={lang==='hi'?r.time.replace('min','मिनट'):r.time} readLabel={t.read}/>):<EmptyState>{t.empty}</EmptyState>}</div></section></>
}

function ArticleLayout({crumbs,eyebrow,title,meta,body,back,backLabel,aside,toolbar,notice}){return <><section className="border-b-2 border-navy bg-paper"><Breadcrumb trail={crumbs}/><div className="mx-auto max-w-6xl px-5 pb-12 pt-8 md:px-8">{toolbar&&<div className="mb-6">{toolbar}</div>}<p className="tag">{eyebrow}</p><h1 className="mt-5 max-w-4xl text-4xl leading-[1.05] md:text-6xl">{title}</h1>{meta&&<p className="mt-4 text-sm font-semibold text-ink/65">{meta}</p>}</div></section><div className="section grid gap-12 lg:grid-cols-[1fr_300px]"><article className="max-w-2xl space-y-5 text-lg leading-8 text-ink/85">{notice&&<Note>{notice}</Note>}{body.map((p,i)=><p key={i}>{p}</p>)}<Link to={back} className="btn-primary !mt-10">{backLabel} <ArrowRight size={16}/></Link></article><aside className="space-y-5">{aside}</aside></div></>}
const NotFound=({crumbs,title,copy,back,backLabel})=><><Breadcrumb trail={crumbs}/><section className="section max-w-2xl"><h1 className="text-5xl">{title}</h1><p className="mt-4 text-ink/75">{copy}</p><Link to={back} className="btn-primary mt-6">{backLabel} <ArrowRight size={16}/></Link></section></>
const QuizAside=()=><div className="panel-block bg-saffron p-6"><p className="font-display text-2xl font-extrabold text-navy">Think you know this?</p><p className="mt-2 text-sm leading-6 text-navy">Ten questions. Every answer explains the real rule.</p><Link to="/quiz" className="btn-primary mt-5 w-full">Take the Quiz</Link></div>

export function LessonDetail(){
  const {slug}=useParams()
  const [lang,setLang]=useLang()
  const overrides=useLessonOverrides()
  const t=pageHi.lesson[lang]
  const base=resources.find(r=>r.slug===slug)
  if(!base)return <NotFound crumbs={['Blog','Not found']} title="Lesson not found" copy="That guide may have moved or been renamed." back="/blog" backLabel="Back to Blog"/>
  const lesson=localiseLesson(base,lang,overrides)
  const more=resources.filter(r=>r.slug!==slug).slice(0,3).map(r=>localiseLesson(r,lang,overrides))
  return <ArticleLayout crumbs={['Blog',lesson.title]} toolbar={<LangToggle lang={lang} onChange={setLang}/>} notice={lang==='hi'&&!lesson.reviewed?t.review:''} eyebrow={lesson.topic} title={lesson.title} meta={lang==='hi'?`${pageHi.blog.hi.read}: ${lesson.time.replace('min','मिनट')}`:`${lesson.time} read`} body={lesson.body} back="/blog" backLabel={t.back} aside={<><QuizAside/><div className="panel p-6"><p className="eyebrow">{t.next}</p>{more.map(r=><Link key={r.slug} to={`/blog/${r.slug}`} className="mt-4 block border-t-2 border-navy/10 pt-4 font-display text-lg font-bold leading-snug text-navy hover:text-signal">{r.title}</Link>)}</div></>}/>
}

const OPP_EN={search:'Search',all:'All opportunities',noMatch:'No matches yet',missing:''}
function localiseOpp(o,lang){
  if(lang!=='hi')return o
  return {...o,title:o.titleHi||o.title,description:o.descriptionHi||o.description,deadline:o.deadlineHi||o.deadline,kind:o.kindHi||o.kind,missingHi:!o.titleHi}
}
function OpportunityGrid({page,emptyMessage,lang='en',copy=OPP_EN,onQuery}){
  const [all,setAll]=useState(null)
  const [tag,setTag]=useState('all')
  const [q,setQ]=useState('')
  useEffect(()=>{let alive=true;api.publicOpportunities(page).then(d=>{if(alive)setAll(d)}).catch(()=>{if(alive)setAll([])});return()=>{alive=false}},[page])
  useEffect(()=>setTag('all'),[lang])
  function change(value){setQ(value);onQuery&&onQuery(value)}
  if(all===null)return <Loading/>
  if(all.length===0)return <EmptyState>{emptyMessage}</EmptyState>
  const items=all.map(o=>localiseOpp(o,lang))
  const kinds=['all',...Array.from(new Set(items.map(a=>a.kind)))]
  const filtered=all.filter(a=>{
    const view=localiseOpp(a,lang)
    return (tag==='all'||view.kind===tag)&&textMatch(q,a.title,a.titleHi,a.org,a.description,a.descriptionHi,a.kind,a.kindHi)
  }).map(a=>localiseOpp(a,lang))
  return <><SearchBar value={q} onChange={change} placeholder={copy.search}/><div className="mt-6"><TagFilter tags={kinds.map(k=>k==='all'?copy.all:k)} active={tag==='all'?copy.all:tag} onChange={k=>setTag(k===copy.all?'all':k)}/></div><div className="mt-8 grid gap-5 md:grid-cols-3">{filtered.length?filtered.map(a=><OpportunityCard key={a.id} title={a.title} org={a.org} description={a.description} deadline={a.deadline} kind={a.kind} link={a.link} image={a.image} note={a.missingHi?copy.missing:''}/>):<p className="text-ink/60">{copy.noMatch}</p>}</div></>
}

export function Schemes(){
  const [lang,setLang]=useLang()
  const [q,setQ]=useState('')
  const t=pageHi.schemes[lang]
  return <><PageHero tag={t.tag} title={t.title} copy={t.copy} crumbs={['Schemes']} aside={<PhotoPanel src="/images/schoolgirls-india.jpg" alt="Indian students on their way to school"/>}><div className="flex flex-wrap items-center gap-4"><LangToggle lang={lang} onChange={setLang}/><Link to="/learn#know-your-schemes" className="btn-outline">{t.guides} <ArrowRight size={16}/></Link></div></PageHero><section className="section"><div className="mb-10"><Note><b className="text-navy">{t.noteBold}</b> {t.note}</Note></div><OpportunityGrid page="schemes" lang={lang} copy={t} emptyMessage={t.empty} onQuery={setQ}/></section><LiveFeed category="schemes" query={q} title={lang==='hi'?'योजनाओं की ताज़ा ख़बरें (अंग्रेज़ी में)':'Live scheme news'}/></>
}

export function Contribute(){return <><PageHero tag="Contribute" title="Find a way to pitch in." copy="Train a session, volunteer your skills, or support the work — and explore internships and roles that build real skills" crumbs={['Contribute']} aside={<PhotoPanel src="/images/students-collaborating.jpg" alt="Students collaborating on a project"/>}><a href="#apply" className="btn-accent">Apply now <ArrowRight size={16}/></a></PageHero><section id="apply" className="section scroll-mt-20"><ApplySection/></section><section className="border-t-2 border-navy bg-white"><div className="section"><SectionHead eyebrow="Open roles" title="Internships and roles" copy="Volunteer roles and internships the team has posted"/><OpportunityGrid page="volunteer" emptyMessage="No roles added yet — check back soon"/></div></section></>}

export function Events(){
  const [data,setData]=useState(null)
  const [tag,setTag]=useState('All events')
  const [q,setQ]=useState('')
  useEffect(()=>{let alive=true;api.publicEvents().then(d=>{if(alive)setData(d)}).catch(()=>{if(alive)setData({upcoming:[],past:[]})});return()=>{alive=false}},[])
  const upcoming=data?.upcoming||[]
  const past=data?.past||[]
  const match=e=>textMatch(q,e.title,e.place,e.type)
  const types=['All events',...Array.from(new Set(upcoming.map(e=>e.type)))]
  const filtered=upcoming.filter(e=>(tag==='All events'||e.type===tag)&&match(e))
  const pastShown=past.filter(match)
  const hasEvents=upcoming.length+past.length>0
  return <><PageHero tag="Events & workshops" title="Learn in the room." copy="Free, youth-friendly sessions where questions are welcome and participation has a practical next step" crumbs={['Events']} aside={<PhotoPanel src="/images/teens-outdoors.jpg" alt="Teenagers together outdoors"/>}>{hasEvents&&<SearchBar value={q} onChange={setQ} placeholder="Search events"/>}</PageHero><section className="section"><SectionHead eyebrow="Coming up" title="Upcoming sessions"/>
    {data===null?<Loading/>:!hasEvents?<EmptyState>No events scheduled right now — check back soon, or ask us to bring a session to you below</EmptyState>:<>{upcoming.length>0&&<TagFilter tags={types} active={tag} onChange={setTag}/>}{filtered.length>0&&<div className="mt-8 grid gap-5 md:grid-cols-2">{filtered.map(e=><EventCard key={e.id} date={formatEventDate(e.date)} title={e.title} place={e.place} type={e.type} image={e.image}/>)}</div>}{filtered.length===0&&pastShown.length===0&&<p className="text-ink/60">No matches yet</p>}{filtered.length===0&&pastShown.length>0&&!q.trim()&&<EmptyState>No events scheduled right now — check back soon, or ask us to bring a session to you below</EmptyState>}</>}
    {pastShown.length>0&&<div className="mt-16"><SectionHead eyebrow="Already happened" title="Past events"/><div className="grid gap-5 md:grid-cols-2">{pastShown.map(e=><EventCard key={e.id} date={formatEventDate(e.date)} title={e.title} place={e.place} type={e.type} image={e.image} past/>)}</div></div>}
  </section><section className="bg-navy text-white"><div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-14 md:flex-row md:items-center md:justify-between md:px-8"><div><h2 className="max-w-xl text-4xl leading-[1.05] md:text-5xl">Want StreetSmarter at your school or colony?</h2><p className="mt-4 text-white/75">We run free sessions for schools, colleges and community groups anywhere in India</p></div><Link to="/contact?topic=Booking" className="btn-accent shrink-0 self-start md:self-auto">Book a session <ArrowRight size={16}/></Link></div></section></>
}

export function Updates(){
  const [lang,setLang]=useLang()
  const [posts,setPosts]=useState(null)
  const [live,setLive]=useState(null)
  const [tag,setTag]=useState('Latest')
  const [q,setQ]=useState('')
  useEffect(()=>{let alive=true;api.publicPosts().then(d=>{if(alive)setPosts(d)}).catch(()=>{if(alive)setPosts([])});api.publicItems('updates').then(d=>{if(alive)setLive(d)}).catch(()=>{if(alive)setLive([])});return()=>{alive=false}},[])
  const tags=useMemo(()=>['Latest',...Array.from(new Set((posts||[]).map(p=>localPost(p,lang).tag)))],[posts,lang])
  const activeTag=tags.includes(tag)?tag:'Latest'
  const featured=posts&&posts.length?(posts.find(p=>p.featured)||posts[0]):null
  const lead=featured&&localPost(featured,lang)
  const rest=posts&&featured?posts.filter(p=>p.id!==featured.id):[]
  const postMatch=p=>textMatch(q,p.title,p.titleHi,p.excerpt,p.excerptHi,p.tag,p.tagHi,(p.body||[]).join(' '),(p.bodyHi||[]).join(' '))
  const featuredMatch=featured&&postMatch(featured)
  const filtered=rest.filter(p=>{const view=localPost(p,lang);return (activeTag==='Latest'||view.tag===activeTag)&&postMatch(p)}).map(p=>localPost(p,lang))
  const liveShown=(live||[]).filter(it=>textMatch(q,it.title,it.summary,it.sourceLabel))
  const ready=posts!==null&&live!==null
  const nothing=ready&&posts.length===0&&live.length===0
  const noMatches=ready&&q.trim()&&!featuredMatch&&filtered.length===0&&liveShown.length===0&&!nothing
  return <><PageHero tag="The Citizen Edit · Weekly civic digest" title="Public life, made legible." copy="The stories, systems and small signals shaping India — explained clearly for young citizens" crumbs={['Updates']}><div className="flex flex-col gap-5"><LangToggle lang={lang} onChange={setLang}/><SearchBar value={q} onChange={setQ} placeholder={lang==='hi'?'अपडेट खोजें':'Search updates'}/></div></PageHero>
  {(!ready||nothing||(posts.length>0&&(!q.trim()||featuredMatch)))&&<section className="section pb-8">{!ready?<Loading/>:nothing?<EmptyState>No updates published yet — check back soon</EmptyState>:<><TagFilter tags={tags} active={activeTag} onChange={setTag}/><div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_.8fr]"><article className="panel-block p-7 md:p-10"><p className="eyebrow">{lead.tag} · {lead.date}</p><h2 className="mt-4 max-w-2xl text-4xl leading-tight md:text-5xl">{lead.title}</h2><p className="mt-5 max-w-xl leading-7 text-ink/80">{lead.excerpt}</p><div className="mt-8 border-t-2 border-navy/10 pt-5"><Link to={`/updates/${lead.slug}`} className="btn-primary">{lang==='hi'?'कहानी पढ़ें':'Read story'} <ArrowRight size={16}/></Link></div></article><aside className="panel bg-saffron p-7"><p className="text-xs font-bold uppercase tracking-[.14em] text-navy">Why this matters</p><h3 className="mt-5 text-3xl">Your decisions live beyond election day</h3><p className="mt-4 leading-7 text-navy">Knowing how a representative is chosen helps you ask better questions of the people who make decisions in your name</p></aside></div></>}</section>}
  {filtered.length>0&&<section className="section grid gap-10 pt-0 lg:grid-cols-[1.2fr_.8fr]"><div><SectionHead eyebrow="Latest dispatches" title="In the conversation"/>{filtered.map(p=><ArticleCard key={p.slug} slug={p.slug} tag={p.tag} title={p.title} excerpt={p.excerpt} time={p.date} image={p.image}/>)}</div><aside><div className="panel p-6"><p className="eyebrow">Trending civic topics</p><div className="mt-5 flex flex-wrap gap-2">{['Voter registration','Public spaces','Digital rights','Climate action','Education policy'].map(x=><span key={x} className="chip bg-paper text-navy">#{x}</span>)}</div></div></aside></section>}
  {noMatches&&<section className="section pt-0"><p className="text-ink/60">No matches yet</p></section>}
  <LiveFeed title="Live from around the web" items={ready?liveShown:[]} flush={!!(posts&&posts.length>0)}/><section className="section pt-0"><NewsletterSignup/></section></>
}

export function UpdateDetail(){
  const {slug}=useParams()
  const [lang,setLang]=useLang()
  const [post,setPost]=useState(null)
  const [notFound,setNotFound]=useState(false)
  useEffect(()=>{let alive=true;api.publicPosts().then(list=>{if(!alive)return;const p=list.find(p=>p.slug===slug);p?setPost(p):setNotFound(true)}).catch(()=>{if(alive)setNotFound(true)});return()=>{alive=false}},[slug])
  if(notFound)return <NotFound crumbs={['Updates','Not found']} title="Post not found" copy="That update may have moved or been removed." back="/updates" backLabel="Back to Updates"/>
  if(!post)return <div className="section"><Loading/></div>
  const view=localPost(post,lang)
  return <ArticleLayout crumbs={['Updates',view.title]} toolbar={<LangToggle lang={lang} onChange={setLang}/>} eyebrow={view.tag} title={view.title} meta={post.date} body={view.body} back="/updates" backLabel={lang==='hi'?'अपडेट पर वापस':'Back to Updates'} aside={<QuizAside/>}/>
}

export function Downloads(){
  const {hash}=useLocation()
  const [lang,choose]=useLang()
  const copy=learnCopy[lang]
  useEffect(()=>{
    if(!hash)return
    const t=setTimeout(()=>{
      const el=document.getElementById(hash.slice(1))
      if(el)el.scrollIntoView({behavior:'smooth',block:'start'})
    },50)
    return()=>clearTimeout(t)
  },[hash])
  const [q,setQ]=useState('')
  const langToggle=<LangToggle lang={lang} onChange={choose}/>
  const groups=downloadGroups.map(g=>({...g,items:g.items.filter(item=>textMatch(q,item.title,item.titleHi,item.description,item.descriptionHi,g.pillar,g.pillarHi))})).filter(g=>g.items.length)
  return <><PageHero tag={copy.eyebrow} title={copy.title} copy={copy.copy} crumbs={['Learn']} aside={<div className="panel-block p-6"><p className="eyebrow !text-ink/60">{copy.pillar}</p><div className="mt-4 grid gap-2">{downloadGroups.map((g,i)=><a key={g.pillar} href={`#${pillarSlug(g.pillar)}`} className="flex items-center justify-between gap-3 rounded-md border-2 border-navy/15 px-4 py-3 font-bold text-navy transition hover:border-navy hover:bg-paper"><span><span className="mr-3 text-signal">{String(i+1).padStart(2,'0')}</span>{lang==='hi'?g.pillarHi:g.pillar}</span><span className="text-xs text-ink/60">{g.items.length}</span></a>)}</div></div>}><div className="flex flex-col gap-5">{langToggle}<SearchBar value={q} onChange={setQ} placeholder={lang==='hi'?'गाइड खोजें':'Search guides'}/></div></PageHero>
  <section className="section"><div className="mb-12"><Note>{copy.banner}</Note></div>{groups.length===0?<EmptyState>{lang==='hi'?'कोई मिलान नहीं मिला':'No guides match your search yet'}</EmptyState>:<div className="space-y-16">{groups.map((g,i)=>{const title=lang==='hi'?g.pillarHi:g.pillar;return <div key={g.pillar} id={pillarSlug(g.pillar)} className="scroll-mt-24"><div className="mb-8 flex items-end gap-5 border-b-2 border-navy pb-5"><p className="num">{String(i+1).padStart(2,'0')}</p><div><p className="eyebrow">{copy.pillar}</p><h2 className="mt-1 text-3xl md:text-4xl">{title}</h2></div></div><div className="grid gap-5 md:grid-cols-2">{g.items.map(item=>{const hindiFile=lang==='hi'&&item.fileHi;return <DownloadCard key={item.title} title={lang==='hi'?item.titleHi:item.title} description={lang==='hi'?item.descriptionHi:item.description} lang={hindiFile?'हिंदी':'English'} format={item.format} file={hindiFile?item.fileHi:item.file} note={lang==='hi'&&!item.fileHi?copy.fileNote:''}/>})}</div></div>})}</div>}</section></>
}

export function FAQ(){
  const [q,setQ]=useState('')
  const shown=faqs.filter(f=>textMatch(q,f.q,f.a))
  return <><PageHero tag="Frequently asked" title="Questions are where it begins." copy="A few useful answers about the portal, opportunities and getting involved" crumbs={['FAQ']}><SearchBar value={q} onChange={setQ} placeholder="Search questions"/></PageHero><section className="section grid gap-10 lg:grid-cols-[1fr_300px]">{shown.length?<FAQAccordion items={shown}/>:<EmptyState>No matches yet</EmptyState>}<aside className="panel-block h-fit bg-saffron p-6"><p className="font-display text-2xl font-extrabold text-navy">Still stuck?</p><p className="mt-2 text-sm leading-6 text-navy">Write to us and a real person will answer.</p><Link to="/contact" className="btn-primary mt-5 w-full">Contact us</Link></aside></section></>
}

export function SearchResults(){
  const [lang]=useLang()
  const [params,setParams]=useSearchParams()
  const q=params.get('q')||''
  const setQ=value=>{const next=new URLSearchParams(params);if(value)next.set('q',value);else next.delete('q');setParams(next,{replace:true})}
  const [posts,setPosts]=useState([])
  const [opportunities,setOpportunities]=useState([])
  const [events,setEvents]=useState([])
  const [news,setNews]=useState([])
  useEffect(()=>{
    api.publicPosts().then(setPosts).catch(()=>setPosts([]))
    api.publicOpportunities().then(setOpportunities).catch(()=>setOpportunities([]))
    api.publicEvents().then(d=>setEvents([...(d.upcoming||[]),...(d.past||[])])).catch(()=>setEvents([]))
    api.publicItems().then(setNews).catch(()=>setNews([]))
  },[])
  const query=q.trim()
  const lessonResults=query?resources.filter(r=>{const hi=lessonsHi[r.slug];return textMatch(query,r.title,r.topic,(r.body||[]).join(' '),hi?.title,hi?.topic,(hi?.body||[]).join(' '))}):[]
  const learnResults=query?downloadGroups.flatMap(g=>g.items.filter(item=>textMatch(query,item.title,item.titleHi,item.description,item.descriptionHi,g.pillar,g.pillarHi)).map(item=>({...item,pillar:g.pillar,anchor:pillarSlug(g.pillar)}))):[]
  const postResults=query?posts.filter(p=>textMatch(query,p.title,p.titleHi,p.excerpt,p.excerptHi,p.tag,p.tagHi,(p.body||[]).join(' '),(p.bodyHi||[]).join(' '))).map(p=>localPost(p,lang)):[]
  const oppResults=query?opportunities.filter(o=>textMatch(query,o.title,o.titleHi,o.org,o.description,o.descriptionHi,o.kind,o.kindHi)):[]
  const eventResults=query?events.filter(e=>textMatch(query,e.title,e.place,e.type)):[]
  const newsResults=query?news.filter(it=>textMatch(query,it.title,it.summary,it.sourceLabel)):[]
  const faqResults=query?faqs.filter(f=>textMatch(query,f.q,f.a)):[]
  const total=lessonResults.length+learnResults.length+postResults.length+oppResults.length+eventResults.length+newsResults.length+faqResults.length
  return <><PageHero tag="Search StreetSmarter" title="Find your way around civic life." copy="Search lessons, guides, schemes, updates and events — all focused on Indian rights, institutions and public life" crumbs={['Search']}><SearchBar value={q} onChange={setQ} placeholder="Try 'voter ID', 'scholarship', 'RTI', 'online safety'..."/></PageHero>
  <section className="section">
    {!query?<p className="text-ink/60">Start typing to search across Blog, Learn, Schemes, Contribute, Updates and Events</p>:total===0?<EmptyState>No results for "{q}" — try a different word</EmptyState>:<div className="space-y-14">
      <p className="font-semibold text-navy">{total} result{total===1?'':'s'} for "{query}"</p>
      {lessonResults.length>0&&<div><SectionHead eyebrow="Blog" title="Lessons"/><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{lessonResults.map(r=><ResourceCard key={r.slug} slug={r.slug} title={r.title} topic={r.topic} time={r.time}/>)}</div></div>}
      {learnResults.length>0&&<div><SectionHead eyebrow="Learn" title="Guides"/><div className="grid gap-5 md:grid-cols-2">{learnResults.map(item=><DownloadCard key={item.file} title={item.title} description={item.description} lang={item.lang} format={item.format} file={item.file}/>)}</div></div>}
      {oppResults.length>0&&<div><SectionHead eyebrow="Schemes & contribute" title="Opportunities"/><div className="grid gap-5 md:grid-cols-3">{oppResults.map(o=><OpportunityCard key={o.id} title={o.title} org={o.org} description={o.description} deadline={o.deadline} kind={o.kind} link={o.link} image={o.image}/>)}</div></div>}
      {postResults.length>0&&<div><SectionHead eyebrow="Updates" title="Posts"/>{postResults.map(p=><ArticleCard key={p.slug} slug={p.slug} tag={p.tag} title={p.title} excerpt={p.excerpt} time={p.date} image={p.image}/>)}</div>}
      {newsResults.length>0&&<div><SectionHead eyebrow="Updates" title="From around the web"/><div className="grid gap-5 md:grid-cols-2">{newsResults.map(it=><a key={it.id} href={it.link} target="_blank" rel="noopener noreferrer" className="card p-6"><p className="eyebrow flex items-center gap-1.5"><Radio size={12}/> {it.sourceLabel}</p><h3 className="mt-3 text-xl leading-snug">{it.title}</h3><p className="mt-2 text-sm leading-6 text-ink/75">{it.summary}</p></a>)}</div></div>}
      {eventResults.length>0&&<div><SectionHead eyebrow="Events" title="Sessions"/><div className="grid gap-5 md:grid-cols-2">{eventResults.map(e=><EventCard key={e.id} date={formatEventDate(e.date)} title={e.title} place={e.place} type={e.type} image={e.image}/>)}</div></div>}
      {faqResults.length>0&&<div><SectionHead eyebrow="FAQ" title="Questions"/><FAQAccordion items={faqResults}/></div>}
    </div>}
  </section></>
}

export function Contact(){
  const [params]=useSearchParams()
  const topic=params.get('topic')
  const prefillTitle=params.get('title')
  const [form,setForm]=useState({name:'',email:'',message: topic?`Re: ${topic}${prefillTitle?` — ${prefillTitle}`:''}\n\n`:''})
  const [sent,setSent]=useState(false)
  const [sending,setSending]=useState(false)
  const [error,setError]=useState('')
  async function submit(e){
    e.preventDefault()
    if(!form.name||!form.email||!form.message)return
    setSending(true);setError('')
    try{await api.sendContact(form);setSent(true)}catch(err){setError(err.message)}finally{setSending(false)}
  }
  return <><PageHero tag="Contact" title="Have an idea? Bring it in." copy="Whether you are a student, educator, youth group or potential partner, we would love to hear from you" crumbs={['Contact']}/><section className="section grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-start"><div><h2 className="text-4xl leading-[1.05] md:text-5xl">Start a conversation.</h2><p className="mt-4 leading-7 text-ink/80">Tell us what young people in your community need to understand, challenge or build.</p><div className="mt-8 grid gap-4"><a href="mailto:streetsmarterindia@gmail.com" className="card flex items-center gap-4 p-5"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-md border-2 border-navy bg-saffron text-navy"><Mail size={20}/></span><span><span className="block text-xs font-semibold uppercase tracking-[.14em] text-ink/60">Email</span><span className="block break-all font-bold text-navy">streetsmarterindia@gmail.com</span></span></a><a href="https://www.instagram.com/streetsmarter.in/" target="_blank" rel="noopener noreferrer" className="card flex items-center gap-4 p-5"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-md border-2 border-navy bg-white text-navy"><InstagramIcon width={20} height={20}/></span><span><span className="block text-xs font-semibold uppercase tracking-[.14em] text-ink/60">Instagram</span><span className="block font-bold text-navy">@streetsmarter.in</span></span></a></div></div>{sent?<div className="panel-block p-8"><p className="flex items-center gap-2 font-display text-3xl font-extrabold text-navy"><CheckCircle2 className="text-civic"/> Message sent</p><p className="mt-3 text-ink/75">Thanks — we read every message and will get back to you soon.</p></div>:<form onSubmit={submit} className="panel-block space-y-4 p-6 md:p-8"><p className="font-display text-2xl font-extrabold text-navy">Send us a message</p>{topic&&<p className="chip inline-block bg-paper text-navy">Topic: {topic}{prefillTitle?` — ${prefillTitle}`:''}</p>}<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="input" placeholder="Your name"/><input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="input" placeholder="Email address"/><textarea required value={form.message} onChange={e=>setForm({...form,message:e.target.value})} className="input min-h-36" placeholder="What's on your mind?"/>{error&&<p className="text-sm font-bold text-coral">{error}</p>}<button type="submit" disabled={sending} className="btn-accent">{sending?'Sending…':'Send message'} <ArrowRight size={16}/></button></form>}</section></>
}

export function Quiz(){
  const [i,setI]=useState(0)
  const [score,setScore]=useState(0)
  const [picked,setPicked]=useState(null)
  const [done,setDone]=useState(false)
  const q=quizQuestions[i]
  function choose(idx){
    if(picked!==null)return
    setPicked(idx)
    if(idx===q.correct)setScore(s=>s+1)
  }
  function next(){
    if(i+1<quizQuestions.length){setI(i+1);setPicked(null)}else{setDone(true)}
  }
  function restart(){setI(0);setScore(0);setPicked(null);setDone(false)}
  const progress=((done?quizQuestions.length:i+(picked!==null?1:0))/quizQuestions.length)*100
  return <><PageHero tag="Test yourself" title="Take the Quiz." copy="Ten harder questions on your rights, government schemes, money matters and staying safe" crumbs={['Quiz']}/><section className="section max-w-3xl"><div className="mb-6 h-3 overflow-hidden rounded-full border-2 border-navy bg-white"><div className="h-full bg-saffron transition-all" style={{width:`${progress}%`}}/></div>{done?<div className="panel-block p-8 text-center md:p-12"><p className="eyebrow">Your score</p><p className="mt-3 font-display text-7xl font-extrabold text-navy">{score}/{quizQuestions.length}</p><p className="mt-4 text-ink/80">{score===quizQuestions.length?'Perfect — you know your stuff.':score>=quizQuestions.length/2?'Solid start. A few gaps worth closing.':'This is exactly why StreetSmarter exists — head to Learn to close the gaps.'}</p><div className="mt-7 flex flex-wrap justify-center gap-3"><button onClick={restart} className="btn-primary"><RotateCcw size={16}/> Try again</button><Link to="/learn" className="btn-accent">Explore the guides</Link></div></div>:<div className="panel-block p-6 md:p-10"><p className="eyebrow">Question {i+1} of {quizQuestions.length}</p><h2 className="mt-3 text-2xl leading-snug md:text-3xl">{q.q}</h2><div className="mt-7 grid gap-3">{q.options.map((opt,idx)=>{const isCorrect=picked!==null&&idx===q.correct;const isWrongPick=picked===idx&&idx!==q.correct;return <button key={opt} onClick={()=>choose(idx)} className={`flex items-center gap-3 rounded-md border-2 p-4 text-left font-bold transition ${isCorrect?'border-civic bg-civic/10 text-navy':isWrongPick?'border-coral bg-coral/10 text-navy':'border-navy bg-white text-navy hover:bg-paper'}`}><span className="grid h-7 w-7 shrink-0 place-items-center rounded border-2 border-current text-xs">{String.fromCharCode(65+idx)}</span>{opt}</button>})}</div>{picked!==null&&<div className="mt-6"><div className="rounded-md border-2 border-navy bg-saffron/25 p-5"><p className="font-bold text-navy">{picked===q.correct?'Correct':'Not quite'}</p><p className="mt-1 text-sm leading-6 text-ink/85">{q.explain}</p></div><button onClick={next} className="btn-primary mt-5">{i+1<quizQuestions.length?'Next question':'See results'} <ArrowRight size={16}/></button></div>}</div>}</section></>
}

export function Admin(){
  const [authed,setAuthed]=useState(null)
  const [password,setPassword]=useState('')
  const [loginError,setLoginError]=useState('')
  const [active,setActive]=useState('pending')
  const [items,setItems]=useState([])
  const [sources,setSources]=useState([])
  const [events,setEvents]=useState([])
  const [opportunities,setOpportunities]=useState([])
  const [posts,setPosts]=useState([])
  const [counts,setCounts]=useState({})
  const [newSource,setNewSource]=useState({label:'',url:'',category:'updates'})
  const [newEvent,setNewEvent]=useState({title:'',date:'',place:'',type:'Workshop',image:''})
  const [newOpp,setNewOpp]=useState({page:'schemes',title:'',org:'',link:'',description:'',deadline:'',kind:'Scholarship',image:'',titleHi:'',descriptionHi:'',deadlineHi:'',kindHi:''})
  const [newPost,setNewPost]=useState({tag:'',title:'',excerpt:'',body:'',tagHi:'',titleHi:'',excerptHi:'',bodyHi:'',date:new Date().toISOString().slice(0,10),featured:false,image:''})
  const [busy,setBusy]=useState(false)
  const [stats,setStats]=useState(null)
  const [impact,setImpact]=useState(null)
  const [settings,setSettings]=useState(null)
  const [applications,setApplications]=useState([])

  useEffect(()=>{api.me().then(()=>setAuthed(true)).catch(()=>setAuthed(false))},[])

  async function refreshCounts(){
    const [p,a,r]=await Promise.all([api.items('pending'),api.items('approved'),api.items('rejected')])
    setCounts({pending:p.length,approved:a.length,rejected:r.length})
  }
  async function loadActive(){
    if(active==='sources')setSources(await api.sources())
    else if(active==='events')setEvents(await api.events())
    else if(active==='opportunities')setOpportunities(await api.opportunities())
    else if(active==='posts')setPosts(await api.posts())
    else if(active==='traffic')setStats(await api.stats())
    else if(active==='impact')setImpact(await api.adminImpact())
    else if(active==='settings')setSettings(await api.adminSettings())
    else if(active==='applications')setApplications(await api.applications())
    else setItems(await api.items(active))
  }
  useEffect(()=>{if(authed===true){loadActive();refreshCounts()}},[authed,active])

  async function login(e){e.preventDefault();setLoginError('');try{await api.login(password);setAuthed(true)}catch(err){setLoginError(err.message)}}
  async function logout(){await api.logout();setAuthed(false)}
  async function act(fn){setBusy(true);try{await fn();await loadActive();await refreshCounts()}finally{setBusy(false)}}

  if(authed===null)return <div className="section text-ink/50">Loading…</div>
  if(!authed)return <div className="grid min-h-screen place-items-center bg-paper px-5"><form onSubmit={login} className="w-full max-w-sm panel-block p-8"><p className="eyebrow">Admin</p><h1 className="mt-2 text-3xl">Sign in</h1><input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="input mt-6" placeholder="Admin password" autoFocus/>{loginError&&<p className="mt-2 text-sm font-bold text-coral">{loginError}</p>}<button type="submit" className="btn-accent mt-4 w-full">Sign in</button></form></div>

  return <div className="min-h-screen bg-paper md:flex"><AdminSidebar active={active} setActive={setActive} onLogout={logout} counts={counts}/><main className="flex-1 p-5 md:p-10"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="eyebrow">Content queue</p><h1 className="mt-1 text-4xl capitalize">{active}</h1></div>{['pending','approved','rejected'].includes(active)&&<button type="button" disabled={busy} onClick={()=>act(()=>api.scrapeAll())} className="btn-primary"><RefreshCw size={16}/> Scrape all sources now</button>}</div>

  {active==='sources'&&<div className="mt-8 space-y-6">
    <form onSubmit={e=>{e.preventDefault();act(async()=>{await api.addSource(newSource);setNewSource({label:'',url:'',category:'updates'})})}} className="grid gap-3 panel p-6 lg:grid-cols-[1.2fr_1.4fr_auto_auto]">
      <input required value={newSource.label} onChange={e=>setNewSource({...newSource,label:e.target.value})} className="input" placeholder="Source label"/>
      <input required value={newSource.url} onChange={e=>setNewSource({...newSource,url:e.target.value})} className="input" placeholder="RSS feed URL"/>
      <Select value={newSource.category} onChange={category=>setNewSource({...newSource,category})} options={[{value:'updates',label:'Updates'},{value:'schemes',label:'Schemes'}]} />
      <button type="submit" className="btn-primary">Add source</button>
    </form>
    <div className="panel divide-y-2 divide-navy/10">{sources.length?sources.map(s=><div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div className="min-w-0"><p className="font-bold">{s.label}</p><p className="truncate text-xs text-ink/50">{s.category} · {s.url}</p></div><div className="flex shrink-0 gap-2"><button type="button" disabled={busy} onClick={()=>act(()=>api.scrapeSource(s.id))} className="chip bg-paper text-navy">Scrape now</button><button type="button" disabled={busy} onClick={()=>act(()=>api.deleteSource(s.id))} className="chip border-coral bg-coral/10 text-coral">Remove</button></div></div>):<p className="p-6 text-ink/50">No sources yet — add one above.</p>}</div>
  </div>}

  {active==='posts'&&<div className="mt-8 space-y-6">
    <form onSubmit={e=>{e.preventDefault();act(async()=>{await api.addPost(newPost);setNewPost({tag:'',title:'',excerpt:'',body:'',tagHi:'',titleHi:'',excerptHi:'',bodyHi:'',date:new Date().toISOString().slice(0,10),featured:false,image:''})})}} className="grid gap-3 panel p-6">
      <p className="text-sm text-ink/60">Hindi is optional. If you leave it blank, the Hindi view of Updates shows the English text.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input required value={newPost.tag} onChange={e=>setNewPost({...newPost,tag:e.target.value})} className="input" placeholder="Tag (e.g. SESSION RECAP)"/>
        <input required type="date" value={newPost.date} onChange={e=>setNewPost({...newPost,date:e.target.value})} className="input"/>
      </div>
      <input required value={newPost.title} onChange={e=>setNewPost({...newPost,title:e.target.value})} className="input" placeholder="Title"/>
      <textarea required value={newPost.excerpt} onChange={e=>setNewPost({...newPost,excerpt:e.target.value})} className="input" placeholder="One-line excerpt"/>
      <textarea required value={newPost.body} onChange={e=>setNewPost({...newPost,body:e.target.value})} className="input min-h-40" placeholder="Full post — separate paragraphs with a blank line"/>
      <p className="text-xs font-bold uppercase tracking-wide text-ink/60">Hindi (optional)</p>
      <input value={newPost.tagHi} onChange={e=>setNewPost({...newPost,tagHi:e.target.value})} className="input" placeholder="टैग (Hindi tag)"/>
      <input value={newPost.titleHi} onChange={e=>setNewPost({...newPost,titleHi:e.target.value})} className="input" placeholder="शीर्षक (Hindi title)"/>
      <textarea value={newPost.excerptHi} onChange={e=>setNewPost({...newPost,excerptHi:e.target.value})} className="input" placeholder="एक पंक्ति का सार (Hindi excerpt)"/>
      <textarea value={newPost.bodyHi} onChange={e=>setNewPost({...newPost,bodyHi:e.target.value})} className="input min-h-40" placeholder="पूरा लेख — पैराग्राफ के बीच एक खाली लाइन"/>
      <ImageField value={newPost.image} onChange={url=>setNewPost({...newPost,image:url})}/>
      <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={newPost.featured} onChange={e=>setNewPost({...newPost,featured:e.target.checked})}/> Feature this post at the top of Updates</label>
      <button type="submit" className="btn-primary">Publish post</button>
    </form>
    <div className="panel divide-y-2 divide-navy/10">{posts.length?posts.map(p=><div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div className="min-w-0">{p.image&&<ImageCell src={p.image} onRemove={()=>act(()=>api.updatePost(p.id,{image:''}))}/>}<p className="font-bold">{p.title}{p.featured&&<span className="ml-2 chip bg-saffron text-[10px] text-navy">FEATURED</span>}{p.titleHi&&<span className="ml-2 chip bg-paper text-[10px] text-navy">हिंदी</span>}</p><p className="truncate text-xs text-ink/50">{p.tag} · {p.date}</p><PostHindiEditor item={p} busy={busy} onSave={data=>act(()=>api.updatePost(p.id,data))}/></div><button type="button" disabled={busy} onClick={()=>act(()=>api.deletePost(p.id))} className="chip border-coral bg-coral/10 text-coral">Remove</button></div>):<p className="p-6 text-ink/50">No posts yet — write one above. Nothing shows on Updates until you do.</p>}</div>
  </div>}


  {active==='events'&&<div className="mt-8 space-y-6">
    <form onSubmit={e=>{e.preventDefault();act(async()=>{await api.addEvent(newEvent);setNewEvent({title:'',date:'',place:'',type:'Workshop',image:''})})}} className="grid gap-3 panel p-6">
      <div className="grid gap-3 lg:grid-cols-[1.4fr_9rem_1fr_9rem]">
        <input required value={newEvent.title} onChange={e=>setNewEvent({...newEvent,title:e.target.value})} className="input" placeholder="Event title"/>
        <input required type="date" value={newEvent.date} onChange={e=>setNewEvent({...newEvent,date:e.target.value})} className="input"/>
        <input required value={newEvent.place} onChange={e=>setNewEvent({...newEvent,place:e.target.value})} className="input" placeholder="Place (e.g. Online + Bengaluru)"/>
        <Select value={newEvent.type} onChange={type=>setNewEvent({...newEvent,type})} options={['Workshop','Conversation','Field session','Online','In person']} />
      </div>
      <ImageField value={newEvent.image} onChange={url=>setNewEvent({...newEvent,image:url})}/>
      <button type="submit" className="btn-primary w-fit">Add event</button>
    </form>
    <div className="panel divide-y-2 divide-navy/10">{events.length?events.map(ev=><div key={ev.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div className="min-w-0">{ev.image&&<ImageCell src={ev.image} onRemove={()=>act(()=>api.updateEvent(ev.id,{image:''}))}/>}<p className="font-bold">{ev.title}</p><p className="truncate text-xs text-ink/50">{ev.date} · {ev.place} · {ev.type}</p></div><button type="button" disabled={busy} onClick={()=>act(()=>api.deleteEvent(ev.id))} className="chip border-coral bg-coral/10 text-coral">Remove</button></div>):<p className="p-6 text-ink/50">No events yet — add one above. Nothing shows on the public site until you do.</p>}</div>
  </div>}

  {active==='opportunities'&&<div className="mt-8 space-y-6">
    <p className="text-sm text-ink/60">Use the page selector below to publish to either the Schemes page or the Contribute page. The Hindi fields are optional; when they are empty, the Hindi view shows the English text.</p>
    <form onSubmit={e=>{e.preventDefault();act(async()=>{await api.addOpportunity(newOpp);setNewOpp({page:'schemes',title:'',org:'',link:'',description:'',deadline:'',kind:'Scholarship',image:'',titleHi:'',descriptionHi:'',deadlineHi:'',kindHi:''})})}} className="grid gap-3 panel p-6 sm:grid-cols-2">
      <Select value={newOpp.page} onChange={page=>setNewOpp({...newOpp,page})} options={[{value:'schemes',label:'Schemes page'},{value:'volunteer',label:'Contribute page'}]} />
      <input value={newOpp.kind} onChange={e=>setNewOpp({...newOpp,kind:e.target.value})} className="input" placeholder="Kind (e.g. Scholarship, Internship)"/>
      <input required value={newOpp.title} onChange={e=>setNewOpp({...newOpp,title:e.target.value})} className="input md:col-span-2" placeholder="Title"/>
      <input required value={newOpp.org} onChange={e=>setNewOpp({...newOpp,org:e.target.value})} className="input" placeholder="Organisation"/>
      <input value={newOpp.deadline} onChange={e=>setNewOpp({...newOpp,deadline:e.target.value})} className="input" placeholder="Deadline (honest text, e.g. 'Rolling')"/>
      <input value={newOpp.link} onChange={e=>setNewOpp({...newOpp,link:e.target.value})} className="input md:col-span-2" placeholder="Official link (https://...)"/>
      <textarea value={newOpp.description} onChange={e=>setNewOpp({...newOpp,description:e.target.value})} className="input md:col-span-2" placeholder="One-line description"/>
      <p className="text-xs font-bold uppercase tracking-wide text-ink/60 md:col-span-2">Hindi (optional)</p>
      <input value={newOpp.titleHi} onChange={e=>setNewOpp({...newOpp,titleHi:e.target.value})} className="input md:col-span-2" placeholder="शीर्षक (Hindi title)"/>
      <input value={newOpp.kindHi} onChange={e=>setNewOpp({...newOpp,kindHi:e.target.value})} className="input" placeholder="प्रकार (Hindi kind)"/>
      <input value={newOpp.deadlineHi} onChange={e=>setNewOpp({...newOpp,deadlineHi:e.target.value})} className="input" placeholder="आख़िरी तारीख़ (Hindi deadline)"/>
      <textarea value={newOpp.descriptionHi} onChange={e=>setNewOpp({...newOpp,descriptionHi:e.target.value})} className="input md:col-span-2" placeholder="विवरण (Hindi description)"/>
      <div className="md:col-span-2"><ImageField value={newOpp.image} onChange={url=>setNewOpp({...newOpp,image:url})}/></div>
      <button type="submit" className="btn-primary md:col-span-2">Add opportunity</button>
    </form>
    <div className="panel divide-y-2 divide-navy/10">{opportunities.length?opportunities.map(o=><div key={o.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div className="min-w-0">{o.image&&<ImageCell src={o.image} onRemove={()=>act(()=>api.updateOpportunity(o.id,{image:''}))}/>}<p className="font-bold">{o.title}</p><p className="truncate text-xs text-ink/50">{o.page==='volunteer'?'contribute':o.page} · {o.kind} · {o.org}</p><OppHindiEditor item={o} busy={busy} onSave={data=>act(()=>api.updateOpportunity(o.id,data))}/></div><button type="button" disabled={busy} onClick={()=>act(()=>api.deleteOpportunity(o.id))} className="chip border-coral bg-coral/10 text-coral">Remove</button></div>):<p className="p-6 text-ink/50">Nothing yet — add a real, verified scheme or role above.</p>}</div>
  </div>}

  {active==='impact'&&<ImpactEditor value={impact} busy={busy} onSave={draft=>act(()=>api.saveImpact(draft))}/>}

  {active==='settings'&&settings&&<SettingsEditor value={settings} busy={busy} onSave={async draft=>{const saved=await api.saveSettings(draft);await loadActive();if(saved?.warning)throw new Error(saved.warning);return saved}}/>}

  {active==='applications'&&<ApplicationsList items={applications}/>}

  {active==='hindi'&&<LessonTranslations/>}

  {active==='traffic'&&<div className="mt-8 space-y-6">
    {!stats?<p className="text-ink/50">Loading…</p>:<>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="panel p-6"><p className="eyebrow">All time</p><p className="mt-2 font-display text-5xl font-extrabold text-navy">{stats.total}</p><p className="mt-1 text-sm text-ink/60">Total site visits</p></div>
        <div className="panel p-6"><p className="eyebrow">Today</p><p className="mt-2 font-display text-5xl font-extrabold text-navy">{stats.today}</p><p className="mt-1 text-sm text-ink/60">Visits so far today</p></div>
      </div>
      <div className="panel p-6">
        <p className="eyebrow">Last 7 days</p>
        <div className="mt-6 flex items-end gap-3" style={{height:140}}>
          {stats.last7.map(d=>{const max=Math.max(1,...stats.last7.map(x=>x.count));return <div key={d.date} className="flex flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-bold text-ink/60">{d.count}</span><div className="w-full rounded-t bg-civic" style={{height:Math.max(4,(d.count/max)*100)}}/><span className="text-[10px] text-ink/40">{d.date.slice(5)}</span></div>})}
        </div>
      </div>
      <p className="text-xs text-ink/45">Counts every page load of the public site (not admin). Simple totals, not unique-visitor tracking.</p>
    </>}
  </div>}

  {['pending','approved','rejected'].includes(active)&&<div className="mt-8 panel divide-y-2 divide-navy/10">{items.length?items.map(item=><ItemRow key={item.id} item={item}
    onApprove={active!=='approved'?()=>act(()=>api.approve(item.id)):undefined}
    onReject={active!=='rejected'?()=>act(()=>api.reject(item.id)):undefined}
    onDelete={()=>act(()=>api.deleteItem(item.id))}
  />):<p className="p-8 text-center text-ink/50">Nothing here yet.</p>}</div>}
  </main></div>
}
