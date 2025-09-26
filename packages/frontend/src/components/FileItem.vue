<template>
  <div
    class="file-item"
    :class="{ selected: isSelected }"
    @click="selectFile"
    @dblclick="openFile"
  >
    <!-- File Icon -->
    <div class="file-icon">
      <FileImageIcon v-if="fileType === 'image'" />
      <FileCodeIcon v-else-if="fileType === 'code'" />
      <FileDocumentIcon v-else-if="fileType === 'document'" />
      <FileJsonIcon v-else-if="fileType === 'json'" />
      <FileDefaultIcon v-else />
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
        <DownloadIcon />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FileImageIcon from '../assets/icons/file-image.svg'
import FileCodeIcon from '../assets/icons/file-code.svg'
import FileDocumentIcon from '../assets/icons/file-document.svg'
import FileJsonIcon from '../assets/icons/file-json.svg'
import FileDefaultIcon from '../assets/icons/file-default.svg'
import DownloadIcon from '../assets/icons/download.svg'

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

.file-icon svg {
  width: 20px;
  height: 20px;
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

.action-button svg {
  width: 16px;
  height: 16px;
}
</style>