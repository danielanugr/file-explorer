import { pool } from '../config/database'

async function testDatabase() {
  try {
    // Test basic connection
    console.log('Testing database connection...')
    const result = await pool.query('SELECT COUNT(*) FROM folders')
    console.log(`✅ Database connected. Found ${result.rows[0].count} folders`)

    // Show folder tree structure
    const tree = await pool.query(`
      SELECT
        f.id,
        f.name,
        f.parent_id,
        p.name as parent_name
      FROM folders f
      LEFT JOIN folders p ON f.parent_id = p.id
      ORDER BY f.parent_id NULLS FIRST, f.name
    `)

    console.log('\n📁 Folder Structure:')
    tree.rows.forEach(folder => {
      const indent = folder.parent_id ? '  └─ ' : '📂 '
      const parent = folder.parent_name ? ` (in ${folder.parent_name})` : ' (root)'
      console.log(`${indent}${folder.name}${parent}`)
    })

  } catch (error) {
    console.error('❌ Database test failed:', error)
  } finally {
    await pool.end()
  }
}

testDatabase()