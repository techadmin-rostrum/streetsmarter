import { useEffect, useState } from 'react'
import { Inbox, CheckCircle2, XCircle, Rss, LogOut, Trash2, CalendarDays, Briefcase, FileText, ImagePlus, X, BarChart3, Gauge, Settings, ClipboardList, Languages } from 'lucide-react'
import { api, resolveImage } from '../../lib/api'
import { IMPACT_GROUPS } from '../../data/impact'
import { resources } from '../../data/content'
import { lessonsHi } from '../../data/lessonsHi'
import { loadLessonOverrides, hindiLesson } from '../../lib/lang'
export function AdminSidebar({active,setActive,onLogout,counts={}}){
  const items=[['pending','Pending',Inbox],['approved','Approved',CheckCircle2],['rejected','Rejected',XCircle],['sources','Sources',Rss],['posts','Posts',FileText],['events','Events',CalendarDays],['opportunities','Opportunities (Schemes & Contribute)',Briefcase],['impact','Impact numbers',Gauge],['settings','Site settings',Settings],['applications','Applications',ClipboardList],['hindi','Hindi text',Languages],['traffic','Traffic',BarChart3]]
  return <aside className="w-full bg-navy p-5 text-white md:min-h-screen md:w-64"><p className="font-display text-xl">StreetSmarter / Admin</p><nav className="mt-10 grid gap-2">{items.map(([key,label,I])=><button key={key} type="button" onClick={()=>setActive(key)} className={`flex items-center justify-between gap-3 rounded-lg px-3 py-3 text-left text-sm transition ${active===key?'bg-white/15 font-bold':'text-white/65 hover:bg-white/10'}`}><span className="flex items-center gap-3"><I size={17}/>{label}</span>{counts[key]!==undefined&&<span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">{counts[key]}</span>}</button>)}</nav><button type="button" onClick={onLogout} className="mt-10 flex items-center gap-2 text-sm text-white/60 transition hover:text-white"><LogOut size={16}/> Log out</button></aside>
}
export function ImageField({value,onChange,label='Picture'}){
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  async function handleFile(e){
    const file=e.target.files?.[0]
    e.target.value=''
    if(!file)return
    setBusy(true);setError('')
    try{const{url}=await api.uploadImage(file);onChange(url)}catch(err){setError(err.message)}finally{setBusy(false)}
  }
  return <div>
    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink/50">{label}</p>
    {value?<div className="flex items-center gap-3"><img src={resolveImage(value)} alt="" className="h-16 w-16 rounded-lg object-cover"/><button type="button" onClick={()=>onChange('')} className="chip bg-coral/10 text-coral"><X size={13}/> Remove picture</button></div>:
    <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-ink/25 px-4 py-3 text-sm font-bold text-ink/60 transition hover:border-civic hover:text-civic">
      <ImagePlus size={16}/>{busy?'Uploading…':'Add picture'}
      <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={busy}/>
    </label>}
    {error&&<p className="mt-1 text-xs font-bold text-coral">{error}</p>}
  </div>
}
export function ImageCell({src,onRemove}){
  if(!src)return null
  return <div className="mb-2 flex items-center gap-2"><img src={resolveImage(src)} alt="" className="h-10 w-10 rounded-lg object-cover"/><button type="button" onClick={onRemove} className="chip bg-coral/10 text-[11px] text-coral"><X size={11}/> Remove picture</button></div>
}
const SHEET_HELP = `var HEADERS = ['Time', 'Type', 'Name', 'Email', 'Phone', 'School or college', 'Why', 'When free', 'Interest', 'LinkedIn', 'Resume', 'Message'];
var WIDTHS = [168, 100, 160, 230, 140, 180, 280, 220, 180, 200, 220, 280];
function headerLooksPlain(sheet) {
  var last = sheet.getLastColumn();
  if (last < 1) return true;
  var labels = sheet.getRange(1, 1, 1, last).getValues()[0].map(function(value) { return String(value || '').trim(); });
  var filled = labels.filter(Boolean);
  if (!filled.length) return true;
  var same = HEADERS.length === filled.length && HEADERS.every(function(label, i) { return filled[i] === label; });
  if (!same) return false;
  var background = sheet.getRange(1, 1).getBackground();
  return !background || background === '#ffffff';
}
function styleOnce(sheet) {
  var props = PropertiesService.getDocumentProperties();
  if (props.getProperty('ssStyled') === '1') return;
  if (!headerLooksPlain(sheet)) {
    props.setProperty('ssStyled', '1');
    return;
  }
  var header = sheet.getRange(1, 1, 1, HEADERS.length);
  header.setValues([HEADERS]).setBackground('#0A1B3F').setFontColor('#FFFFFF').setFontWeight('bold').setFontSize(11).setVerticalAlignment('middle').setWrap(true);
  sheet.setRowHeight(1, 36);
  sheet.setFrozenRows(1);
  WIDTHS.forEach(function(width, i) { sheet.setColumnWidth(i + 1, width); });
  sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm');
  sheet.getRange('G:H').setWrap(true);
  sheet.getRange('L:L').setWrap(true);
  if (!sheet.getFilter()) sheet.getRange(1, 1, Math.max(sheet.getMaxRows(), 2), HEADERS.length).createFilter();
  props.setProperty('ssStyled', '1');
}
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  if (data.type === 'link-check') return ContentService.createTextOutput('ok');
  var book = SpreadsheetApp.getActive();
  if (!book) throw new Error('Open this script from the sheet: Extensions > Apps Script');
  var sheet = book.getSheets()[0];
  styleOnce(sheet);
  var whenFree = Array.isArray(data.availability) ? data.availability.join(', ') : (data.availability || '');
  var values = {
    'Time': data.createdAt || '',
    'Type': data.type || '',
    'Name': data.name || '',
    'Email': data.email || '',
    'Phone': data.phone || '',
    'School or college': data.school || '',
    'Why': data.why || '',
    'When free': whenFree,
    'Interest': data.interest || '',
    'LinkedIn': data.linkedin || '',
    'Resume': data.resumeUrl || '',
    'Message': data.message || ''
  };
  var width = Math.max(sheet.getLastColumn(), 1);
  var labels = sheet.getRange(1, 1, 1, width).getValues()[0];
  var row = [];
  for (var i = 0; i < labels.length; i++) row.push(values[String(labels[i] || '').trim()] || '');
  sheet.appendRow(row);
  return ContentService.createTextOutput('ok');
}
// Replace the script from the sheet: Extensions > Apps Script. Deploy a new web app as Anyone.
// A plain sheet is styled once. If the header, colours, widths or column order were edited by hand,
// later submissions only add a row under the matching header and do not restyle anything.`

export function ImpactEditor({ value, onSave, busy }) {
  const [draft, setDraft] = useState(value)
  const [error, setError] = useState('')
  useEffectSync(value, setDraft)
  function setField(group, key, raw) {
    setDraft(current => ({ ...current, [group]: { ...current[group], [key]: raw } }))
  }
  return (
    <form onSubmit={e => { e.preventDefault(); setError(''); Promise.resolve(onSave(draft)).catch(err => setError(err.message)) }} className="mt-8 space-y-6">
      {IMPACT_GROUPS.map(group => (
        <fieldset key={group.key} className="panel p-6">
          <legend className="font-display text-2xl text-navy">{group.title}</legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {group.fields.map(([key, label]) => (
              <label key={key} className="block text-sm font-bold text-ink/70">{label}
                <input required type="number" min="0" step="1" value={draft?.[group.key]?.[key] ?? 0} onChange={e => setField(group.key, key, e.target.value)} className="input mt-1" />
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      {error && <p className="text-sm font-bold text-coral">{error}</p>}
      <button type="submit" disabled={busy || !draft} className="btn-primary">Save impact numbers</button>
    </form>
  )
}

function useEffectSync(value, setDraft) {
  useEffect(() => { if (value) setDraft(value) }, [value, setDraft])
}

export function SettingsEditor({ value, onSave, busy }) {
  const [sheetUrl, setSheetUrl] = useState(value?.googleSheetUrl || '')
  const [donateUrl, setDonateUrl] = useState(value?.donateUrl || '')
  const [sheetNote, setSheetNote] = useState('')
  const [sheetError, setSheetError] = useState('')
  const [donateNote, setDonateNote] = useState('')
  const [donateError, setDonateError] = useState('')
  const [copied, setCopied] = useState(false)
  useEffect(() => { setSheetUrl(value?.googleSheetUrl || ''); setDonateUrl(value?.donateUrl || '') }, [value])
  async function copyScript() {
    try {
      await navigator.clipboard.writeText(SHEET_HELP)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setSheetError('Could not copy. Select the script from Apps Script and paste it by hand.')
    }
  }
  function saveSheet(e) {
    e.preventDefault()
    setSheetError(''); setSheetNote('')
    Promise.resolve(onSave({ googleSheetUrl: sheetUrl })).then(saved => {
      if (saved?.warning) setSheetError(saved.warning)
      else setSheetNote(sheetUrl.trim() ? 'Sheet link saved. Google accepted it.' : 'Sheet link cleared.')
    }).catch(err => setSheetError(err.message))
  }
  function saveDonate(e) {
    e.preventDefault()
    setDonateError(''); setDonateNote('')
    Promise.resolve(onSave({ donateUrl })).then(() => setDonateNote(donateUrl.trim() ? 'Donation link saved.' : 'Donation link cleared.')).catch(err => setDonateError(err.message))
  }
  return (
    <div className="mt-8 grid gap-6">
      <form onSubmit={saveSheet} className="panel space-y-4 p-6">
        <div>
          <h2 className="font-display text-2xl text-navy">Application sheet</h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">Trainer, volunteer and contact answers are added as a new row. A plain sheet is styled once. Later colour, width and column edits are left as they are.</p>
        </div>
        <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-ink/75">
          <li>Open the Google Sheet, then Extensions, then Apps Script.</li>
          <li>Copy the script and replace what is there.</li>
          <li>Deploy a new web app. Execute as Me. Who has access: Anyone.</li>
          <li>Paste the /exec link below and save.</li>
        </ol>
        <button type="button" onClick={copyScript} className="btn-outline">{copied ? 'Copied' : 'Copy script'}</button>
        <label className="block text-sm font-bold text-ink/70">Web app link
          <input value={sheetUrl} onChange={e => setSheetUrl(e.target.value)} className="input mt-1" placeholder="https://script.google.com/macros/s/.../exec" />
        </label>
        {sheetNote && <p className="text-sm font-bold text-civic">{sheetNote}</p>}
        {sheetError && <p className="text-sm font-bold text-coral">{sheetError}</p>}
        <button type="submit" disabled={busy} className="btn-primary">Save sheet link</button>
      </form>
      <form onSubmit={saveDonate} className="panel space-y-4 p-6">
        <div>
          <h2 className="font-display text-2xl text-navy">Donation link</h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">The Donate button on the Contribute page opens this address. Leave it blank until the payment page is ready.</p>
        </div>
        <label className="block text-sm font-bold text-ink/70">Payment page
          <input value={donateUrl} onChange={e => setDonateUrl(e.target.value)} className="input mt-1" placeholder="https://payment-page.example" />
        </label>
        {donateNote && <p className="text-sm font-bold text-civic">{donateNote}</p>}
        {donateError && <p className="text-sm font-bold text-coral">{donateError}</p>}
        <button type="submit" disabled={busy} className="btn-primary">Save donation link</button>
      </form>
    </div>
  )
}

export function ApplicationsList({ items }) {
  if (!items.length) return <p className="mt-8 panel p-6 text-ink/60">No trainer or volunteer applications yet.</p>
  return (
    <div className="mt-8 panel divide-y-2 divide-navy/10">
      {items.map(item => (
        <article key={item.id} className="p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-civic">{item.type} · {new Date(item.createdAt).toLocaleString('en-IN')}</p>
          <h2 className="mt-1 text-xl">{item.name}</h2>
          <p className="text-sm text-ink/70">{item.email} · {item.phone}</p>
          {item.school && <p className="mt-2 text-sm text-ink/70">{item.school}</p>}
          {item.interest && <p className="mt-2 text-sm text-ink/70">{item.interest} · {item.availability}</p>}
          {Array.isArray(item.availability) && <p className="mt-2 text-sm text-ink/70">{item.availability.join(', ')}</p>}
          {item.why && <p className="mt-2 text-sm leading-6 text-ink/70">{item.why}</p>}
          <div className="mt-2 flex flex-wrap gap-3 text-sm font-bold">
            {item.linkedin && <a className="text-civic underline" href={item.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
            {item.resumeUrl && <a className="text-civic underline" href={resolveImage(item.resumeUrl)} target="_blank" rel="noopener noreferrer">Resume</a>}
          </div>
        </article>
      ))}
    </div>
  )
}

export function ItemRow({item,onApprove,onReject,onDelete}){
  return <div className="flex items-start justify-between gap-4 p-4"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wide text-civic">{item.category} · {item.sourceLabel}</p><a href={item.link} target="_blank" rel="noopener noreferrer" className="mt-1 block font-bold leading-snug hover:underline">{item.title}</a><p className="mt-1 text-sm text-ink/60">{item.summary}</p></div><div className="flex shrink-0 gap-2">{onApprove&&<button type="button" onClick={onApprove} aria-label="Approve" className="rounded-full bg-civic/10 p-2 text-civic transition hover:bg-civic/20"><CheckCircle2 size={16}/></button>}{onReject&&<button type="button" onClick={onReject} aria-label="Reject" className="rounded-full bg-coral/10 p-2 text-coral transition hover:bg-coral/20"><XCircle size={16}/></button>}{onDelete&&<button type="button" onClick={onDelete} aria-label="Delete" className="rounded-full bg-ink/5 p-2 text-ink/50 transition hover:bg-ink/10"><Trash2 size={16}/></button>}</div></div>
}

export function PostHindiEditor({ item, onSave, busy }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState({ tagHi: item.tagHi || '', titleHi: item.titleHi || '', excerptHi: item.excerptHi || '', bodyHi: Array.isArray(item.bodyHi) ? item.bodyHi.join('\n\n') : (item.bodyHi || '') })
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="mt-2 text-xs font-bold text-signal underline">{item.titleHi ? 'Edit Hindi' : 'Add Hindi'}</button>
  return (
    <form onSubmit={e => { e.preventDefault(); Promise.resolve(onSave(draft)).then(() => setOpen(false)) }} className="mt-3 grid gap-2">
      <input value={draft.tagHi} onChange={e => setDraft({ ...draft, tagHi: e.target.value })} className="input" placeholder="टैग (Hindi tag)" />
      <input value={draft.titleHi} onChange={e => setDraft({ ...draft, titleHi: e.target.value })} className="input" placeholder="शीर्षक (Hindi title)" />
      <textarea value={draft.excerptHi} onChange={e => setDraft({ ...draft, excerptHi: e.target.value })} className="input" placeholder="एक पंक्ति का सार (Hindi excerpt)" />
      <textarea value={draft.bodyHi} onChange={e => setDraft({ ...draft, bodyHi: e.target.value })} className="input min-h-32" placeholder="पूरा लेख — पैराग्राफ के बीच एक खाली लाइन" />
      <div className="flex gap-2"><button type="submit" disabled={busy} className="btn-primary !py-2">Save Hindi</button><button type="button" onClick={() => setOpen(false)} className="btn-outline !py-2">Cancel</button></div>
    </form>
  )
}

export function OppHindiEditor({ item, onSave, busy }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState({ titleHi: item.titleHi || '', kindHi: item.kindHi || '', deadlineHi: item.deadlineHi || '', descriptionHi: item.descriptionHi || '' })
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="mt-2 text-xs font-bold text-signal underline">{item.titleHi ? 'Edit Hindi' : 'Add Hindi'}</button>
  return (
    <form onSubmit={e => { e.preventDefault(); Promise.resolve(onSave(draft)).then(() => setOpen(false)) }} className="mt-3 grid gap-2 sm:grid-cols-2">
      <input value={draft.titleHi} onChange={e => setDraft({ ...draft, titleHi: e.target.value })} className="input sm:col-span-2" placeholder="शीर्षक (Hindi title)" />
      <input value={draft.kindHi} onChange={e => setDraft({ ...draft, kindHi: e.target.value })} className="input" placeholder="प्रकार (kind)" />
      <input value={draft.deadlineHi} onChange={e => setDraft({ ...draft, deadlineHi: e.target.value })} className="input" placeholder="आख़िरी तारीख़ (deadline)" />
      <textarea value={draft.descriptionHi} onChange={e => setDraft({ ...draft, descriptionHi: e.target.value })} className="input sm:col-span-2" placeholder="विवरण (description)" />
      <div className="flex gap-2 sm:col-span-2"><button type="submit" disabled={busy} className="btn-primary !py-2">Save Hindi</button><button type="button" onClick={() => setOpen(false)} className="btn-outline !py-2">Cancel</button></div>
    </form>
  )
}

function LessonHindiForm({ lesson, saved, onSaved }) {
  const current = hindiLesson(lesson.slug, saved ? { [lesson.slug]: saved } : {}) || { title: '', topic: '', body: [], reviewed: false }
  const [draft, setDraft] = useState({ title: current.title, topic: current.topic, body: current.body.join('\n\n'), reviewed: current.reviewed })
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  async function save(e) {
    e.preventDefault()
    setBusy(true); setStatus('')
    try { await api.saveLessonHi(lesson.slug, draft); await loadLessonOverrides(true); setStatus('Saved'); onSaved() } catch (err) { setStatus(err.message) } finally { setBusy(false) }
  }
  return (
    <form onSubmit={save} className="panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl">{lesson.title}</h2>
        <span className={`chip ${draft.reviewed ? 'border-civic bg-civic/10 text-civic' : 'bg-saffron text-navy'}`}>{draft.reviewed ? 'Reviewed' : 'Needs review'}</span>
      </div>
      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink/60">English (for comparison)</p>
          <p className="mt-2 text-sm font-semibold text-navy">{lesson.topic}</p>
          <div className="mt-2 space-y-3 rounded-md border-2 border-navy/15 bg-paper p-4 text-sm leading-6 text-ink/80">{lesson.body.map((p, i) => <p key={i}>{p}</p>)}</div>
        </div>
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-ink/60">Hindi (what the site shows)</p>
          <input required value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} className="input" placeholder="शीर्षक" />
          <input value={draft.topic} onChange={e => setDraft({ ...draft, topic: e.target.value })} className="input" placeholder="विषय" />
          <textarea required value={draft.body} onChange={e => setDraft({ ...draft, body: e.target.value })} className="input min-h-80 text-sm leading-6" placeholder="Separate paragraphs with a blank line" />
          <label className="flex items-center gap-2 text-sm font-bold text-navy"><input type="checkbox" checked={draft.reviewed} onChange={e => setDraft({ ...draft, reviewed: e.target.checked })} /> A Hindi speaker has checked this lesson</label>
          <div className="flex items-center gap-3"><button type="submit" disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Save Hindi'}</button>{status && <span className={`text-sm font-bold ${status === 'Saved' ? 'text-civic' : 'text-coral'}`}>{status}</span>}</div>
        </div>
      </div>
    </form>
  )
}

export function LessonTranslations() {
  const [saved, setSaved] = useState(null)
  function load(force) { loadLessonOverrides(force).then(setSaved) }
  useEffect(() => { load(true) }, [])
  if (!saved) return <p className="mt-8 text-ink/60">Loading…</p>
  const reviewed = resources.filter(r => saved[r.slug]?.reviewed).length
  return (
    <div className="mt-8 space-y-6">
      <p className="max-w-3xl text-sm leading-6 text-ink/70">Each Blog lesson has a Hindi draft. Ask a Hindi speaker to read it next to the English, fix anything that is wrong or sounds unnatural, tick the box and save. Until a lesson is ticked, the site shows a small "translation is being checked" note on it. {reviewed} of {resources.length} lessons are reviewed.</p>
      {resources.filter(r => lessonsHi[r.slug] || saved[r.slug]).map(r => <LessonHindiForm key={r.slug} lesson={r} saved={saved[r.slug]} onSaved={() => load(false)} />)}
    </div>
  )
}
