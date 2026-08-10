export function SectionHeading({ title, description }) {
  return <div className="mx-auto max-w-3xl text-center"><h2 className="mb-4 text-4xl font-extrabold text-slate-800 md:text-5xl">{title}</h2>{description && <p className="text-lg leading-relaxed text-slate-600">{description}</p>}</div>
}

export function FeatureCard({ icon = '✦', title, description }) {
  return <article className="card-hover rounded-2xl border border-slate-100 bg-white p-8 shadow-lg"><div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-2xl text-sky-600">{icon}</div><h3 className="mb-2 text-xl font-bold text-slate-800">{title}</h3><p className="leading-relaxed text-slate-600">{description}</p></article>
}

export function TeamCard({ image, name, role, term, imagePosition = 'object-top', featured = false }) {
  const initials = name.split(' ').map((part) => part[0]).join('.')
  return <article className={`card-hover rounded-2xl bg-slate-50 p-6 text-center shadow-sm ${featured ? 'sm:col-span-2 lg:col-span-3' : ''}`}>{image ? <div className={`${featured ? 'h-40 w-40' : 'h-32 w-32'} mx-auto mb-4 overflow-hidden rounded-full ring-4 ring-white`}><img src={image} alt={name} className={`h-full w-full object-cover ${imagePosition}`} /></div> : <div aria-hidden="true" className={`${featured ? 'h-40 w-40 text-5xl' : 'h-32 w-32 text-4xl'} mx-auto mb-4 flex items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-500 ring-4 ring-white`}>{initials}</div>}<h3 className={`${featured ? 'text-2xl' : 'text-xl'} font-bold text-slate-800`}>{name}</h3><p className="text-slate-500">{role}</p>{term && <p className="mt-2 text-xs text-slate-400">Term: {term}</p>}</article>
}
