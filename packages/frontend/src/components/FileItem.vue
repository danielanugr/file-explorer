<template>
  <div
    class="file-item"
    :class="{ selected: isSelected }"
    @click="selectFile"
    @dblclick="openFile"
  >
    <!-- File Icon -->
    <div class="file-icon">
      <svg v-if="fileType === 'image'" width="20" height="20" viewBox="0 0 24 24">
        <path d="M21,19V5c0,-1.1 -0.9,-2 -2,-2H5c-1.1,0 -2,0.9 -2,2v14c0,1.1 0.9,2 2,2h14c1.1,0 2,-0.9 2,-2zM8.5,13.5l2.5,3.01L14.5,12l4.5,6H5l3.5,-4.5z" fill="#4CAF50"/>
      </svg>
      <svg v-else-if="fileType === 'code'" width="20" height="20" viewBox="0 0 24 24">
        <path d="M9.4,16.6L4.8,12l4.6,-4.6L8,6l-6,6l6,6L9.4,16.6zM14.6,16.6l4.6,-4.6l-4.6,-4.6L16,6l6,6l-6,6L14.6,16.6z" fill="#2196F3"/>
      </svg>
      <svg v-else-if="fileType === 'document'" width="20" height="20" viewBox="0 0 24 24">
        <path d="M6,2c-1.1,0 -2,0.9 -2,2v16c0,1.1 0.89,2 2,2h12c1.1,0 2,-0.9 2,-2V8l-6,-6H6zM13,9V3.5L18.5,9H13z" fill="#FF9800"/>
      </svg>
      <svg v-else-if="fileType === 'json'" width="20" height="20" viewBox="0 0 24 24">
        <path d="M5,3H7V5H5V10A2,2 0 0,1 3,12A2,2 0 0,1 5,14V19H7V21H5C3.93,20.73 3,20.1 3,19V15A2,2 0 0,0 1,13H0V11H1A2,2 0 0,0 3,9V5A2,2 0 0,1 5,3M19,3A2,2 0 0,1 21,5V9A2,2 0 0,0 23,11H24V13H23A2,2 0 0,0 21,15V19A2,2 0 0,1 19,21H17V19H19V14A2,2 0 0,1 21,12A2,2 0 0,1 19,10V5H17V3H19Z" fill="#9C27B0"/>
      </svg>
      <svg v-else width="20" height="20" viewBox="0 0 24 24">
        <path d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z" fill="#757575"/>
      </svg>
    </div>

    <!-- File Info -->
    <div class="file-info">
      <div class="file-name" :title="file.name">{{ file.name }}</div>
      <div class="file-details">
        <span class="file-size">{{ formatFileSize(file.sizeBytes || 0) }}</span>
        <span class="file-date">{{ formatDate(file.createdAt) }}</span>
      </div>
    </div>

    <!-- File Actions -->
    <div class="file-actions">
      <button class="action-button" @click.stop="downloadFile" title="Download">
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" fill="currentColor"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface File {
  id: number
  name: string
  folderId: number
  sizeBytes?: number
  createdAt: string
  updatedAt: string
}

interface Props {
  file: File
  isSelected?: boolean
}

interface Emits {
  (e: 'select-file', file: File): void
  (e: 'open-file', file: File): void
  (e: 'download-file', file: File): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const fileType = computed(() => {
  const extension = props.file.name.split('.').pop()?.toLowerCase()

  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
  const codeExtensions = ['js', 'ts', 'vue', 'jsx', 'tsx', 'css', 'scss', 'html']
  const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'md']

  if (imageExtensions.includes(extension || '')) return 'image'
  if (codeExtensions.includes(extension || '')) return 'code'
  if (documentExtensions.includes(extension || '')) return 'document'
  if (extension === 'json') return 'json'

  return 'unknown'
})

function selectFile() {
  emit('select-file', props.file)
}

function openFile() {
  emit('open-file', props.file)
}

function downloadFile() {
  emit('download-file', props.file)
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<style scoped>
.file-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
  background-color: white;
  transition: all 0.2s ease;
  cursor: pointer;
  gap: 0.75rem;
}

.file-item:hover {
  background-color: #f8f9fa;
  border-color: #2196f3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.1);
}

.file-item.selected {
  background-color: #e3f2fd;
  border-color: #2196f3;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
}

.file-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background-color: #f5f5f5;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9rem;
}

.file-details {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #6c757d;
}

.file-size {
  font-weight: 500;
}

.file-actions {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.file-item:hover .file-actions {
  opacity: 1;
}

.action-button {
  background: none;
  border: none;
  padding: 0.25rem;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s ease;
}

.action-button:hover {
  background-color: #e0e0e0;
  color: #2196f3;
}
</style>