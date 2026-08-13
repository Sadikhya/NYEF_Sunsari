import 'dotenv/config'
import { createDatabase } from '../config/database.js'

const records = [
  [
    'president_message',
    'Mr. Sinet Rijal',
    'Your involvement is what makes NYEF Sunsari strong. I thank all predecessors for their visionary leadership and thank all of you for keeping the spirit alive. While we are still in our early years, we are laying down strong foundations for the future. Let us grow together, evolve as an impactful chapter, and create an entrepreneurial community that uplifts the nation.',
    '/assets/team/sinetrijal.jpg',
  ],
  [
    'focus_intro',
    'Our Key Focus Areas',
    'We create tangible value for our members and community through strategic initiatives.',
    null,
  ],
  ['focus_1', 'Startup Ecosystem', 'Launching and supporting new ventures through bootcamps and pitch competitions.', '*'],
  ['focus_2', 'Powerful Networking', 'Building valuable connections through exclusive meetups and events.', 'N'],
  ['focus_3', 'Leadership & Mentorship', 'Developing future leaders with guidance from seasoned experts.', 'L'],
  ['focus_4', 'Policy Advocacy', 'Championing a better business environment for young entrepreneurs.', 'P'],
  ['values_intro', 'The Values That Drive Us', '', null],
  ['value_1', 'Growth with Shared Vision', 'We believe in collective leadership, teamwork, and mutual trust to achieve our common goals.', null],
  ['value_2', 'Hunger for Learning', 'We foster a culture of continuous improvement, treating failures as learning opportunities.', null],
  ['value_3', 'Nation First', "We place Nepal's interests above all, contributing to our nation's prosperity through entrepreneurship.", null],
  ['value_4', 'Make a Mark', 'We embrace change, foster innovation, and constantly seek better ways of doing things.', null],
]

const database = createDatabase()

try {
  const placeholders = records.map(() => '(?, ?, ?, ?)').join(', ')

  await database.execute(
    `INSERT INTO site_content (content_key, title, body, image_url)
     VALUES ${placeholders}
     ON DUPLICATE KEY UPDATE
       title = VALUES(title),
       body = VALUES(body),
       image_url = VALUES(image_url)`,
    records.flat(),
  )
  const [rows] = await database.execute('SELECT content_key, title FROM site_content ORDER BY content_key')
  console.log('Seeded site content records:')
  console.table(rows)
} finally {
  await database.end()
}
