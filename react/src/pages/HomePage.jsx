import { assetUrl } from '../api/client'
import { FeatureCard, SectionHeading } from '../components/ui'
import { pickNumberedContentList, siteContent } from '../data/staticContent'
import { useResource } from '../hooks/useResource'

export default function HomePage({ onNavigate }) {
  const { data } = useResource('/api/public/site-content', siteContent)
  const content = Object.fromEntries((data?.length ? data : siteContent).map((item) => [item.content_key, item]))
  const president = content.president_message || siteContent[0]
  const focus = content.focus_intro || siteContent[1]
  const focuses = pickNumberedContentList(content, 'focus')
  const valuesIntro = content.values_intro
  const values = pickNumberedContentList(content, 'value')

  return <>
    <section className="relative h-[clamp(480px,42vw,700px)] w-full overflow-hidden bg-white">
      <video data-video-backdrop src="/assets/Nyef.mp4" autoPlay muted loop playsInline aria-hidden="true" className="absolute inset-0 h-full w-full scale-105 object-cover object-center opacity-25 blur-md" />
      <video data-main-video src="/assets/Nyef.mp4" autoPlay muted loop playsInline aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-contain object-center drop-shadow-2xl" />
      <div className="absolute inset-x-0 bottom-4 z-10 text-center"><button type="button" onClick={() => onNavigate('membership')} className="rounded-xl bg-sky-500 px-12 py-4 text-lg font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-sky-600">Become a Member</button></div>
    </section>
    <section className="bg-white px-6 py-20"><div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-3"><div className="text-center"><img src={assetUrl(president.image_url)} alt="President Sinet Rijal" className="mx-auto mb-5 h-56 w-56 rounded-full object-cover shadow-xl ring-4 ring-sky-500/30" /><h2 className="text-2xl font-bold text-slate-800">{president.title}</h2><p className="font-semibold text-sky-600">President, NYEF Sunsari (2026-2027)</p></div><div className="lg:col-span-2"><h2 className="mb-6 text-3xl font-extrabold text-slate-800 md:text-4xl">A Message From Our President</h2><blockquote className="border-l-4 border-sky-500 pl-6 text-lg italic leading-relaxed text-slate-600">"{president.body}"</blockquote></div></div></section>
    <section className="px-6 py-20"><div className="mx-auto max-w-7xl"><SectionHeading title={focus.title} description={focus.body} /><div className="mt-14 grid gap-7 md:grid-cols-2 lg:grid-cols-4">{focuses.map((item) => <FeatureCard key={item.content_key} icon={item.image_url || '*'} title={item.title} description={item.body} />)}</div></div></section>
    <section className="bg-slate-100 px-6 py-20"><div className="mx-auto max-w-5xl"><SectionHeading title={valuesIntro?.title || 'The Values That Drive Us'} description={valuesIntro?.body} /><div className="mt-12 grid gap-8 md:grid-cols-2">{values.map((item, index) => <article key={item.content_key} className="flex gap-5 rounded-2xl bg-white p-7"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sky-500 font-bold text-white">0{index + 1}</div><div><h3 className="mb-2 text-xl font-bold text-slate-800">{item.title}</h3><p className="leading-relaxed text-slate-600">{item.body}</p></div></article>)}</div></div></section>
  </>
}
