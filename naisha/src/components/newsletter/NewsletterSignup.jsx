import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
export function NewsletterSignup(){
  const [email,setEmail]=useState('')
  const [status,setStatus]=useState(null)
  function submit(e){
    e.preventDefault()
    if(!/^\S+@\S+\.\S+$/.test(email)){setStatus('error');return}
    setStatus('success')
    setEmail('')
  }
  return (
    <section className="grid items-center gap-8 rounded-lg border-2 border-navy bg-navy px-6 py-8 text-white shadow-[3px_3px_0_0_#FFC107] md:grid-cols-2 md:px-10 md:py-10">
      <div>
        <span className="grid h-11 w-11 place-items-center rounded-md border-2 border-white/30 bg-white/10 text-saffron"><Mail size={20}/></span>
        <h2 className="mt-4 text-3xl leading-tight md:text-4xl">The civic briefing your group chat needs</h2>
        <p className="mt-3 max-w-md text-white/75">One clear weekly read on public life, policy and the ideas shaping India</p>
      </div>
      <div>
        {status==='success'
          ? <p className="flex items-center gap-2 text-lg font-bold"><CheckCircle2 size={20} className="text-saffron"/> You're subscribed. Check your inbox to confirm.</p>
          : <form onSubmit={submit} className="grid gap-3">
              <input value={email} onChange={e=>setEmail(e.target.value)} type="email" aria-label="Email address" className="input" placeholder="Your email address" required/>
              <button type="submit" className="btn-accent w-full sm:w-fit">Subscribe <ArrowRight size={16}/></button>
              {status==='error'&&<p className="text-xs font-bold text-saffron">Please enter a valid email address</p>}
              <p className="text-xs text-white/60">No spam. Just useful context</p>
            </form>}
      </div>
    </section>
  )
}
