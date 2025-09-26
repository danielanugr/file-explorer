<template>
  <div class="tree-node">
    <div
      class="node-content"
      :class="{
        selected: isSelected,
        'has-children': hasChildren
      }"
      :style="{ paddingLeft: `${level * 20 + 8}px` }"
      @click="onNodeClick"
    >
      <!-- Expand/Collapse Arrow -->
      <button
        v-if="hasChildren"
        class="expand-button"
        :class="{ expanded: isExpanded }"
        @click.stop="toggleExpanded"
      >
        <ChevronRightIcon />
      </button>

      <!-- Spacer for nodes without children -->
      <div v-else class="expand-spacer"></div>

      <!-- Folder Icon -->
      <div class="folder-icon">
        <FolderOpenIcon v-if="hasChildren && isExpanded" />
        <FolderClosedIcon v-else />
      </div>

      <!-- Folder Name -->
      <span class="folder-name">{{ folder.name }}</span>

      <!-- Children Count -->
      <span v-if="hasChildren" class="children-count">({{ folder.children?.length }})</span>
    </div>

    <!-- Children Nodes (with animation) -->
    <div v-if="hasChildren && isExpanded" class="children-container">
      <FolderTreeNode
        v-for="child in folder.children"
        :key="child.id"
        :folder="child"
        :level="level + 1"
        :selected-folder-id="selectedFolderId"
        :expanded-folders="expandedFolders"
        @select-folder="$emit('select-folder', $event)"
        @toggle-expand="$emit('toggle-expand', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FolderTree } from '../types/folder'
import ChevronRightIcon from '../assets/icons/chevron-right.svg'
import FolderOpenIcon from '../assets/icons/folder-open.svg'
import FolderClosedIcon from '../assets/icons/folder-closed.svg'

interface Props {
  folder: FolderTree
  level?: number
  selectedFolderId?: number | null
  expandedFolders?: Set<number>
}

interface Emits {
  (e: 'select-folder', folder: FolderTree): void
  (e: 'toggle-expand', folderId: number): void
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
  expandedFolders: () => new Set<number>()
})

const emit = defineEmits<Emits>()

const hasChildren = computed(() => {
  return props.folder.children && props.folder.children.length > 0
})

const isSelected = computed(() => {
  return props.selectedFolderId === props.folder.id
})

const isExpanded = computed(() => {
  return props.expandedFolders.has(props.folder.id)
})

function onNodeClick() {
  emit('select-folder', props.folder)
}

function toggleExpanded() {
  emit('toggle-expand', props.folder.id)
}
</script>

<style scoped>
.tree-node {
  user-select: none;
}

.node-content {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  margin: 1px 0;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
}

.node-content:hover {
  background-color: #f5f5f5;
}

.node-content.selected {
  background-color: #e3f2fd;
  border-left: 3px solid #2196f3;
  font-weight: 500;
}

.expand-button {
  background: none;
  border: none;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  color: #666;
  transition: all 0.2s ease;
  margin-right: 4px;
}

.expand-button:hover {
  background-color: #e0e0e0;
  color: #333;
}

.expand-button.expanded {
  transform: rotate(90deg);
}

.expand-button svg {
  width: 12px;
  height: 12px;
}

.expand-spacer {
  width: 24px;
  height: 20px;
}

.folder-icon {
  margin-right: 8px;
  display: flex;
  align-items: center;
}

.folder-icon svg {
  width: 16px;
  height: 16px;
}

.folder-name {
  flex: 1;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.children-count {
  font-size: 11px;
  color: #666;
  background-color: #f0f0f0;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 8px;
}

.children-container {
  overflow: hidden;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    max-height: 0;
    opacity: 0;
  }
  to {
    max-height: 1000px;
    opacity: 1;
  }
}

/* Hierarchy lines */
.node-content::before {
  content: '';
  position: absolute;
  left: calc(var(--level, 0) * 20px + 18px);
  top: 0;
  bottom: 50%;
  width: 1px;
  background-color: #ddd;
  z-index: 0;
}

.tree-node:last-child .node-content::before {
  bottom: 50%;
}
</style>