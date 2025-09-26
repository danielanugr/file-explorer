import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { schema } from '../schema'

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'file_explorer',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
}

// Create connection string
const connectionString = `postgresql://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`

// Create postgres client
const client = postgres(connectionString, {
  max: 10, // Connection pool size
  idle_timeout: 20,
  connect_timeout: 10,
})

// Create Drizzle instance
export const db = drizzle(client, { schema })

// Test connection function
export async function testDrizzleConnection() {
  try {
    // Simple test query
    const result = await db.execute('SELECT NOW() as now')
    console.log('✅ Drizzle connected successfully:', result[0])
    return true
  } catch (error) {
    console.error('❌ Drizzle connection failed:', error)
    return false
  }
}

// Export connection for raw queries if needed
export { client }