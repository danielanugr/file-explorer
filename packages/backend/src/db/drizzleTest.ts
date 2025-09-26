import { DrizzleFolderRepository } from '../repositories/drizzleFolderRepository'
import { testDrizzleConnection } from '../config/drizzle'

async function testDrizzleIntegration() {
  console.log('🧪 Testing Drizzle ORM integration...\n')

  try {
    console.log('1. Testing database connection:')
    const connected = await testDrizzleConnection()
    if (!connected) {
      throw new Error('Database connection failed')
    }

    const folderRepo = new DrizzleFolderRepository()

    console.log('\n2. Testing folder operations:')

    const allFolders = await folderRepo.getAllFolders()
    console.log(`✅ Found ${allFolders.length} folders`)

    const tree = await folderRepo.getFolderTree()
    console.log(`✅ Built folder tree with ${tree.length} root folders`)

    console.log('\n📁 Folder Tree Structure:')
    function printTree(folders: any[], level = 0) {
      folders.forEach(folder => {
        const indent = '  '.repeat(level)
        const icon = folder.children?.length ? '📂' : '📁'
        const childCount = folder.children?.length ? ` (${folder.children.length} children)` : ''
        console.log(`${indent}${icon} ${folder.name}${childCount}`)

        if (folder.children?.length > 0) {
          printTree(folder.children, level + 1)
        }
      })
    }

    printTree(tree)

    if (allFolders.length > 0) {
      console.log('\n3. Testing folder stats:')
      const firstFolder = allFolders[0]
      const stats = await folderRepo.getFolderWithStats(firstFolder.id)
      console.log(`✅ Folder "${stats.folder?.name}":`)
      console.log(`   📁 ${stats.childrenCount} subfolders`)
      console.log(`   📄 ${stats.filesCount} files`)
    }

    console.log('\n✅ All Drizzle tests passed!')

  } catch (error) {
    console.error('❌ Drizzle test failed:', error)
    throw error
  }
}

if (import.meta.main) {
  testDrizzleIntegration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}