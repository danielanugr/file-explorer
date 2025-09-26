import { readFileSync } from 'fs'
import { join } from 'path'
import { client } from '../config/drizzle'

async function applyIndexes() {
  try {
    const indexesSQL = readFileSync(
      join(__dirname, '../infrastructure/database/indexes.sql'),
      'utf-8'
    )

    const statements = indexesSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)

    console.log('🔧 Applying database indexes for scalability...')

    for (const statement of statements) {
      try {
        await client.unsafe(statement)
        console.log(`✅ Applied: ${statement.split('\n')[0]}`)
      } catch (error) {
        console.warn(`⚠️ Index may already exist: ${statement.split('\n')[0]}`)
      }
    }

    console.log('✅ Database indexes applied successfully!')
  } catch (error) {
    console.error('❌ Error applying indexes:', error)
  } finally {
    await client.end()
  }
}

if (require.main === module) {
  applyIndexes()
}