import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { schema } from '../schema'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fileexplorer',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
}

const connectionString = `postgresql://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`

const client = postgres(connectionString, {
  max: 50,
  idle_timeout: 30,
  connect_timeout: 10,
  max_lifetime: 3600,
  prepare: true,
  transform: {
    undefined: null,
  },
  onnotice: process.env.NODE_ENV === 'development' ? console.log : undefined,
})

export const db = drizzle(client, { schema })

export async function testDrizzleConnection() {
  try {
    const result = await db.execute('SELECT NOW() as now')
    console.log('✅ Drizzle connected successfully:', result[0])
    return true
  } catch (error) {
    console.error('❌ Drizzle connection failed:', error)
    return false
  }
}

export { client }