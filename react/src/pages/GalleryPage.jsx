import { SectionHeading } from '../components/ui'
import { galleryImages } from '../data/staticContent'

export default function GalleryPage() {
  return <section className="px-6 py-20 md:py-28"><div className="mx-auto max-w-7xl"><SectionHeading title="Gallery & Highlights" description="A glimpse into our vibrant community, events, and the moments that define us." /><div className="mt-14 grid auto-rows-[220px] grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{galleryImages.map((image,index) => <figure key={image.id || image.image_url} className={`card-hover overflow-hidden rounded-2xl ${index === 2 || index === 3 ? 'col-span-2' : ''}`}><img src={image.image_url} alt={image.caption || `NYEF Sunsari event ${index + 1}`} className="h-full w-full object-cover" /></figure>)}</div></div></section>
}
