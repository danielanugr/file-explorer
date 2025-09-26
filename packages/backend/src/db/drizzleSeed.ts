import { db } from '../config/drizzle'
import { folders, files } from '../schema'
import { eq } from 'drizzle-orm'

export async function seedDrizzleDatabase() {
  try {
    console.log('🌱 Seeding database with Drizzle ORM...')

    // Clear existing data (optional)
    console.log('🧹 Clearing existing data...')
    await db.delete(files)
    await db.delete(folders)

    // Insert root folders
    console.log('📁 Creating root folders...')
    const rootFolders = await db
      .insert(folders)
      .values([
        { name: 'Documents', parentId: null },
        { name: 'Pictures', parentId: null },
        { name: 'Projects', parentId: null },
      ])
      .returning()

    const documentsId = rootFolders[0].id
    const picturesId = rootFolders[1].id
    const projectsId = rootFolders[2].id

    // Insert level 1 subfolders
    console.log('📂 Creating level 1 subfolders...')
    const level1Folders = await db
      .insert(folders)
      .values([
        // Documents subfolders
        { name: 'Work', parentId: documentsId },
        { name: 'Personal', parentId: documentsId },
        { name: 'Archive', parentId: documentsId },
        // Pictures subfolders
        { name: 'Vacation 2023', parentId: picturesId },
        { name: 'Family Photos', parentId: picturesId },
        { name: 'Screenshots', parentId: picturesId },
        // Projects subfolders
        { name: 'Web Projects', parentId: projectsId },
        { name: 'Mobile Apps', parentId: projectsId },
        { name: 'Scripts', parentId: projectsId },
      ])
      .returning()

    // Find specific folders for deeper nesting
    const workFolder = level1Folders.find(f => f.name === 'Work')!
    const webProjectsFolder = level1Folders.find(f => f.name === 'Web Projects')!

    // Insert level 2 subfolders
    console.log('📁 Creating level 2 subfolders...')
    const level2Folders = await db
      .insert(folders)
      .values([
        // Work subfolders
        { name: 'Reports', parentId: workFolder.id },
        { name: 'Presentations', parentId: workFolder.id },
        { name: 'Contracts', parentId: workFolder.id },
        // Web Projects subfolders
        { name: 'React Apps', parentId: webProjectsFolder.id },
        { name: 'Vue Projects', parentId: webProjectsFolder.id },
        { name: 'Node APIs', parentId: webProjectsFolder.id },
      ])
      .returning()

    // Find Vue Projects folder for even deeper nesting
    const vueProjectsFolder = level2Folders.find(f => f.name === 'Vue Projects')!

    // Insert level 3 subfolders
    console.log('🗂️ Creating level 3 subfolders...')
    const level3Folders = await db
      .insert(folders)
      .values([
        { name: 'File Explorer', parentId: vueProjectsFolder.id },
        { name: 'E-commerce Site', parentId: vueProjectsFolder.id },
        { name: 'Blog Platform', parentId: vueProjectsFolder.id },
      ])
      .returning()

    // Insert sample files into the File Explorer folder
    const fileExplorerFolder = level3Folders.find(f => f.name === 'File Explorer')!

    console.log('📄 Adding sample files...')
    await db
      .insert(files)
      .values([
        { name: 'README.md', folderId: fileExplorerFolder.id, sizeBytes: 1024 },
        { name: 'package.json', folderId: fileExplorerFolder.id, sizeBytes: 2048 },
        { name: 'index.html', folderId: fileExplorerFolder.id, sizeBytes: 4096 },
        { name: 'App.vue', folderId: fileExplorerFolder.id, sizeBytes: 8192 },
      ])

    console.log('✅ Drizzle database seeded successfully!')

    // Show summary
    const totalFolders = await db.select().from(folders)
    const totalFiles = await db.select().from(files)

    console.log(`📊 Summary:`)
    console.log(`   📁 ${totalFolders.length} folders created`)
    console.log(`   📄 ${totalFiles.length} files created`)

  } catch (error) {
    console.error('❌ Drizzle seeding failed:', error)
    throw error
  }
}

// Run seeding if this file is executed directly
if (import.meta.main) {
  seedDrizzleDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}