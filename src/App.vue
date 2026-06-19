<!-- src/App.vue -->
<template>
	<div class="app">
		<!-- Шапка -->
		<HeaderBlock
			:searchMode="searchMode"
			v-model:searchQuery="searchQuery"
			@search="handleSearch"
			@clear-search="handleClearSearch"
			@refresh="handleRefresh"
			@set-search-mode="handleSetSearchMode" />
	
		<!-- Основной контент -->
		<main class="app-main">
			<!-- Левая панель - Дерево папок -->
			<aside class="sidebar" :style="{ width: sidebarWidth }">
				<div class="sidebar-section">
					<div class="sidebar-header">
						<h3>Заметки</h3>
					</div>
					<FolderTree v-if="!notesStore.isLoading" :items="notesStore.tree" @select-item="handleSelectItem" />
				</div>
			</aside>

			<!-- Центральная панель - Основной контент -->
			<section class="main-content">
				<FilePreview :selectedFile="selectedFile" :isLoading="notesStore.isLoading" @close-file="handleCloseFile()" @tag-click="handleSelectTag" />
			</section>

			<!-- Правая панель - Список файлов или теги -->
			<aside class="right-panel" :style="{ width: rightPanelWidth }">

				<!-- Если ищем по файлам или показываем файлы -->
				<FileList v-if="rightPanelMode === 'files'" :panelTitle="rightPanelTitle" :isSearchActive="isSearchActive" :searchMode="searchMode" :displayedFiles="displayedFiles" @select-file="handleSelectFile" @clear-tag-filter="clearTagFilter" :searchQuery="searchQuery"/>

				<!-- Если ищем по тегам или показываем теги -->
				
				<TagCloud v-else :isSearchActive="isSearchActive" :panelTitle="rightPanelTitle" :searchMode="searchMode" :searchTagsResults="searchTagsResults" @select-tag="handleSelectTag" @select-file="handleSelectFile" />
				
			</aside>
		</main>

		<!-- Статусная строка -->
		<FooterBlock />
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, type Ref } from 'vue'
import { useNotesStore } from './stores/notes'
import type { TreeItem, FileItem } from './types/treeItem'
import HeaderBlock from './components/HeaderBlock.vue'
import FolderTree from './components/FolderTree.vue'
import FooterBlock from './components/FooterBlock.vue'
import FilePreview from "./components/FilePreview.vue";
import TagCloud from "./components/TagCloud.vue";
import FileList from "./components/FileList.vue";

// === 1. ИНИЦИАЛИЗАЦИЯ STORE ===
const notesStore = useNotesStore()

// === 2. СОСТОЯНИЕ КОМПОНЕНТА ===
const searchQuery = ref('')
const selectedFile: Ref<FileItem | null> = ref(null)
const rightPanelMode = ref<'files' | 'tags'>('files')

const searchMode = ref<'files' | 'tags'>('files') // Режим поиска (файлы/теги)
const searchInput = ref<HTMLInputElement | null>(null)

// === 3. COMPUTED СВОЙСТВА ===
const sidebarWidth = computed(() => {
	return selectedFile.value ? '250px' : '300px'
})

const rightPanelWidth = computed(() => {
	return selectedFile.value ? '30%' : '50%'
})

const rightPanelTitle = computed(() => {
	if (rightPanelMode.value === 'files') {
		if (isSearchActive.value && searchMode.value === 'files') return `Поиск в файлах: "${searchQuery.value}"`
		return 'Все файлы'
	}
	else {
		if (isSearchActive.value && searchMode.value === 'tags') return `Поиск тегов: #${searchQuery.value}`
		return 'Все теги'

	}
	//return `Поиск тегов: #${searchQuery.value}`
})

function handleSearch(query: string, mode: 'files' | 'tags'): void {
	searchQuery.value = query
	searchMode.value = mode
	performSearch()
}

function performSearch(): void {
	if (!searchQuery.value.trim()) return

	// Автоматически переключаем правую панель в режим поиска
	rightPanelMode.value = searchMode.value

	// Сбрасываем выбранный тег при поиске
	notesStore.selectTag(null)
	selectedFile.value = null

	console.log(`Поиск "${searchQuery.value}" в режиме: ${searchMode.value}`)
}

function handleClearSearch(): void {
	clearSearch()
}

function handleRefresh(mode: 'files' | 'tags'): void {
	refreshData();
	setSearchMode(mode);
}

function handleSetSearchMode(mode: 'files' | 'tags'): void {
	setSearchMode(mode)
}

function handleSelectFile(file: FileItem): void {
	selectedFile.value = file
	notesStore.selectItem(file)
}

// Активен ли поиск
const isSearchActive = computed(() => {
	return !!searchQuery.value.trim()
})

const highlightTag = (tag: string, query: string) => {
	const index = tag.toLowerCase().indexOf(query)

	if (index === -1) {
		return {
			raw: tag,
			html: tag
		}
	}

	return {
		raw: tag,
		html:
			tag.slice(0, index) +
			'<span>[' +
			tag.slice(index, index + query.length) +
			']</span>' +
			tag.slice(index + query.length)
	}
}

