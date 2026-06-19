<!-- src/components/TagCloud.vue -->
<template>
	<div class="tags-panel">
	<!-- Если активен поиск по тегам -->
		<div class="panel-header">
			<h3>{{ panelTitle }}</h3>
		</div>
		<div v-if="isSearchActive && searchMode === 'tags'" class="search-tags-section">
			<div class="files-header">
				<div class="files-count">
					{{ searchTagsResults.length }} файлов
				</div>	
			</div>	
			<div v-for="file in searchTagsResults" :key="file.path" class="file-card" @click="emit('select-file', file)" >
					<div class="file-icon">📄</div>
					<div class="file-info">
						<div class="file-name">{{ file.name }}</div>
						<div v-if="file.displayTags.length" class="file-tags">
							<span v-for="tag in file.displayTags" :key="tag.raw" class="file-tag" :title="tag.raw" v-html="tag.html"></span>
							<span v-if="file.tags.length > file.displayTags.length" class="more-tags">
								+{{ file.tags.length - file.displayTags.length }}
							</span>
						</div>
					</div>
			</div>
		</div>

		<!-- Все теги (если не ищем) -->
		<div v-else class="tags-section">
			<div v-if="notesStore.isLoading" class="loading-files">
				Загрузка...
			</div>
			<div v-else>
				<h4 @click="toggleTags">Все теги ({{ notesStore.allTags.length }})</h4>
				<div class="tag-cloud" v-if="isTagsActive">
					<span v-for="tag in notesStore.allTags" :key="tag" class="tag-cloud-item"
						:class="{ 'active': notesStore.selectedTag === tag }" @click="emit('select-tag', tag)" :title="tag">
						#{{ tag }}
					</span>
				</div>
			</div>
		</div>

		<!-- Группированные теги (если не ищем) -->
		<div v-if="(!isSearchActive || searchMode !== 'tags') && !notesStore.isLoading" class="tag-groups-section">
			<h4>Группы тегов</h4>
			<div v-for="(groupTags, groupName) in notesStore.groupedTags" :key="groupName" class="tag-group-section">
				<h5>{{ groupName }}</h5>
				<div class="tag-group-items">
					<span v-for="tag in groupTags" :key="tag.full" class="tag-group-item"
						:class="{ 'active': notesStore.selectedTag === tag.full }" @click="emit('select-tag', tag.full)"
						:title="tag.full">
						{{ tag.display }}
					</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNotesStore } from '../stores/notes'
import type { FileItem } from '../types/treeItem'

interface Props {
	isSearchActive: boolean
	searchMode: "tags" | "files"
	searchTagsResults: FileItem[]
	panelTitle: string
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'select-tag', tag: string): void
  (e: 'select-file', file: FileItem): void
}>()

const notesStore = useNotesStore();
// Теги свернуты?
const isTagsActive = ref(false);

function toggleTags(): void {
	isTagsActive.value = !isTagsActive.value
}


</script>

<style scoped>
/* Панель теги */
.tags-panel {
	/*padding: 1rem;*/
	overflow-y: auto;
	height: calc(100vh - 150px);
}

.search-tags-section {
	margin-bottom: 1.5rem;
}

.search-tags-section h4 {
	margin: 0 0 0.5rem 0;
	font-size: 0.9rem;
	color: #6c757d;
}

.tags-section {
	margin-bottom: 1.5rem;
}

.tags-section h4 {
	margin: 0 0 0.5rem 0;
	font-size: 0.9rem;
	color: #6c757d;
}

.tags-section h4:hover {
	color: red;
	cursor: pointer;
}

.tag-cloud {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}

.tag-cloud-item {
	padding: 0.25rem 0.75rem;
	background: #e9ecef;
	color: #495057;
	border-radius: 15px;
	font-size: 0.85rem;
	cursor: pointer;
}

.tag-cloud-item:hover {
	background: #dee2e6;
}

.tag-cloud-item.active {
	background: #3498db;
	color: white;
}

.tag-groups-section {
	margin-top: 1.5rem;
}

.tag-groups-section h4 {
	margin: 0 0 1rem 0;
	font-size: 0.9rem;
	color: #6c757d;
}

.tag-groups-section h4:hover {
	margin: 0 0 1rem 0;
	font-size: 0.9rem;
	color: red;
	cursor: pointer;
}

.tag-group-section {
	margin-bottom: 1rem;
}

.tag-group-section h5 {
	margin: 0 0 0.5rem 0;
	font-size: 0.8rem;
	color: #495057;
	font-weight: 600;
}

.tag-group-items {
	display: flex;
	flex-wrap: wrap;
	gap: 0.375rem;
}

.tag-group-item {
	padding: 0.25rem 0.5rem;
	background: #f8f9fa;
	color: #495057;
	border: 1px solid #dee2e6;
	border-radius: 12px;
	font-size: 0.8rem;
	cursor: pointer;
}

.tag-group-item:hover {
	background: #e9ecef;
}

.tag-group-item.active {
	background: #27ae60;
	color: white;
	border-color: #27ae60;
}

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

.files-header {
	padding: 1rem;
	border-bottom: 1px solid #dee2e6;
	display: flex;
	justify-content: right;

}

.files-count {
	font-size: 0.9rem;
	color: #6c757d;
}
.file-tag :deep(span) {
	color: red;
	font-weight: 600;
}
</style>