import { FeatureCard, SectionHeading } from '../components/ui'
const activities = [
  ['🚀', 'Entrepreneurship Bootcamps', 'Intensive training to turn ideas into viable business models.'],
  ['🛠️', 'Workshops & Training', 'Skill-building sessions on finance, marketing, tech, and more.'],
  ['🌐', 'Networking Meetups', 'Connecting members with peers, mentors, and industry leaders.'],
  ['💡', 'Youth Startup Pitching', 'Platforms for startups to gain visibility and secure funding.'],
  ['🧭', 'Mentorship Programs', 'Guidance from successful business leaders and experts.'],
  ['📣', 'Policy Dialogues', 'Advocating for a youth-friendly business environment.'],
]
export default function WhatWeDoPage() { return <section className="bg-white px-6 py-20 md:py-28"><div className="mx-auto max-w-7xl"><SectionHeading title="What We Do" description="Our programs foster a vibrant entrepreneurial ecosystem through hands-on learning, networking, and real-world opportunities." /><div className="mt-14 grid gap-7 md:grid-cols-2 lg:grid-cols-3">{activities.map(([icon,title,description]) => <FeatureCard key={title} icon={icon} title={title} description={description} />)}</div></div></section> }
