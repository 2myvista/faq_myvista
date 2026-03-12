<!-- src/components/FolderTree.vue -->
<template>
  <ul class="folder-tree">
    <li v-for="item in items" :key="item.path" class="tree-item">
      <div 
        :class="['item-content', { 'selected': isSelected(item) }]"
        @click="handleItemClick(item)"
      >
        <div v-if="isFolder(item)" class="folder-item" @click="toggleFolder(item)">
          <span class="folder-icon">
            {{ item.isOpen ? '📂' : '📁' }}
          </span>
          <span class="item-name">{{ item.name }}</span>
          <span v-if="item.children.length" class="item-badge">
            {{ item.children.length }}
          </span>
        </div>
        
        <div v-else class="file-item">
          <span class="file-icon">📄</span>
          <span class="item-name">{{ item.name }}</span>
          <span v-if="item.tags.length" class="tag-badge">
            {{ item.tags.length }}
          </span>
        </div>
      </div>
      
      <FolderTree
        v-if="isFolder(item) && item.isOpen && item.children.length"
        :items="item.children"
        @select-item="handleChildSelect"
        class="nested-tree"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { useNotesStore } from '../stores/notes'
import type { TreeItem } from '../types/treeItem'
import { isFolder } from '../types/treeItem'

interface Props {
  items: TreeItem[]
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'select-item', item: TreeItem): void
}>()

const notesStore = useNotesStore()

function isSelected(item: TreeItem): boolean {
  return notesStore.currentItem?.path === item.path
}

function toggleFolder(item: TreeItem): void {
  if (isFolder(item)) {
    item.isOpen = !item.isOpen
  }
}

function handleItemClick(item: TreeItem): void {
  emit('select-item', item)
}

function handleChildSelect(item: TreeItem): void {
  emit('select-item', item)
}
</script>

<style scoped>
.folder-tree {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tree-item {
  margin: 2px 0;
}

.item-content {
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
}

.item-content:hover {
  background-color: #e9ecef;
}

.item-content.selected {
  background-color: #007bff;
  color: white;
}

.folder-item, .file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.folder-icon, .file-icon {
  font-size: 16px;
  min-width: 20px;
}

.item-name {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-badge, .tag-badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  background: #6c757d;
  color: white;
}

.item-content.selected .item-badge,
.item-content.selected .tag-badge {
  background: white;
  color: #007bff;
}

.nested-tree {
  margin-left: 20px;
  border-left: 1px dashed #dee2e6;
  padding-left: 10px;
}
</style>