const searchTagsResults = computed(() => {
	if (!isSearchActive.value || searchMode.value !== 'tags') {
		return []
	}

	const query = searchQuery.value.toLowerCase().trim()

	if (!query) {
		return []
	}

	// найденные теги
	const matchedTags = notesStore.allTags.filter(tag =>
		tag.toLowerCase().includes(query)
	)

	// найденные файлы без дублей
	const files = [
		...new Map(
			matchedTags.flatMap(tag =>
				notesStore.allFiles
					.filter(file => file.tags.includes(tag))
					.map(file => [file.path, file])
			)
		).values()
	]

	return files.map(file => ({
		...file,
		displayTags: file.tags
			.filter(tag => tag.toLowerCase().includes(query))
			.sort((a, b) => {
				const aIndex = a.toLowerCase().indexOf(query)
				const bIndex = b.toLowerCase().indexOf(query)

				if (aIndex !== bIndex) {
					return aIndex - bIndex
				}

				return a.length - b.length
			})
			.map(tag => highlightTag(tag, query))
	}))
})

// Результаты поиска файлов
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

// Отображаемые файлы (с учетом фильтров)
  const displayedFiles = computed(() => {
	// Если активен поиск по файлам
	if (isSearchActive.value && searchMode.value === 'files') {
		return searchFilesResults.value
	}

	// Если выбран тег
	  if (notesStore.selectedTag) {
		//debugger
		return notesStore.filteredFiles
	}

	// Все файлы
	return notesStore.allFiles
}) 

// === 4. ЖИЗНЕННЫЙ ЦИКЛ ===
onMounted(async () => {
	console.log('Приложение запущено')
	await loadInitialData()

	// Фокус на поле поиска при загрузке
	nextTick(() => {
		if (searchInput.value) {
			searchInput.value.focus()
		}
	})
})

// === 5. МЕТОДЫ ===
async function loadInitialData(): Promise<void> {
	try {
		await notesStore.loadNotesStructure()
	} catch (error) {
		console.error('Ошибка загрузки данных:', error)
	}
}

async function refreshData(): Promise<void> {
	searchQuery.value = ''
	notesStore.selectTag(null)
	selectedFile.value = null
	searchMode.value = 'files'
	rightPanelMode.value = 'files'
	await loadInitialData()
}

function handleSelectItem(item: TreeItem): void {

	if (item.type === 'file') {
		console.log('выбранный файл', item.name);
		searchMode.value='files'
		selectedFile.value = item
		notesStore.selectItem(item)
		rightPanelMode.value = 'files'
	}
}

function handleCloseFile(): void {
	selectedFile.value = null;
	notesStore.selectItem(null);
	console.log('сбрасываем выбранность файла  в handleCloseFile');
}

function handleSelectTag(tag: string): void {
	notesStore.selectTag(tag)
	rightPanelMode.value = 'files'
	searchQuery.value = ''
	searchMode.value = 'files'
	unSelectFile();
	console.log('сбрасываем выбранность файла  в handleSelectTag');
}

function unSelectFile(): void {
	selectedFile.value = null;
	notesStore.selectItem(null);	
}

function clearSearch(): void {
	searchQuery.value = '';
	unSelectFile();
}

function clearTagFilter(): void {
	notesStore.selectTag(null);
	searchQuery.value = '';
}

function setSearchMode(mode: 'files' | 'tags'): void {
	searchMode.value = mode
	// Если есть поисковый запрос, сразу выполняем поиск в новом режиме
	if (searchQuery.value.trim()) {
		performSearch()
	} else {
		// Если запроса нет, просто переключаем правую панель
		rightPanelMode.value = mode
	}
}
</script>

<style scoped>
.app {
	height: 100vh;
	display: flex;
	flex-direction: column;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Основной контент */
.app-main {
	flex: 1;
	display: flex;
	overflow: hidden;
	background: #f8f9fa;
}

/* Левая панель - Дерево */
.sidebar {
	background: white;
	border-right: 1px solid #dee2e6;
	overflow-y: auto;
	transition: width 0.3s ease;
}

.sidebar-section {
	padding: 1rem;
}

.sidebar-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
}

.sidebar-header h3 {
	margin: 0;
	font-size: 0.9rem;
	color: #6c757d;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.back-btn {
	padding: 0.25rem 0.5rem;
	border: 1px solid #dee2e6;
	background: white;
	border-radius: 4px;
	font-size: 0.8rem;
	cursor: pointer;
	color: #6c757d;
}

.back-btn:hover {
	background: #f8f9fa;
}
/* Центральная панель - Контент файла */
.main-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	background: white;
	transition: width 0.3s ease;
}

/* Правая панель */
.right-panel {
	background: white;
	border-left: 1px solid #dee2e6;
	overflow-y: auto;
	transition: width 0.3s ease;
}

</style>