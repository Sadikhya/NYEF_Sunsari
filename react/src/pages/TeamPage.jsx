import { SectionHeading, TeamCard } from '../components/ui'

const executive = [
  ['/assets/team/sinetrijal.jpg','SINET RIJAL','PRESIDENT'],
  ['/assets/team/rajiv-ghimire.jpg','RAJIV GHIMIRE','IMMEDIATE PAST PRESIDENT'],
  ['/assets/team/rakesh-shrestha.jpg','RAKESH SHRESTHA','FIRST VICE PRESIDENT'],
  ['/assets/team/abhishek-basnet.jpg','ABHISHEK BASNET','SECOND VICE PRESIDENT'],
  ['/assets/team/akash-dulal.jpg','AAKASH DULAL','EXECUTIVE MEMBER'],
  ['/assets/team/utshab-thapa.jpg','UTSHAB THAPA','EXECUTIVE MEMBER'],
  ['/assets/team/jerman-poudel.jpg','JERMAN POUDEL','EXECUTIVE MEMBER'],
  ['/assets/team/nishant-khedia.jpg','NISHANT KHEDIA','EXECUTIVE MEMBER'],
  ['/assets/team/rahul-bhandari.png','RAHUL BHANDARI','EXECUTIVE MEMBER',null,'object-top origin-top scale-[1.25]'],
  ['/assets/team/aavash-bhandari.png','AAVASH BHATTRAI','EXECUTIVE MEMBER'],
  ['/assets/team/binita-poudel.png','BINITA POUDEL','EXECUTIVE MEMBER',null,'object-center scale-[1.5] -translate-y-[8%]'],
  ['/assets/team/dipesh-shrestha.jpg','DIPESH SHRESTHA','EXECUTIVE MEMBER',null,'object-top scale-[1.03]'],
  ['/assets/team/mission-parajuli.png','MISSION PARAJULI','EXECUTIVE MEMBER',null,'object-top origin-top scale-[1.35]'],
]
const presidents = [
  ['/assets/team/rajiv-ghimire.jpg','Mr. Rajiv Ghimire','Immediate Past President','2025-2026'],
  ['/assets/team/siddhartha-shrestha.jpeg','Mr. Siddhartha Shrestha','Past President','2023-2025'],
  ['/assets/team/chandra-devkota.jpg','Mr. Chandra Devkota','Past President','2022-2023'],
  ['/assets/team/santosh-acharya.png','Mr. Santosh Acharya','Past President','2021-2022'],
  ['/assets/team/sudip-ghimire.png','Mr. Sudip Ghimire','Founder President','2019-2020'],
]
const tabs = [['exec-committee','Executive Committee'],['past-presidents','Past Presidents'],['gen-members','General Members']]

export default function TeamPage({ activeTab, onTabChange }) {
  const people = activeTab === 'past-presidents' ? presidents : executive
  return <section className="bg-white px-6 py-20 md:py-28"><div className="mx-auto max-w-7xl"><SectionHeading title="Meet Our Team" description="The entrepreneurs and leaders driving NYEF Sunsari forward." /><div role="tablist" aria-label="Team collections" className="mx-auto mt-10 flex max-w-2xl flex-wrap justify-center gap-2 rounded-2xl bg-slate-100 p-2">{tabs.map(([id,label]) => <button key={id} role="tab" aria-selected={activeTab === id} type="button" onClick={() => onTabChange(id)} className={`rounded-xl px-5 py-3 font-semibold transition ${activeTab === id ? 'bg-sky-500 text-white shadow' : 'text-slate-600 hover:bg-white'}`}>{label}</button>)}</div>{activeTab === 'gen-members' ? <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-dashed border-slate-300 p-12 text-center"><h2 className="text-2xl font-bold text-slate-800">General Members</h2><p className="mt-3 text-slate-600">Our growing community of entrepreneurs powers the Sunsari chapter.</p></div> : <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">{people.map(([image,name,role,term,imagePosition], index) => <TeamCard key={name} image={image} name={name} role={role} term={term} imagePosition={imagePosition} featured={activeTab === 'exec-committee' && index === 0} />)}</div>}</div></section>
}
