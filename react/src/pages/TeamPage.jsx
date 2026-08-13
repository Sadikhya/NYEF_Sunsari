import { assetUrl } from '../api/client'
import ResourceState from '../components/ResourceState'
import { SectionHeading, TeamCard } from '../components/ui'
import { executive, presidents } from '../data/staticContent'
import { sortTeamMembers } from '../data/teamDisplay'
import { useResource } from '../hooks/useResource'

const tabs = [['exec-committee','Executive Committee'],['past-presidents','Past Presidents'],['gen-members','General Members']]

export default function TeamPage({ activeTab, onTabChange }) {
  const fallback = [...executive, ...presidents]
  const { data, loading, error, reload } = useResource('/api/public/team-members', fallback)
  const source = data?.length ? data : fallback
  const generalMembers = sortTeamMembers(source.filter((person) => person.category === 'general_member'))
  const people = activeTab === 'past-presidents'
    ? sortTeamMembers(source.filter((person) => person.category === 'past_president'))
    : sortTeamMembers(source.filter((person) => person.category === 'executive_committee'))

  return <section className="bg-white px-6 py-20 md:py-28"><div className="mx-auto max-w-7xl"><SectionHeading title="Meet Our Team" description="The entrepreneurs and leaders driving NYEF Sunsari forward." /><ResourceState loading={loading && !source.length} error={error && !source.length ? error : null} onRetry={reload} /><div role="tablist" aria-label="Team collections" className="mx-auto mt-10 flex max-w-2xl flex-wrap justify-center gap-2 rounded-2xl bg-slate-100 p-2">{tabs.map(([id,label]) => <button key={id} role="tab" aria-selected={activeTab === id} type="button" onClick={() => onTabChange(id)} className={`rounded-xl px-5 py-3 font-semibold transition ${activeTab === id ? 'bg-sky-500 text-white shadow' : 'text-slate-600 hover:bg-white'}`}>{label}</button>)}</div>{activeTab === 'gen-members' ? <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">{generalMembers.length ? generalMembers.map((person) => <TeamCard key={person.id || person.name} image={assetUrl(person.profile_picture)} name={person.name} role={person.position || 'General Member'} business={person.business} contact={person.contact} address={person.address} />) : <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-slate-300 p-12 text-center sm:col-span-2 lg:col-span-3"><h2 className="text-2xl font-bold text-slate-800">General Members</h2><p className="mt-3 text-slate-600">Our growing community of entrepreneurs powers the Sunsari chapter.</p></div>}</div> : <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">{people.map((person, index) => <TeamCard key={person.id || person.name} image={assetUrl(person.profile_picture)} name={person.name} role={person.position} term={person.term} business={person.business} contact={person.contact} address={person.address} imagePosition={person.imagePosition} featured={activeTab === 'exec-committee' && index === 0} />)}</div>}</div></section>
}
