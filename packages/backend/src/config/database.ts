import { Pool } from 'pg'

export const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'file_explorer',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
}

export const pool = new Pool(dbConfig)

export async function testConnection() {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT NOW()')
    console.log('Database connected successfully:', result.rows[0])
    client.release()
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}