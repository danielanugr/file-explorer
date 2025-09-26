<template>
  <div class="folder-tree">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <span>Loading folder structure...</span>
    </div>

    <div v-else-if="error" class="error">
      <div class="error-icon">⚠️</div>
      <div class="error-message">
        <strong>Failed to load folders</strong>
        <p>{{ error }}</p>
        <button @click="$emit('retry')" class="retry-button">
          🔄 Retry
        </button>
      </div>
    </div>

    <div v-else-if="folders.length === 0" class="empty">
      <div class="empty-icon">📂</div>
      <p>No folders found</p>
    </div>

    <div v-else class="tree-container">
      <!-- Tree Actions -->
      <div class="tree-actions">
        <button @click="expandAll" class="action-button" title="Expand All">
          📂 Expand All
        </button>
        <button @click="collapseAll" class="action-button" title="Collapse All">
          📁 Collapse All
        </button>
      </div>

      <!-- Tree Nodes -->
      <div class="tree-nodes">
        <FolderTreeNode
          v-for="folder in folders"
          :key="folder.id"
          :folder="folder"
          :level="0"
          :selected-folder-id="selectedFolderId"
          :expanded-folders="expandedFolders"
          @select-folder="$emit('select-folder', $event)"
          @toggle-expand="toggleFolderExpansion"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import FolderTreeNode from './FolderTreeNode.vue'
import type { FolderTree } from '../types/folder'

interface Props {
  folders: FolderTree[]
  loading?: boolean
  error?: string
  selectedFolderId?: number | null
}

interface Emits {
  (e: 'select-folder', folder: FolderTree): void
  (e: 'retry'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const expandedFolders = ref(new Set<number>())

// Watch for folder changes and auto-expand root folders
watch(() => props.folders, (newFolders) => {
  if (newFolders.length > 0) {
    // Auto-expand root folders on initial load
    newFolders.forEach(folder => {
      if (folder.children && folder.children.length > 0) {
        expandedFolders.value.add(folder.id)
      }
    })
  }
}, { immediate: true })

function toggleFolderExpansion(folderId: number) {
  if (expandedFolders.value.has(folderId)) {
    expandedFolders.value.delete(folderId)
  } else {
    expandedFolders.value.add(folderId)
  }

  // Trigger reactivity
  expandedFolders.value = new Set(expandedFolders.value)
}

function expandAll() {
  const allFolderIds = new Set<number>()

  function collectIds(folders: FolderTree[]) {
    folders.forEach(folder => {
      if (folder.children && folder.children.length > 0) {
        allFolderIds.add(folder.id)
        collectIds(folder.children)
      }
    })
  }

  collectIds(props.folders)
  expandedFolders.value = allFolderIds
}

function collapseAll() {
  expandedFolders.value = new Set<number>()
}
</script>

<style scoped>
.folder-tree {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #666;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e0e0e0;
  border-top: 2px solid #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #ffebee;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  margin: 1rem;
  color: #c62828;
}

.error-icon {
  font-size: 1.5rem;
  margin-right: 1rem;
}

.error-message strong {
  display: block;
  margin-bottom: 0.5rem;
}

.error-message p {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
}

.retry-button {
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #1976d2;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #666;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.tree-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.tree-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fafafa;
}

.action-button {
  background: none;
  border: 1px solid #ddd;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  color: #666;
  transition: all 0.2s ease;
}

.action-button:hover {
  background-color: #e3f2fd;
  border-color: #2196f3;
  color: #2196f3;
}

.tree-nodes {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

/* Custom scrollbar */
.tree-nodes::-webkit-scrollbar {
  width: 8px;
}

.tree-nodes::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.tree-nodes::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.tree-nodes::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>