<!-- src/components/FilePreview.vue -->
<template>
<div v-if="selectedFile" class="file-content-panel">
		<div class="content-header">
			<h2>{{ selectedFile.name }}</h2>
			<div class="content-actions">
				<button @click="emit('close-file')" class="close-btn">
					× Закрыть
				</button>
			</div>
		</div>
		<!-- Содержимое файла -->
		<div class="file-content">
			<div class="content-toolbar">
				<button @click="viewMode = viewMode === 'preview' ? 'raw' : 'preview'" class="view-toggle">
					{{ viewMode === 'preview' ? '📝 Исходник' : '👁️ Просмотр' }}
				</button>
			</div>

			<div v-if="viewMode === 'raw'" class="raw-content">
				<pre>{{ selectedFile.content }}</pre>
			</div>
			<div v-else class="preview-content">
				<pre class="markdown-content">{{ selectedFile.content }}</pre>
			</div>
		</div>

		<!-- Теги файла -->
		<div class="file-tags-section">
			<!-- <h3>Теги файла:</h3> -->
			<div class="tags-list">
				<span v-for="tag in selectedFile.tags" :key="tag" class="tag" @click="emit('tag-click',tag)" :title="tag">
					#{{ tag }}
				</span>
			</div>

			<!-- Группированные теги -->
			<!-- <div v-for="(groupTags, groupName) in selectedFile.groupedTags" :key="groupName" class="tag-group">
				<h4>{{ groupName }}:</h4>
				<div class="group-tags">
					<span v-for="tag in groupTags" :key="tag.full" class="group-tag" @click="emit('tag-click', tag.full)"
						:title="tag.full">
						{{ tag.display }}
					</span>
				</div>
			</div> -->
		</div>

	</div>
<!-- Если файл не выбран - показываем информационное сообщение -->
	<div v-else class="empty-content">
		<div class="empty-message">
			<div v-if="isLoading" class="loading-files">
				Загрузка...
			</div>
			<div v-else>
				<h3>Заметка не выбрана</h3>
				<p>Нажмите на любой файл -></p>
			</div>
		</div>
	</div>	
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FileItem } from '../types/treeItem'

interface Props {
	selectedFile: FileItem | null
  	isLoading: boolean
}

defineProps<Props>()

const emit = defineEmits<{
	(e: 'close-file'): void
  	(e: 'tag-click', tag: string): void

}>()

const viewMode = ref<'preview' | 'raw'>('preview')
//const showRaw = ref(false)
</script>

<style scoped>
.file-content-panel {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.content-header {
	padding: 1rem;
	border-bottom: 1px solid #dee2e6;
	background: #f0f1f1;
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 35px;
}

.content-header h2 {
	margin: 0;
	font-size: 1.25rem;
	color: #2c3e50;
}

.content-actions {
	display: flex;
	gap: 0.5rem;
}

.close-btn {
	padding: 0.5rem 1rem;
	border: none;
	background: #e74c3c;
	color: white;
	border-radius: 4px;
	cursor: pointer;
	font-size: 0.9rem;
}

.close-btn:hover {
	background: #c0392b;
}

.file-tags-section {
	padding: 1rem;
	border-top: 1px solid #dee2e6;
	overflow: hidden;
}

.file-tags-section h3 {
	margin: 0 0 0.5rem 0;
	font-size: 1rem;
	color: #2c3e50;
}

.tags-list {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	margin-bottom: 1rem;
}

.tag {
	padding: 0.25rem 0.75rem;
	background: #3498db;
	color: white;
	border-radius: 15px;
	font-size: 0.9rem;
	cursor: pointer;
}

.tag:hover {
	background: #2980b9;
}

.tag-group {
	margin-bottom: 1rem;
}

.tag-group h4 {
	margin: 0 0 0.5rem 0;
	font-size: 0.9rem;
	color: #6c757d;
}

.tag-group h4:hover {
	cursor: progress;
	color: red;
}

.group-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}

.group-tag {
	padding: 0.25rem 0.5rem;
	background: #ecf0f1;
	color: #2c3e50;
	border-radius: 12px;
	font-size: 0.85rem;
	cursor: pointer;
}

.group-tag:hover {
	background: #bdc3c7;
}

.file-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.content-toolbar {
	padding: 0.5rem 1rem;
	border-bottom: 1px solid #dee2e6;
	background: #f8f9fa;
}

.view-toggle {
	padding: 0.5rem 1rem;
	border: 1px solid #dee2e6;
	background: white;
	border-radius: 4px;
	cursor: pointer;
	font-size: 0.9rem;
}

.view-toggle:hover {
	background: #f8f9fa;
}

.raw-content,
.preview-content {
	flex: 1;
	overflow-y: auto;
	padding: 1rem;
}

.raw-content pre {
	margin: 0;
	font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
	font-size: 14px;
	line-height: 1.5;
	white-space: pre-wrap;
	word-wrap: break-word;
}

.markdown-content {
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	font-size: 16px;
	line-height: 1.6;
	white-space: pre-wrap;
	word-wrap: break-word;
}

.empty-content {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #6c757d;
}

.empty-message {
	text-align: center;
	max-width: 400px;
}

.empty-icon {
	font-size: 48px;
	margin-bottom: 1rem;
}

.empty-message h3 {
	margin: 0 0 0.5rem 0;
	font-size: 1.5rem;
	color: #2c3e50;
}

.empty-message p {
	margin: 0;
	font-size: 1rem;
	line-height: 1.5;
}
</style>