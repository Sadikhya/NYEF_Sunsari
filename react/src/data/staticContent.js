export const executive = [
  { profile_picture: '/assets/team/sinetrijal.jpg', name: 'SINET RIJAL', position: 'PRESIDENT', category: 'executive_committee' },
  { profile_picture: '/assets/team/rajiv-ghimire.jpg', name: 'RAJIV GHIMIRE', position: 'IMMEDIATE PAST PRESIDENT', category: 'executive_committee' },
  { profile_picture: '/assets/team/rakesh-shrestha.jpg', name: 'RAKESH SHRESTHA', position: 'FIRST VICE PRESIDENT', category: 'executive_committee' },
  { profile_picture: '/assets/team/abhishek-basnet.jpg', name: 'ABHISHEK BASNET', position: 'SECOND VICE PRESIDENT', category: 'executive_committee' },
  { profile_picture: '/assets/team/akash-dulal.jpg', name: 'AAKASH DULAL', position: 'EXECUTIVE MEMBER', category: 'executive_committee' },
  { profile_picture: '/assets/team/utshab-thapa.jpg', name: 'UTSHAB THAPA', position: 'EXECUTIVE MEMBER', category: 'executive_committee' },
  { profile_picture: '/assets/team/jerman-poudel.jpg', name: 'JERMAN POUDEL', position: 'EXECUTIVE MEMBER', category: 'executive_committee' },
  { profile_picture: '/assets/team/nishant-khedia.jpg', name: 'NISHANT KHEDIA', position: 'EXECUTIVE MEMBER', category: 'executive_committee' },
  { profile_picture: '/assets/team/rahul-bhandari.png', name: 'RAHUL BHANDARI', position: 'EXECUTIVE MEMBER', category: 'executive_committee', imagePosition: 'object-top origin-top scale-[1.25]' },
  { profile_picture: '/assets/team/aavash-bhandari.png', name: 'AAVASH BHATTRAI', position: 'EXECUTIVE MEMBER', category: 'executive_committee' },
  { profile_picture: '/assets/team/binita-poudel.png', name: 'BINITA POUDEL', position: 'EXECUTIVE MEMBER', category: 'executive_committee', imagePosition: 'object-center scale-[1.5] -translate-y-[8%]' },
  { profile_picture: '/assets/team/dipesh-shrestha.jpg', name: 'DIPESH SHRESTHA', position: 'EXECUTIVE MEMBER', category: 'executive_committee', imagePosition: 'object-top scale-[1.03]' },
  { profile_picture: '/assets/team/mission-parajuli.png', name: 'MISSION PARAJULI', position: 'EXECUTIVE MEMBER', category: 'executive_committee', imagePosition: 'object-top origin-top scale-[1.35]' },
]

export const presidents = [
  { profile_picture: '/assets/team/rajiv-ghimire.jpg', name: 'Mr. Rajiv Ghimire', position: 'Immediate Past President', term: '2025-2026', category: 'past_president' },
  { profile_picture: '/assets/team/siddhartha-shrestha.jpeg', name: 'Mr. Siddhartha Shrestha', position: 'Past President', term: '2023-2025', category: 'past_president' },
  { profile_picture: '/assets/team/chandra-devkota.jpg', name: 'Mr. Chandra Devkota', position: 'Past President', term: '2022-2023', category: 'past_president' },
  { profile_picture: '/assets/team/santosh-acharya.png', name: 'Mr. Santosh Acharya', position: 'Past President', term: '2021-2022', category: 'past_president' },
  { profile_picture: '/assets/team/sudip-ghimire.png', name: 'Mr. Sudip Ghimire', position: 'Founder President', term: '2019-2020', category: 'past_president' },
]

export const galleryImages = Array.from({ length: 18 }, (_, index) => ({ id: index + 1, image_url: `/assets/gallery/${index + 1}.jpg`, caption: `NYEF Sunsari event ${index + 1}` }))

export const siteContent = [
  {
    content_key: 'president_message',
    title: 'Mr. Sinet Rijal',
    body: 'Your involvement is what makes NYEF Sunsari strong. I thank all predecessors for their visionary leadership and thank all of you for keeping the spirit alive. While we are still in our early years, we are laying down strong foundations for the future. Let us grow together, evolve as an impactful chapter, and create an entrepreneurial community that uplifts the nation.',
    image_url: '/assets/team/sinetrijal.jpg',
  },
  {
    content_key: 'focus_intro',
    title: 'Our Key Focus Areas',
    body: 'We create tangible value for our members and community through strategic initiatives.',
    image_url: null,
  },
  {
    content_key: 'focus_1',
    title: 'Startup Ecosystem',
    body: 'Launching and supporting new ventures through bootcamps and pitch competitions.',
    image_url: '*',
  },
  {
    content_key: 'focus_2',
    title: 'Powerful Networking',
    body: 'Building valuable connections through exclusive meetups and events.',
    image_url: 'N',
  },
  {
    content_key: 'focus_3',
    title: 'Leadership & Mentorship',
    body: 'Developing future leaders with guidance from seasoned experts.',
    image_url: 'L',
  },
  {
    content_key: 'focus_4',
    title: 'Policy Advocacy',
    body: 'Championing a better business environment for young entrepreneurs.',
    image_url: 'P',
  },
  {
    content_key: 'values_intro',
    title: 'The Values That Drive Us',
    body: '',
    image_url: null,
  },
  {
    content_key: 'value_1',
    title: 'Growth with Shared Vision',
    body: 'We believe in collective leadership, teamwork, and mutual trust to achieve our common goals.',
    image_url: null,
  },
  {
    content_key: 'value_2',
    title: 'Hunger for Learning',
    body: 'We foster a culture of continuous improvement, treating failures as learning opportunities.',
    image_url: null,
  },
  {
    content_key: 'value_3',
    title: 'Nation First',
    body: "We place Nepal's interests above all, contributing to our nation's prosperity through entrepreneurship.",
    image_url: null,
  },
  {
    content_key: 'value_4',
    title: 'Make a Mark',
    body: 'We embrace change, foster innovation, and constantly seek better ways of doing things.',
    image_url: null,
  },
]

export function pickNumberedContentList(content, prefix) {
  const pattern = new RegExp(`^${prefix}_(\\d+)$`)

  return Object.values(content)
    .map((item) => ({ item, match: pattern.exec(item.content_key) }))
    .filter(({ match }) => match)
    .sort((left, right) => Number(left.match[1]) - Number(right.match[1]))
    .map(({ item }) => item)
}
