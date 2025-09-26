import { pool } from '../config/database'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function runMigrations() {
  try {
    console.log('Running database migrations...')

    const migrationPath = join(__dirname, '../../../../database/migrations/001_create_folders.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')

    await pool.query(migrationSQL)
    console.log('✅ Migration completed successfully')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

if (import.meta.main) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}