<!-- src/components/FileList.vue -->
<template>
  <div class="file-list">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Загрузка файлов...</span>
    </div>
    
    <div v-else-if="files.length === 0" class="empty-state">
      <span>Файлы не найдены</span>
    </div>
    
    <div v-else class="files-container">
      <div
        v-for="file in files"
        :key="file.path"
        class="file-item"
        @click="$emit('select-file', file)"
        :class="{ 'selected': isSelected(file) }"
      >
        <div class="file-icon">📄</div>
        <div class="file-info">
          <div class="file-name">{{ file.name }}</div>
          <div v-if="file.tags.length" class="file-tags">
            <span
              v-for="tag in file.tags.slice(0, 2)"
              :key="tag"
              class="file-tag"
              :title="tag"
            >
              #{{ tag.split('/').pop() }}
            </span>
            <span v-if="file.tags.length > 2" class="more-tags">
              +{{ file.tags.length - 2 }}
            </span>
          </div>
          <div class="file-path">{{ file.path }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotesStore } from '../stores/notes'
import type { FileItem } from '../types/treeItem'

interface Props {
  files: FileItem[]
  loading?: boolean
}

defineProps<Props>()

defineEmits<{
  (e: 'select-file', file: FileItem): void
}>()

const notesStore = useNotesStore()

function isSelected(file: FileItem): boolean {
  return notesStore.currentItem?.path === file.path
}
</script>

<style scoped>
.file-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6c757d;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e9ecef;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6c757d;
  font-style: italic;
}

.files-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.file-item:hover {
  background: #f8f9fa;
  border-color: #007bff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.file-item.selected {
  background: #e7f1ff;
  border-color: #007bff;
}

.file-icon {
  font-size: 24px;
  display: flex;
  align-items: center;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 4px;
}

.file-tag {
  font-size: 11px;
  padding: 2px 6px;
  background: #e9ecef;
  color: #495057;
  border-radius: 10px;
  white-space: nowrap;
}

.more-tags {
  font-size: 11px;
  color: #6c757d;
  align-self: center;
}

.file-path {
  font-size: 11px;
  color: #6c757d;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>