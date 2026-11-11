import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowRight, HandFist, Monitor, Lock, ShieldCheck, Coins, CheckCircle2 } from 'lucide-react'
import { ResourceCard, EventCard, StepCard } from '../cards/Cards'
import { resources, downloadGroups, pillarSlug } from '../../data/content'
import { api } from '../../lib/api'
import { SectionHead, Band, CallToAction, EmptyState } from '../common/UI'

export const PILLAR_INFO={
  'Know Your Rights':{icon:HandFist,blurb:'Voting, police stops, RTI and the traffic rules nobody explained'},
  'Stay Safe':{icon:Monitor,badge:Lock,blurb:'Digital safety and what to do when something goes wrong'},
  'Know Your Schemes':{icon:ShieldCheck,blurb:'Scholarships, insurance, DigiLocker and the paperwork that unlocks them'},
  'Money Matters':{icon:Coins,blurb:'Bank accounts, PAN, loans, credit scores and the taxes you already pay'},
}
const GUIDE_COUNT=downloadGroups.reduce((n,g)=>n+g.items.length,0)

function PillarIcon({pillar}){const info=PILLAR_INFO[pillar]||{};const Icon=info.icon||ShieldCheck;const Badge=info.badge;return <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-md border-2 border-navy bg-saffron"><Icon size={22} className="text-navy"/>{Badge&&<span className="absolute -bottom-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full border-2 border-navy bg-white text-navy"><Badge size={10}/></span>}</span>}

export function PillarGrid(){return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{downloadGroups.map(g=><Link key={g.pillar} to={`/learn#${pillarSlug(g.pillar)}`} className="card group flex flex-col p-6"><PillarIcon pillar={g.pillar}/><h3 className="mt-5 text-xl leading-snug">{g.pillar}</h3><p className="mt-2 flex-1 text-sm leading-6 text-ink/75">{PILLAR_INFO[g.pillar]?.blurb}</p><p className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-signal">{g.items.length} guides <ArrowRight size={15} className="transition group-hover:translate-x-1"/></p></Link>)}</div>}

function PillarPanel(){return <div className="panel-block p-6"><p className="eyebrow !text-ink/60">Start here</p><p className="mt-2 font-display text-2xl font-extrabold leading-tight text-navy">Four things school skipped</p><div className="mt-5 grid gap-3">{downloadGroups.map(g=><Link key={g.pillar} to={`/learn#${pillarSlug(g.pillar)}`} className="flex items-center gap-3 rounded-md border-2 border-navy/15 p-3 transition hover:border-navy hover:bg-paper"><PillarIcon pillar={g.pillar}/><span><span className="block font-bold text-navy">{g.pillar}</span><span className="block text-xs text-ink/65">{g.items.length} free guides</span></span></Link>)}</div><p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-civic"><CheckCircle2 size={14}/> {GUIDE_COUNT} guides · No email needed · Free to share</p></div>}

export function HeroSection(){return <section className="bg-paper"><div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 md:px-8 md:py-20 lg:grid-cols-[1.15fr_.85fr] lg:items-center"><div><p className="tag">Free · Peer-led · For teens across India</p><h1 className="mt-5 text-5xl leading-[1.02] md:text-7xl">Because no one taught us this stuff.</h1><p className="mt-6 max-w-lg text-lg leading-8 text-ink/80">Your rights. Your schemes. Your safety. Explained by people your age, in plain words.</p><div className="mt-8 flex flex-wrap gap-3"><Link className="btn-accent" to="/quiz">Take the Quiz</Link><Link className="btn-outline" to="/learn">Explore the guides</Link></div></div><PillarPanel/></div></section>}

const ACTIONS=[
  {num:'01',title:'Read a guide',copy:'Short, printable guides on voting, police stations, RTI, scholarships, bank accounts and staying safe online.',result:'a guide you can save or send on WhatsApp',to:'/learn',action:'Open the guides'},
  {num:'02',title:'Take the Quiz',copy:'Ten harder questions on helplines, rights and schemes. Every answer explains the real rule.',result:'your score and the gaps worth closing',to:'/quiz',action:'Start the quiz'},
  {num:'03',title:'Pitch in',copy:'Train a session at your school, volunteer with content or design, or support the work.',result:'a way to help teens near you',to:'/contribute',action:'See how to help'},
]
const STEPS=[
  ['Step 1','Learn in 5 minutes','One topic, one page, written by a peer.'],
  ['Step 2','Check yourself','The quiz shows what you already know and what you missed.'],
  ['Step 3','Take the step','Register, apply, file or call, with the guide in hand.'],
  ['Step 4','Tell us what happened','Your story helps the next teen, and shows us what to fix.'],
]
const PROBLEM_STATS=[
  {stat:'88%',label:"couldn't name their elected MLA without checking"},
  {stat:'75%',label:"don't know the actual steps to register to vote"},
  {stat:'56%',label:'had never heard of the National Scholarship Portal'},
  {stat:'90%',label:'were never properly taught their rights in school'},
]

function UseIt(){return <section className="section"><SectionHead eyebrow="Three things you can do today" title="Not just know it. Use it." copy="Each one ends with something done: a guide saved, a gap found, a session planned."/><div className="grid gap-5 md:grid-cols-3">{ACTIONS.map(a=><StepCard key={a.num} {...a}/>)}</div></section>}

function HowItWorks(){return <section className="section pt-0"><h2 className="text-4xl md:text-5xl">How it works</h2><div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{STEPS.map(([step,title,copy],i)=><div key={step} className={`border-t-4 pt-5 ${i===STEPS.length-1?'border-saffron':'border-navy'}`}><p className="text-xs font-semibold uppercase tracking-[.14em] text-ink/60">{step}</p><h3 className="mt-2 text-2xl">{title}</h3><p className="mt-2 text-sm leading-6 text-ink/75">{copy}</p></div>)}</div></section>}

function WhyItExists(){return <section className="border-y-2 border-navy bg-white"><div className="section grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start"><div><p className="eyebrow">What we found</p><h2 className="mt-2 text-4xl leading-[1.05] md:text-5xl">School prepares you for exams. Nobody prepares you for citizenship.</h2><p className="mt-5 max-w-md leading-7 text-ink/80">We asked Indian teenagers some basic questions about civic life. Most of them didn't know. That's not their fault. Nobody taught them.</p><Link to="/learn" className="btn-primary mt-7">See what we teach <ArrowRight size={16}/></Link></div><div className="grid gap-4 sm:grid-cols-2">{PROBLEM_STATS.map((s,i)=><div key={s.label} className={`panel p-6 ${i===0?'bg-saffron':''}`}><p className="font-display text-5xl font-extrabold text-navy">{s.stat}</p><p className="mt-3 text-sm font-semibold leading-6 text-navy">{s.label}</p></div>)}<p className="rounded-lg border-2 border-dashed border-navy/35 px-5 py-4 text-sm leading-6 text-ink/75 sm:col-span-2">Do you know how to register to vote? Most teenagers we surveyed didn't. That's why StreetSmarter exists.</p></div></div></section>}

function formatEventDate(iso){try{return new Date(iso+'T00:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short'}).toUpperCase()}catch{return iso}}
function LibraryAndEvents(){
  const [upcoming,setUpcoming]=useState(null)
  useEffect(()=>{let alive=true;api.publicEvents().then(d=>{if(alive)setUpcoming(d.upcoming)}).catch(()=>{if(alive)setUpcoming([])});return()=>{alive=false}},[])
  return <section className="section"><SectionHead eyebrow="From the blog" title="Small reads. Big context." action="Browse all lessons" actionHref="/blog"/><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{resources.slice(0,3).map(r=><ResourceCard key={r.slug} slug={r.slug} title={r.title} topic={r.topic} time={r.time}/>)}</div><div className="mt-16 grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-start"><div><p className="eyebrow">Coming up</p><h2 className="mt-2 text-4xl">Practice citizenship together</h2><p className="mt-3 max-w-md leading-7 text-ink/75">Free sessions and workshops, in schools and colonies</p><Link to="/events" className="btn-outline mt-6">See all events <ArrowRight size={16}/></Link></div>{upcoming&&upcoming.length>0?<div className="grid gap-4">{upcoming.slice(0,2).map(e=><EventCard key={e.id} date={formatEventDate(e.date)} title={e.title} place={e.place} type={e.type} image={e.image}/>)}</div>:<EmptyState>No sessions scheduled yet — check back soon</EmptyState>}</div></section>
}

export function HomeSections(){return <><Band words={['Rights','Schemes','Safety','Money']} copy="The things that decide how your life goes, and that school never covered."/><UseIt/><HowItWorks/><WhyItExists/><LibraryAndEvents/><CallToAction title="Be the person who knew." copy="Become a StreetSmarter trainer or volunteer. Run a session at your school, help with content or design, or support the work."><Link to="/contribute" className="btn-primary w-full">Count me in <ArrowRight size={16}/></Link><Link to="/contact?topic=Booking" className="btn-outline w-full">Bring a session to my school</Link></CallToAction></>}
