import { useEffect, useLayoutEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Navbar, Footer } from './components/layout/Shell'
import { Home, About, Team, Learning, LessonDetail, Schemes, Contribute, Events, UpdateDetail, Downloads, FAQ, Contact, Quiz, SearchResults, Admin, Impact } from './pages/Pages'
import { api } from './lib/api'
const routes = [['/',Home],['/about',About],['/team',Team],['/blog',Learning],['/schemes',Schemes],['/contribute',Contribute],['/volunteer',()=><Navigate to="/contribute" replace/>],['/events',Events],['/impact',Impact],['/updates',()=><Navigate to="/schemes" replace/>],['/learn',Downloads],['/faq',FAQ],['/contact',Contact],['/quiz',Quiz],['/search',SearchResults],['/updates/:slug',UpdateDetail],['/blog/:slug',LessonDetail]]
let visitTracked = false
function ScrollToTop(){
  const { pathname, hash } = useLocation()
  useLayoutEffect(() => {
    if (hash) return
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}
function SiteShell(){
  useEffect(()=>{if(!visitTracked){visitTracked=true;api.trackVisit()}},[])
  return <><Navbar/><main>{routes.map(([p,C])=><Routes key={p}><Route path={p} element={<C/>}/></Routes>)}</main><Footer/></>
}
export default function App(){return <><ScrollToTop/><Routes><Route path="/admin" element={<Admin/>}/><Route path="*" element={<SiteShell/>}/></Routes></>}
