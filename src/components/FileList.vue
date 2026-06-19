<!-- src/components/FileList.vue -->
<template>
<!-- Заголовок панели -->
	<div class="panel-header">
		<h3>{{ panelTitle }}</h3>
	</div>

	<!-- Если ищем по файлам или показываем файлы -->
	<div class="files-panel">
		<!-- Заголовок с информацией -->
		<div class="files-header">
			<div class="filters-info">
				<span v-if="notesStore.selectedTag" class="filter-badge">
					Тег: #{{ notesStore.selectedTag }}
					<button @click="emit('clear-tag-filter')">×</button>
				</span>
			</div>
			<div class="files-count">
				{{displayedFiles.length}}  файлов
			</div>
		</div>

		<!-- Список файлов -->
		<div class="files-list">
			<div v-if="notesStore.isLoading" class="loading-files">
				Загрузка...
			</div>

			<div v-else-if="displayedFiles.length === 0" class="no-files">
				<template v-if="isSearchActive && searchMode === 'files'">
					Ничего не найдено по запросу "{{ searchQuery }}"
				</template>
				<template v-else-if="notesStore.selectedTag">
					Нет файлов с тегом #{{ notesStore.selectedTag }}
				</template>
				<template v-else>
					Файлы не найдены
				</template>
			</div>

			<div v-else class="files-container">
				<div v-for="file in displayedFiles" :key="file.path" class="file-card"
					:class="{ 'selected': isFileSelected(file) }" @click="emit('select-file', file)">
					<div class="file-icon">📄</div>
					<div class="file-info">
						<div class="file-name">{{ file.name }}</div>
						<div v-if="file.tags.length" class="file-tags">
							<span v-for="tag in file.tags.slice(0, 2)" :key="tag" class="file-tag" :title="tag">
								#{{ tag.split('/').pop() }}
							</span>
							<span v-if="file.tags.length > 2" class="more-tags">
								+{{ file.tags.length - 2 }}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useNotesStore } from '../stores/notes'
import type { FileItem } from '../types/treeItem'

interface Props {
	panelTitle: string
	isSearchActive: boolean
	searchMode: "tags" | "files"
	displayedFiles: FileItem[]
	searchQuery: string

}

const { isSearchActive, searchMode, panelTitle, displayedFiles, searchQuery} = defineProps<Props>()


const emit = defineEmits<{
  (e: 'select-file', file: FileItem): void
  (e: 'clear-tag-filter'): void
}>()

const notesStore = useNotesStore()

/* function isSelected(file: FileItem): boolean {
  return notesStore.currentItem?.path === file.path
} */
/*
const displayedFiles = computed(() => {
	// Если активен поиск по файлам
	if (isSearchActive && searchMode.value === 'files') {
		return searchFilesResults.value
	}

	// Если выбран тег
	if (notesStore.selectedTag) {
		return notesStore.filteredFiles
	}

	// Все файлы
	return notesStore.allFiles
})

const searchFilesResults = computed(() => {
	if (!isSearchActive.value || searchMode.value !== 'files') return []

	const query = searchQuery.value.toLowerCase().trim()
	return notesStore.allFiles.filter(file => {
		// Поиск по названию файла
		if (file.name.toLowerCase().includes(query)) {
			return true
		}

		// Поиск по тегам
		if (file.tags?.some(tag =>
			tag.toLowerCase().includes(query)
		)) {
			return true
		}

		// Поиск по содержимому
		if (file.content && file.content.toLowerCase().includes(query)) {
			return true
		}

		return false
	})
})
*/
function isFileSelected(file: FileItem): boolean {
	return notesStore.currentItem?.path === file.path
}



</script>

<style scoped>
.panel-header {
	padding: 1rem;
	border-bottom: 1px solid #dee2e6;
	background: #f0f1f1;
	height: 35px;
}
.panel-header h3 {
	margin: 0.25rem 0.5rem;
	font-size: 1rem;
	font-weight: 600;
}
.files-panel {
	display: flex;
	flex-direction: column;
	height: calc(100vh - 150px);
}

.files-header {
	padding: 1rem;
	border-bottom: 1px solid #dee2e6;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.filters-info {
	display: flex;
	gap: 0.5rem;
}

.filter-badge {
	display: inline-flex;
	align-items: center;
	gap: 0.25rem;
	padding: 0.25rem 0.5rem;
	background: #e3f2fd;
	border: 1px solid #bbdefb;
	border-radius: 4px;
	font-size: 0.85rem;
	color: #1976d2;
}

.filter-badge.search {
	background: #f3e5f5;
	border-color: #e1bee7;
	color: #7b1fa2;
}

.filter-badge button {
	padding: 0 0.25rem;
	border: none;
	background: transparent;
	cursor: pointer;
	color: inherit;
	font-size: 1rem;
	line-height: 1;
}

.files-count {
	font-size: 0.9rem;
	color: #6c757d;
}

.files-list {
	flex: 1;
	overflow-y: auto;
}

.loading-files,
.no-files {
	padding: 2rem;
	text-align: center;
	color: #6c757d;
}

.files-container {
	padding: 0.5rem;
}

.file-card {
	padding: 0.75rem;
	border: 1px solid #dee2e6;
	border-radius: 6px;
	margin-bottom: 0.5rem;
	cursor: pointer;
	display: flex;
	gap: 0.75rem;
	transition: all 0.2s;
}

.file-card:hover {
	background: #f8f9fa;
	border-color: #3498db;
}

.file-card.selected {
	background: #e3f2fd;
	border-color: #3498db;
}

.file-icon {
	font-size: 20px;
}

.file-info {
	flex: 1;
	min-width: 0;
}

.file-name {
	font-weight: 600;
	font-size: 0.9rem;
	margin-bottom: 0.25rem;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.file-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 0.25rem;
}

.file-tag {
	font-size: 0.7rem;
	padding: 0.125rem 0.375rem;
	background: #e9ecef;
	color: #495057;
	border-radius: 10px;
}

.more-tags {
	font-size: 0.7rem;
	color: #6c757d;
	align-self: center;
}
</style>