import { useEffect, useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Toast from './components/Toast'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import WhatWeDoPage from './pages/WhatWeDoPage'
import MembershipPage from './pages/MembershipPage'
import TeamPage from './pages/TeamPage'
import GalleryPage from './pages/GalleryPage'
import ContactPage from './pages/ContactPage'
import AdminPanel from './admin/AdminPanel'

const pages = new Set(['home', 'about', 'what-we-do', 'membership', 'team', 'gallery', 'contact', 'admin'])

export default function App() {
  const [activePage, setActivePage] = useState(window.location.hash === '#admin' ? 'admin' : 'home')
  const [teamTab, setTeamTab] = useState('exec-committee')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)

  const navigate = (page, tab) => {
    setActivePage(pages.has(page) ? page : 'home')
    window.location.hash = page === 'admin' ? 'admin' : ''
    if (page === 'team' && tab) setTeamTab(tab)
    setMobileOpen(false)
    window.scrollTo?.({ top: 0, behavior: 'smooth' })
  }

  const showSuccess = () => setToastVisible(true)

  useEffect(() => {
    if (!toastVisible) return undefined
    const timer = window.setTimeout(() => setToastVisible(false), 3000)
    return () => window.clearTimeout(timer)
  }, [toastVisible])

  const page = {
    home: <HomePage onNavigate={navigate} />,
    about: <AboutPage />,
    'what-we-do': <WhatWeDoPage />,
    membership: <MembershipPage onNavigate={navigate} />,
    team: <TeamPage activeTab={teamTab} onTabChange={setTeamTab} />,
    gallery: <GalleryPage />,
    contact: <ContactPage onSuccess={showSuccess} />,
    admin: <AdminPanel onExit={() => navigate('home')} />,
  }[activePage]

  if (activePage === 'admin') return page

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <Header activePage={activePage} mobileOpen={mobileOpen} onToggleMobile={() => setMobileOpen((open) => !open)} onNavigate={navigate} />
      <main className="page-enter" key={activePage}>{page}</main>
      <Footer />
      <Toast visible={toastVisible} />
    </div>
  )
}
