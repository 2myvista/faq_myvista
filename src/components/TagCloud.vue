<!-- src/components/TagCloud.vue -->
<template>
	<!-- Если активен поиск по тегам -->
	<div v-if="isSearchActive && searchMode === 'tags'" class="search-tags-section">
		<h4>Результаты поиска тегов ({{ searchTagsResults.length }})</h4>
		<div class="tag-cloud">
			<span v-for="tag in searchTagsResults" :key="tag" class="tag-cloud-item"
				:class="{ 'active': notesStore.selectedTag === tag }" @click="emit('select-tag',tag)" :title="tag">
				#{{ tag }}
			</span>
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

</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useNotesStore } from '../stores/notes'
interface Props {
	isSearchActive: boolean
	searchMode: "tags" | "files"
	searchTagsResults: string[]
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'select-tag', tag: string): void
}>()

const notesStore = useNotesStore();
// Теги свернуты?
const isTagsActive = ref(false);

function toggleTags(): void {
	isTagsActive.value = !isTagsActive.value
}


</script>

<style scoped>
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
</style>