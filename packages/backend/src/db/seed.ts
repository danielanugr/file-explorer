import { pool } from '../config/database'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function seedDatabase() {
  try {
    console.log('Seeding database with sample data...')

    // Read and execute seed file
    const seedPath = join(__dirname, '../../../../database/migrations/002_insert_sample_data.sql')
    const seedSQL = readFileSync(seedPath, 'utf-8')

    await pool.query(seedSQL)
    console.log('✅ Database seeded successfully')

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  }
}

// Run seeding if this file is executed directly
if (import.meta.main) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}