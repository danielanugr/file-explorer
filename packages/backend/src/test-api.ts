
const BASE_URL = 'http://localhost:3000'

async function testAPI() {
  console.log('🧪 Testing File Explorer API...\n')

  try {
    console.log('1. Testing root endpoint:')
    const rootResponse = await fetch(`${BASE_URL}/`)
    const rootData = await rootResponse.json()
    console.log('✅ Root endpoint:', rootData.message)
    console.log('📋 Available endpoints:', rootData.endpoints)

    console.log('\n2. Testing folder tree endpoint:')
    const treeResponse = await fetch(`${BASE_URL}/api/folders/tree`)
    const treeData = await treeResponse.json()

    if (treeData.success) {
      console.log('✅ Folder tree loaded successfully')
      console.log(`📁 Found ${treeData.data.length} root folders`)

      treeData.data.forEach((folder: any) => {
        console.log(`  📂 ${folder.name} (${folder.children?.length || 0} subfolders)`)
      })
    } else {
      console.log('❌ Failed to load folder tree:', treeData.error)
    }

    console.log('\n3. Testing folder children endpoint:')
    const childrenResponse = await fetch(`${BASE_URL}/api/folders/1/children`)
    const childrenData = await childrenResponse.json()

    if (childrenData.success) {
      console.log('✅ Folder children loaded successfully')
      console.log(`📂 Folder: ${childrenData.data.folder.name}`)
      console.log(`📁 Children: ${childrenData.data.children.length} items`)
    } else {
      console.log('❌ Failed to load folder children:', childrenData.error)
    }

  } catch (error) {
    console.log('❌ API test failed. Make sure the server is running.')
    console.log('   Run: bun dev:backend')
    console.log('   Error:', error)
  }
}

if (import.meta.main) {
  testAPI()
}