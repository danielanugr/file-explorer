<template>
  <div id="app">
    <header class="header">
      <h1>📁 File Explorer</h1>
    </header>

    <div class="explorer-container">
      <!-- Left Panel - Folder Tree -->
      <div class="left-panel">
        <div class="panel-header">
          <h3>📂 Folders</h3>
        </div>
        <div class="panel-content">
          <FolderTreeComponent
            :folders="folderTree"
            :loading="loading"
            :error="error"
            :selected-folder-id="selectedFolder?.id"
            @select-folder="onFolderSelect"
            @retry="loadFolderTree"
          />
        </div>
      </div>

      <!-- Right Panel - Selected Folder Contents -->
      <div class="right-panel">
        <div class="panel-header">
          <h3>📄 Contents{{ selectedFolder ? ` - ${selectedFolder.name}` : '' }}</h3>
        </div>
        <div class="panel-content">
          <div v-if="!selectedFolder" class="placeholder">
            👈 Select a folder to view its contents
          </div>

          <div v-else-if="childrenLoading" class="loading">
            📁 Loading contents...
          </div>

          <div v-else>
            <!-- Folder Info Header -->
            <div class="folder-info">
              <div class="folder-details">
                <h4>📂 {{ selectedFolder.name }}</h4>
                <p class="folder-meta">
                  {{ folderStats.childrenCount }} folder{{ folderStats.childrenCount !== 1 ? 's' : '' }},
                  {{ folderStats.filesCount }} file{{ folderStats.filesCount !== 1 ? 's' : '' }}
                </p>
              </div>
            </div>

            <!-- Content Area -->
            <div class="content-area">
              <!-- Subfolders Grid -->
              <div v-if="selectedFolderChildren.length > 0" class="children-grid">
                <h5 class="section-title">📁 Folders</h5>
                <div
                  v-for="child in selectedFolderChildren"
                  :key="`folder-${child.id}`"
                  class="child-folder"
                  @click="navigateToChild(child)"
                >
                  <div class="folder-icon-large">📁</div>
                  <div class="folder-info-card">
                    <div class="folder-name">{{ child.name }}</div>
                    <div class="folder-date">{{ formatDate(child.createdAt) }}</div>
                  </div>
                </div>
              </div>

              <!-- Files List -->
              <div v-if="selectedFolderFiles.length > 0" class="files-section">
                <h5 class="section-title">📄 Files</h5>
                <div class="files-list">
                  <FileItem
                    v-for="file in selectedFolderFiles"
                    :key="`file-${file.id}`"
                    :file="file"
                    :is-selected="selectedFile?.id === file.id"
                    @select-file="onFileSelect"
                    @open-file="onFileOpen"
                    @download-file="onFileDownload"
                  />
                </div>
              </div>

              <!-- Empty State -->
              <div v-if="selectedFolderChildren.length === 0 && selectedFolderFiles.length === 0" class="empty">
                <div class="empty-icon">📂</div>
                <p>This folder is empty</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FolderTreeComponent from './components/FolderTree.vue'
import FileItem from './components/FileItem.vue'
import { folderService } from './services/folderService'
import type { FolderTree, Folder, File } from './types/folder'

const folderTree = ref<FolderTree[]>([])
const selectedFolder = ref<FolderTree | null>(null)
const selectedFolderChildren = ref<Folder[]>([])
const selectedFolderFiles = ref<File[]>([])
const selectedFile = ref<File | null>(null)
const folderStats = ref({ childrenCount: 0, filesCount: 0 })
const loading = ref(false)
const error = ref<string>('')
const childrenLoading = ref(false)

// Load folder tree on component mount
onMounted(async () => {
  await loadFolderTree()
})

async function loadFolderTree() {
  loading.value = true
  error.value = ''

  try {
    const response = await folderService.getFolderTree()
    if (response.success) {
      folderTree.value = response.data
    } else {
      error.value = response.error || 'Failed to load folders'
    }
  } catch (err) {
    error.value = 'Network error - make sure backend is running'
  } finally {
    loading.value = false
  }
}

async function onFolderSelect(folder: FolderTree) {
  selectedFolder.value = folder
  childrenLoading.value = true

  try {
    const response = await folderService.getFolderChildren(folder.id)
    if (response.success) {
      selectedFolderChildren.value = response.data.children
      selectedFolderFiles.value = response.data.files || []
      folderStats.value = response.data.stats || { childrenCount: 0, filesCount: 0 }
    } else {
      console.error('Failed to load folder contents:', response.error)
      selectedFolderChildren.value = []
      selectedFolderFiles.value = []
      folderStats.value = { childrenCount: 0, filesCount: 0 }
    }
  } catch (err) {
    console.error('Error loading folder contents:', err)
    selectedFolderChildren.value = []
    selectedFolderFiles.value = []
    folderStats.value = { childrenCount: 0, filesCount: 0 }
  } finally {
    childrenLoading.value = false
  }
}

function navigateToChild(child: Folder) {
  console.log('Navigate to child:', child.name)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// File handling functions
function onFileSelect(file: File) {
  selectedFile.value = file
  console.log('File selected:', file.name)
}

function onFileOpen(file: File) {
  console.log('Opening file:', file.name)
  // In a real app, you might open the file in a viewer or editor
}

function onFileDownload(file: File) {
  console.log('Downloading file:', file.name)
  // In a real app, you would implement file download functionality
}
</script>

<style scoped>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.explorer-container {
  display: flex;
  flex: 1;
  min-height: 0;
}

.left-panel, .right-panel {
  background-color: white;
  border-right: 1px solid #e1e5e9;
  display: flex;
  flex-direction: column;
}

.left-panel {
  width: 300px;
  min-width: 250px;
}

.right-panel {
  flex: 1;
  border-right: none;
}

.panel-header {
  background-color: #f8f9fa;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e1e5e9;
  font-weight: 600;
}

.panel-header h3 {
  margin: 0;
  font-size: 0.9rem;
  color: #495057;
}

.panel-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}


.loading, .placeholder {
  color: #6c757d;
  font-style: italic;
  text-align: center;
  margin-top: 2rem;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6c757d;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

.folder-info {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e1e5e9;
  padding: 1rem;
  margin: -1rem -1rem 1rem -1rem;
}

.folder-details h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

.folder-meta {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.children-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
  margin-top: 0;
}

.child-folder {
  background-color: white;
  border-radius: 12px;
  border: 1px solid #e1e5e9;
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  padding: 1rem;
}

.child-folder:hover {
  background-color: #f8f9fa;
  border-color: #2196f3;
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(33, 150, 243, 0.1);
}

.folder-icon-large {
  font-size: 2rem;
  margin-right: 1rem;
  opacity: 0.7;
}

.folder-info-card {
  flex: 1;
}

.folder-name {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 0.25rem;
  font-size: 0.95rem;
}

.folder-date {
  color: #6c757d;
  font-size: 0.8rem;
}

/* New styles for file display */
.content-area {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e1e5e9;
}

.files-section {
  width: 100%;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>