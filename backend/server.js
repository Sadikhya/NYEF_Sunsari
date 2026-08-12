import 'dotenv/config'
import { createApp } from './app.js'
import { pool } from './config/database.js'
import { createMemberRepository } from './repositories/memberRepository.js'

const port = Number(process.env.PORT ?? 5000)
const app = createApp(createMemberRepository(pool))

app.listen(port, () => {
  console.log(`NYEF Sunsari API listening on port ${port}`)
})
