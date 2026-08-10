const links = [
  ['home', 'Home'], ['about', 'About Us'], ['what-we-do', 'What We Do'],
  ['membership', 'Membership'], ['gallery', 'Gallery'], ['contact', 'Contact'],
]

const teamLinks = [
  ['exec-committee', 'Executive Committee'],
  ['past-presidents', 'Past Presidents'],
  ['gen-members', 'General Members'],
]

function NavButton({ active, children, className = '', onClick }) {
  return <button type="button" onClick={onClick} className={`nav-link text-left font-medium ${active ? 'active' : ''} ${className}`}>{children}</button>
}

export default function Header({ activePage, mobileOpen, onToggleMobile, onNavigate }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <button type="button" aria-label="Go to home" onClick={() => onNavigate('home')}><img src="/assets/logo.svg" alt="NYEF Sunsari" className="h-10 w-auto" /></button>
        <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
          {links.slice(0, 4).map(([id, label]) => <NavButton key={id} active={activePage === id} onClick={() => onNavigate(id)}>{label}</NavButton>)}
          <div className="group relative py-2">
            <NavButton active={activePage === 'team'} onClick={() => onNavigate('team', 'exec-committee')}>Our Team <span aria-hidden="true">⌄</span></NavButton>
            <div className="invisible absolute left-0 top-full w-56 origin-top-left scale-95 rounded-xl border border-slate-100 bg-white p-2 opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:scale-100 group-focus-within:opacity-100 group-hover:visible group-hover:scale-100 group-hover:opacity-100">
              {teamLinks.map(([id, label]) => <button key={id} type="button" className="block w-full rounded-lg px-4 py-3 text-left text-sm hover:bg-sky-50 hover:text-sky-700" onClick={() => onNavigate('team', id)}>{label}</button>)}
            </div>
          </div>
          {links.slice(4).map(([id, label]) => <NavButton key={id} active={activePage === id} onClick={() => onNavigate(id)}>{label}</NavButton>)}
        </nav>
        <button type="button" className="rounded-lg p-2 text-2xl lg:hidden" aria-label="Toggle navigation menu" aria-expanded={mobileOpen} onClick={onToggleMobile}>☰</button>
      </div>
      {mobileOpen && <nav aria-label="Mobile navigation" className="border-t border-slate-100 bg-white px-6 py-4 lg:hidden">
        <div className="grid gap-3">
          {links.map(([id, label]) => <NavButton key={id} active={activePage === id} onClick={() => onNavigate(id)}>{label}</NavButton>)}
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">Our team</p>
          {teamLinks.map(([id, label]) => <NavButton key={id} active={false} className="pl-3" onClick={() => onNavigate('team', id)}>{label}</NavButton>)}
        </div>
      </nav>}
    </header>
  )
}
