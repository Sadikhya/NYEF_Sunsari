export const adminSections = [
  ['team-members', 'Team'],
  ['site-content', 'Content'],
]

export const defaultAdminSection = adminSections[0][0]

export const contentCategories = [
  ['all', 'All Content'],
  ['president', 'President Message'],
  ['focus', 'Focus Areas'],
  ['values', 'Values'],
  ['other', 'Other'],
]

export const emptyForms = {
  'team-members': { name: '', position: '', category: 'executive_committee', term: '', business: '', contact: '', address: '', profile_picture: '', display_order: 0, is_published: true },
  'site-content': { content_key: '', title: '', body: '', image_url: '' },
}

export function fieldList(section) {
  if (section === 'team-members') return ['name', 'position', 'category', 'business', 'contact', 'address', 'profile_picture', 'is_published']
  return ['content_key', 'title', 'body', 'image_url']
}

export function getContentCategory(record) {
  const key = record?.content_key || ''
  if (key === 'president_message') return 'president'
  if (key === 'focus_intro' || key.startsWith('focus_')) return 'focus'
  if (key === 'values_intro' || key.startsWith('value_')) return 'values'
  return 'other'
}

export function filterContentRecords(records, category) {
  if (category === 'all') return records
  return records.filter((record) => getContentCategory(record) === category)
}
