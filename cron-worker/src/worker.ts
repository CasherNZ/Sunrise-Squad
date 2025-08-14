import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../../shared/schema'

export default {
  async scheduled(_event: ScheduledEvent, env: { DATABASE_URL: string }) {
    const sql = neon(env.DATABASE_URL)
    // @ts-ignore
    const db = drizzle(sql, { schema })
    // TODO: run your cleanup/reset queries directly or call Pages Function webhook
    // e.g., await fetch(env.APP_URL + '/api/reset', { method: 'POST', body: JSON.stringify({ target: 'morning' }) })
  }
}
