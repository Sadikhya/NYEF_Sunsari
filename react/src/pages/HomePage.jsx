import { FeatureCard, SectionHeading } from '../components/ui'

const focuses = [
  ['💡', 'Startup Ecosystem', 'Launching and supporting new ventures through bootcamps and pitch competitions.'],
  ['🤝', 'Powerful Networking', 'Building valuable connections through exclusive meetups and events.'],
  ['🧭', 'Leadership & Mentorship', 'Developing future leaders with guidance from seasoned experts.'],
  ['📣', 'Policy Advocacy', 'Championing a better business environment for young entrepreneurs.'],
]
const values = [
  ['Growth with Shared Vision', 'We believe in collective leadership, teamwork, and mutual trust to achieve our common goals.'],
  ['Hunger for Learning', 'We foster a culture of continuous improvement, treating failures as learning opportunities.'],
  ['Nation First', "We place Nepal's interests above all, contributing to our nation's prosperity through entrepreneurship."],
  ['Make a Mark', 'We embrace change, foster innovation, and constantly seek better ways of doing things.'],
]

export default function HomePage({ onNavigate }) {
  return <>
    <section className="relative flex min-h-[520px] items-center justify-center bg-cover bg-center px-6 text-white" style={{ backgroundImage: "linear-gradient(rgba(186,230,253,.18),rgba(186,230,253,.18)),linear-gradient(rgba(2,6,23,.68),rgba(2,6,23,.68)),url('https://raw.githubusercontent.com/Sinetrijal/NYEF-Sunsari/main/assets/n1.jpg')" }}>
      <div className="max-w-4xl text-center"><p className="mb-4 text-sm font-bold uppercase tracking-[.3em] text-sky-300">Nepalese Young Entrepreneurs&apos; Forum</p><h1 className="mb-6 text-4xl font-extrabold leading-tight md:text-6xl">Welcome to NYEF Sunsari</h1><p className="mx-auto mb-7 max-w-3xl text-lg leading-relaxed text-slate-200 md:text-xl">Uniting passionate young entrepreneurs from across the Sunsari district. We empower youth through idea exchange, education, training, advocacy, and a nationwide entrepreneurial brotherhood.</p><p className="text-xl font-semibold italic text-sky-300 md:text-2xl">“We connect, we grow, and we lead — together.”</p><button type="button" onClick={() => onNavigate('membership')} className="mt-10 rounded-xl bg-sky-500 px-10 py-4 font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-sky-600">Become a Member</button></div>
    </section>
    <section className="bg-white px-6 py-20"><div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-3"><div className="text-center"><img src="/assets/team/sinetrijal.jpg" alt="President Sinet Rijal" className="mx-auto mb-5 h-56 w-56 rounded-full object-cover shadow-xl ring-4 ring-sky-500/30" /><h2 className="text-2xl font-bold text-slate-800">Mr. Sinet Rijal</h2><p className="font-semibold text-sky-600">President, NYEF Sunsari (2026-2027)</p></div><div className="lg:col-span-2"><h2 className="mb-6 text-3xl font-extrabold text-slate-800 md:text-4xl">A Message From Our President</h2><blockquote className="border-l-4 border-sky-500 pl-6 text-lg italic leading-relaxed text-slate-600">“Your involvement is what makes NYEF Sunsari strong. I thank all predecessors for their visionary leadership and thank all of you for keeping the spirit alive. While we are still in our early years, we are laying down strong foundations for the future. Let’s grow together, evolve as an impactful chapter, and create an entrepreneurial community that uplifts the nation.”</blockquote></div></div></section>
    <section className="px-6 py-20"><div className="mx-auto max-w-7xl"><SectionHeading title="Our Key Focus Areas" description="We create tangible value for our members and community through strategic initiatives." /><div className="mt-14 grid gap-7 md:grid-cols-2 lg:grid-cols-4">{focuses.map(([icon, title, description]) => <FeatureCard key={title} icon={icon} title={title} description={description} />)}</div></div></section>
    <section className="bg-slate-100 px-6 py-20"><div className="mx-auto max-w-5xl"><SectionHeading title="The Values That Drive Us" /><div className="mt-12 grid gap-8 md:grid-cols-2">{values.map(([title, description], index) => <article key={title} className="flex gap-5 rounded-2xl bg-white p-7"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sky-500 font-bold text-white">0{index + 1}</div><div><h3 className="mb-2 text-xl font-bold text-slate-800">{title}</h3><p className="leading-relaxed text-slate-600">{description}</p></div></article>)}</div></div></section>
  </>
}
