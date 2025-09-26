<template>
  <div class="search-container">
    <div class="search-bar">
      <div class="search-input-wrapper">
        <SearchIcon class="search-icon" />
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          placeholder="Search folders and files..."
          class="search-input"
          @input="onSearchInput"
          @keyup.enter="performSearch"
          @keyup.escape="clearSearch"
        />
        <button
          v-if="searchQuery"
          class="clear-button"
          @click="clearSearch"
          title="Clear search"
        >
          <CloseIcon />
        </button>
      </div>
    </div>

    <!-- Search Results -->
    <div v-if="showResults" class="search-results">
      <div v-if="isSearching" class="search-status">
        <div class="loading-spinner"></div>
        <span>Searching...</span>
      </div>

      <div v-else-if="searchResults && searchResults.counts.total > 0" class="results-container">
        <div class="results-header">
          <span class="results-count">
            {{ searchResults.counts.total }} result{{ searchResults.counts.total !== 1 ? 's' : '' }}
            for "{{ searchResults.query }}"
          </span>
        </div>

        <!-- Folders Results -->
        <div v-if="searchResults.results.folders.length > 0" class="results-section">
          <h4 class="section-title">📁 Folders ({{ searchResults.results.folders.length }})</h4>
          <div class="results-list">
            <div
              v-for="folder in searchResults.results.folders"
              :key="`folder-${folder.id}`"
              class="result-item folder-result"
              @click="selectFolder(folder)"
            >
              <div class="result-icon">📁</div>
              <div class="result-info">
                <div class="result-name">{{ folder.name }}</div>
                <div class="result-meta">
                  Folder • {{ formatDate(folder.createdAt) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Files Results -->
        <div v-if="searchResults.results.files.length > 0" class="results-section">
          <h4 class="section-title">📄 Files ({{ searchResults.results.files.length }})</h4>
          <div class="results-list">
            <div
              v-for="file in searchResults.results.files"
              :key="`file-${file.id}`"
              class="result-item file-result"
              @click="selectFile(file)"
            >
              <div class="result-icon">📄</div>
              <div class="result-info">
                <div class="result-name">{{ file.name }}</div>
                <div class="result-meta">
                  {{ formatFileSize(file.sizeBytes || 0) }} • {{ formatDate(file.createdAt) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="searchResults && searchResults.counts.total === 0" class="no-results">
        <div class="no-results-icon">🔍</div>
        <p>No results found for "{{ searchResults.query }}"</p>
        <p class="no-results-hint">Try different keywords or check spelling</p>
      </div>

      <div v-if="searchError" class="search-error">
        <div class="error-icon">⚠️</div>
        <p>{{ searchError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { folderService } from '../services/folderService'
import type { SearchResponse, Folder, File } from '../types/folder'
import SearchIcon from '../assets/icons/search.svg'
import CloseIcon from '../assets/icons/close.svg'

interface Emits {
  (e: 'select-folder', folder: Folder): void
  (e: 'select-file', file: File): void
}

const emit = defineEmits<Emits>()

const searchInput = ref<HTMLInputElement>()
const searchQuery = ref('')
const searchResults = ref<SearchResponse | null>(null)
const showResults = ref(false)
const isSearching = ref(false)
const searchError = ref('')

let searchTimeout: number | null = null

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})

function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement
  const searchContainer = target.closest('.search-container')
  if (!searchContainer) {
    showResults.value = false
  }
}

function onSearchInput() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (searchQuery.value.trim().length === 0) {
    showResults.value = false
    searchResults.value = null
    return
  }

  if (searchQuery.value.trim().length < 2) {
    return
  }

  searchTimeout = setTimeout(() => {
    performSearch()
  }, 300)
}

async function performSearch() {
  if (!searchQuery.value.trim() || searchQuery.value.trim().length < 2) {
    return
  }

  isSearching.value = true
  searchError.value = ''
  showResults.value = true

  try {
    const response = await folderService.searchFoldersAndFiles(searchQuery.value.trim())

    if (response.success) {
      searchResults.value = response.data
    } else {
      searchError.value = response.error || 'Failed to search'
      searchResults.value = null
    }
  } catch (error) {
    searchError.value = 'Network error - make sure backend is running'
    searchResults.value = null
  } finally {
    isSearching.value = false
  }
}

function clearSearch() {
  searchQuery.value = ''
  searchResults.value = null
  showResults.value = false
  searchError.value = ''
  searchInput.value?.focus()
}

function selectFolder(folder: Folder) {
  emit('select-folder', folder)
  showResults.value = false
}

function selectFile(file: File) {
  emit('select-file', file)
  showResults.value = false
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
</script>

<style scoped>
.search-container {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.search-bar {
  position: relative;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #6c757d;
  z-index: 1;
  width: 16px;
  height: 16px;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 40px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background-color: white;
}

.search-input:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.clear-button {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.clear-button:hover {
  color: #2196f3;
  background-color: #f0f0f0;
}

.clear-button svg {
  width: 14px;
  height: 14px;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  margin-top: 4px;
}

.search-status {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 8px;
  color: #6c757d;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e1e5e9;
  border-top: 2px solid #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.results-container {
  padding: 8px 0;
}

.results-header {
  padding: 8px 16px;
  border-bottom: 1px solid #e1e5e9;
  background-color: #f8f9fa;
}

.results-count {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
}

.results-section {
  border-bottom: 1px solid #f0f0f0;
}

.results-section:last-child {
  border-bottom: none;
}

.section-title {
  margin: 0;
  padding: 12px 16px 8px 16px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #495057;
  background-color: #f8f9fa;
}

.results-list {
  padding: 0 8px;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 8px;
  margin: 2px 0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 10px;
}

.result-item:hover {
  background-color: #f0f4ff;
}

.result-icon {
  font-size: 16px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-name {
  font-weight: 500;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9rem;
}

.result-meta {
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 2px;
}

.no-results {
  padding: 32px 16px;
  text-align: center;
  color: #6c757d;
}

.no-results-icon {
  font-size: 2rem;
  margin-bottom: 8px;
  opacity: 0.5;
}

.no-results p {
  margin: 4px 0;
}

.no-results-hint {
  font-size: 0.85rem;
  opacity: 0.8;
}

.search-error {
  padding: 16px;
  text-align: center;
  color: #dc3545;
}

.error-icon {
  font-size: 1.5rem;
  margin-bottom: 8px;
}
</style>