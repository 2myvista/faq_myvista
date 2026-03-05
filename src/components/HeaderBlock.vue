<!-- src/components/HeaderBlock.vue -->
<template>
	<header class="app-header">
		<div class="header-left">
			<h1>Notes Viewer</h1>
		</div>

		<div class="header-right">
			<!-- Поиск и вкладки -->
			<div class="search-tabs-container">
				<!-- Строка поиска -->
				<div class="search-box">
					<input v-model="localSearchQuery" placeholder="Поиск по названию или тегу..."
						@input="handleSearchInput" @keyup.enter="performSearch" ref="searchInput" />
					<button v-if="localSearchQuery" @click="clearSearch" class="clear-search" title="Очистить поиск">
						×
					</button>
					<button @click="performSearch" class="search-btn" :disabled="!localSearchQuery.trim()"
						title="Искать">
						🔍
					</button>
				</div>

				<!-- Вкладки справа от поиска -->
				<div class="search-tabs">
					<button @click="setSearchMode('files')" :class="{ active: localSearchMode === 'files' }"
						class="search-tab">
						Файлы
					</button>
					<button @click="setSearchMode('tags')" :class="{ active: localSearchMode === 'tags' }"
						class="search-tab">
						Теги
					</button>
				</div>
			</div>

			<button @click="handleRefresh" :disabled="notesStore.isLoading" class="refresh-btn" title="Обновить данные">
				🔄
			</button>
		</div>
	</header>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useNotesStore } from '../stores/notes'

const emit = defineEmits<{
	(e: 'search', query: string, mode: 'files' | 'tags'): void
	(e: 'clear-search'): void
	(e: 'refresh'): void
	(e: 'set-search-mode', mode: 'files' | 'tags'): void
}>()

const notesStore = useNotesStore()
const localSearchQuery = ref('')
const localSearchMode = ref<'files' | 'tags'>('files')

// Автопоиск при изменении запроса
let searchTimeout: number | null = null
watch(localSearchQuery, (newQuery) => {
	if (!newQuery.trim()) {
		emit('clear-search')
		return
	}

	if (searchTimeout) {
		clearTimeout(searchTimeout)
	}

	searchTimeout = setTimeout(() => {
		if (newQuery.trim()) {
			emit('search', localSearchQuery.value, localSearchMode.value)
		}
	}, 300)
})

function setSearchMode(mode: 'files' | 'tags'): void {
	localSearchMode.value = mode
	emit('set-search-mode', mode)
}

function performSearch(): void {
	if (!localSearchQuery.value.trim()) return
	emit('search', localSearchQuery.value, localSearchMode.value)
}

function clearSearch(): void {
	localSearchQuery.value = ''
	emit('clear-search')
}

function handleRefresh(): void {
	localSearchQuery.value = ''
	localSearchMode.value = 'files'
	emit('refresh')
}

function handleSearchInput(): void {
	// Автопоиск через watch
}
</script>

<style scoped>
/* Шапка */
.app-header {
	padding: 0.75rem 1rem;
	background: #2c3e50;
	color: white;
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 1rem;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 1.5rem;
}

.header-left h1 {
	margin: 0;
	font-size: 1.25rem;
}

.header-right {
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

/* Контейнер для поиска и вкладок */
.search-tabs-container {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	background: white;
	border-radius: 4px;
	padding: 0.25rem;
	min-width: 400px;
}

/* Поиск */
.search-box {
	display: flex;
	align-items: center;
	flex: 1;
	min-width: 200px;
}

.search-box input {
	flex: 1;
	padding: 0.5rem 0.75rem;
	border: none;
	outline: none;
	font-size: 0.9rem;
	color: #333;
	background: transparent;
}

.search-box input::placeholder {
	color: #999;
}

.search-btn,
.clear-search {
	padding: 0.5rem 0.75rem;
	border: none;
	background: transparent;
	cursor: pointer;
	color: #666;
	transition: color 0.2s;
}

.search-btn:hover:not(:disabled) {
	color: #3498db;
}

.search-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.clear-search:hover {
	color: #e74c3c;
}

/* Вкладки поиска */
.search-tabs {
	display: flex;
	gap: 0.125rem;
	background: #e9ecef;
	border-radius: 3px;
	padding: 0.125rem;
}

.search-tab {
	padding: 0.5rem 0.75rem;
	border: none;
	background: transparent;
	border-radius: 2px;
	cursor: pointer;
	font-size: 0.9rem;
	color: #6c757d;
	transition: all 0.2s;
}

.search-tab:hover {
	background: rgba(255, 255, 255, 0.5);
}

.search-tab.active {
	background: #3498db;
	color: white;
}

.refresh-btn {
	padding: 0.5rem;
	border: none;
	background: rgba(255, 255, 255, 0.1);
	color: white;
	border-radius: 4px;
	cursor: pointer;
	transition: background-color 0.2s;
}

.refresh-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.refresh-btn:hover:not(:disabled) {
	background: rgba(255, 255, 255, 0.2);
}
</style>