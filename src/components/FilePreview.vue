<!-- src/components/FilePreview.vue -->
<template>
  <div class="file-preview">
    <div v-if="!file" class="no-file">
      <p>Выберите файл для просмотра</p>
    </div>
    
    <div v-else class="preview-content">
      <!-- Теги файла -->
      <div class="file-tags-section">
        <h4>Теги файла ({{ file.tags.length }}):</h4>
        <div class="tags-list">
          <span
            v-for="tag in file.tags"
            :key="tag"
            class="tag"
            @click="$emit('tag-click', tag)"
            :title="tag"
          >
            #{{ tag }}
          </span>
        </div>
      </div>
      
      <!-- Группированные теги -->
      <div 
        v-for="(groupTags, groupName) in file.groupedTags" 
        :key="groupName"
        class="tag-group"
      >
        <h5>{{ groupName }}:</h5>
        <div class="group-tags">
          <span
            v-for="tag in groupTags"
            :key="tag.full"
            class="group-tag"
            @click="$emit('tag-click', tag.full)"
            :title="tag.full"
          >
            {{ tag.display }}
          </span>
        </div>
      </div>
      
      <!-- Контент файла -->
      <div class="file-content-section">
        <div class="content-header">
          <h4>Содержимое:</h4>
          <button 
            @click="showRaw = !showRaw" 
            class="view-toggle"
          >
            {{ showRaw ? 'Просмотр' : 'Исходник' }}
          </button>
        </div>
        
        <div v-if="showRaw" class="raw-content">
          <pre>{{ file.content }}</pre>
        </div>
        <div v-else class="rendered-content">
          <pre class="markdown-content">{{ file.content }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FileItem } from '../types/treeItem'

interface Props {
  file: FileItem | null
}

defineProps<Props>()

defineEmits<{
  (e: 'tag-click', tag: string): void
}>()

const showRaw = ref(false)
</script>

<style scoped>
.file-preview {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.no-file {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
  font-style: italic;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.file-tags-section h4,
.tag-group h5,
.content-header h4 {
  margin: 0 0 0.5rem 0;
  font-size: 14px;
  color: #495057;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: #007bff;
  color: white;
  border-radius: 15px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tag:hover {
  background: #0056b3;
}

.tag-group {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.group-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.group-tag {
  padding: 0.25rem 0.5rem;
  background: white;
  color: #495057;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.group-tag:hover {
  background: #e9ecef;
  border-color: #ced4da;
}

.file-content-section {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.view-toggle {
  padding: 0.25rem 0.75rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.view-toggle:hover {
  background: #545b62;
}

.raw-content,
.rendered-content {
  padding: 1rem;
  max-height: 500px;
  overflow-y: auto;
}

.raw-content pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #333;
}

.markdown-content {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #2c3e50;
}
</style>