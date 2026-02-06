<!-- src/App.vue -->
<template>
  <div class="app">
    <!-- Шапка -->
    <header class="app-header">
      <div class="header-left">
        <h1>Notes Viewer</h1>
      </div>

      <div class="header-right">
        <!-- Поиск и вкладки -->
        <div class="search-tabs-container">
          <!-- Строка поиска -->
          <div class="search-box">
            <input 
              v-model="searchQuery" 
              placeholder="Поиск по названию или тегу..."
              @input="handleSearchInput"
              @keyup.enter="performSearch"
              ref="searchInput"
            />
            <button 
              v-if="searchQuery" 
              @click="clearSearch"
              class="clear-search"
              title="Очистить поиск"
            >
              ×
            </button>
            <button 
              @click="performSearch" 
              class="search-btn"
              :disabled="!searchQuery.trim()"
              title="Искать"
            >
              🔍
            </button>
          </div>

          <!-- Вкладки справа от поиска -->
          <div class="search-tabs">
            <button 
              @click="setSearchMode('files')"
              :class="{ active: searchMode === 'files' }"
              class="search-tab"
            >
              Файлы
            </button>
            <button 
              @click="setSearchMode('tags')"
              :class="{ active: searchMode === 'tags' }"
              class="search-tab"
            >
              Теги
            </button>
          </div>
        </div>

        <button 
          @click="refreshData" 
          :disabled="notesStore.isLoading"
          class="refresh-btn"
          title="Обновить данные"
        >
          🔄
        </button>
      </div>
    </header>

    <!-- Основной контент -->
    <main class="app-main">
      <!-- Левая панель - Дерево папок -->
      <aside class="sidebar" :style="{ width: sidebarWidth }">
        <div class="sidebar-section">
          <div class="sidebar-header">
            <h3>Заметки</h3>
          </div>
          <FolderTree v-if="!notesStore.isLoading"
            :items="notesStore.tree"
            @select-item="handleSelectItem"
          />
        </div>
      </aside>

      <!-- Центральная панель - Основной контент -->
      <section class="main-content">
        <!-- Если выбран файл - показываем его содержимое -->
        <div v-if="selectedFile" class="file-content-panel">
          <div class="content-header">
            <h2>{{ selectedFile.name }}</h2>
            <div class="content-actions">
              <button @click="selectedFile = null" class="close-btn">
                × Закрыть
              </button>
            </div>
          </div>
          
          <!-- Теги файла -->
          <div class="file-tags-section">
            <h3>Теги файла:</h3>
            <div class="tags-list">
              <span
                v-for="tag in selectedFile.tags"
                :key="tag"
                class="tag"
                @click="handleTagClick(tag)"
                :title="tag"
              >
                #{{ tag }}
              </span>
            </div>
            
            <!-- Группированные теги -->
            <div 
              v-for="(groupTags, groupName) in selectedFile.groupedTags" 
              :key="groupName"
              class="tag-group"
            >
              <h4>{{ groupName }}:</h4>
              <div class="group-tags">
                <span
                  v-for="tag in groupTags"
                  :key="tag.full"
                  class="group-tag"
                  @click="handleTagClick(tag.full)"
                  :title="tag.full"
                >
                  {{ tag.display }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Содержимое файла -->
          <div class="file-content">
            <div class="content-toolbar">
              <button 
                @click="viewMode = viewMode === 'preview' ? 'raw' : 'preview'"
                class="view-toggle"
              >
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
        </div>

        <!-- Если файл не выбран - показываем информационное сообщение -->
        <div v-else class="empty-content">
          <div class="empty-message">
			<div v-if="notesStore.isLoading" class="loading-files">
              Загрузка...
            </div>
            <div v-else>
				<h3>Заметка не выбрана</h3>
				<p>Нажмите на любой файл -></p>
			</div>
          </div>
        </div>
      </section>

      <!-- Правая панель - Список файлов или теги -->
      <aside class="right-panel" :style="{ width: rightPanelWidth }">
        <!-- Заголовок панели -->
        <div class="panel-header">
          <h3>{{ rightPanelTitle }}</h3>

        </div>

        <!-- Если ищем по файлам или показываем файлы -->
        <div v-if="rightPanelMode === 'files'" class="files-panel">
          <!-- Заголовок с информацией -->
          <div class="files-header">
            <div class="filters-info">
              <span v-if="notesStore.selectedTag" class="filter-badge">
                Тег: #{{ notesStore.selectedTag }}
                <button @click="clearTagFilter">×</button>
              </span>
              <span v-if="isSearchActive && searchMode === 'files'" class="filter-badge search">
                Поиск: "{{ searchQuery }}"
                <button @click="clearSearch">×</button>
              </span>
            </div>
            <div class="files-count">
              {{ displayedFiles.length }} файлов
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
              <div
                v-for="file in displayedFiles"
                :key="file.path"
                class="file-card"
                :class="{ 'selected': isFileSelected(file) }"
                @click="handleSelectFile(file)"
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
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Если ищем по тегам или показываем теги -->
        <div v-else class="tags-panel">
          <!-- Если активен поиск по тегам -->
          <div v-if="isSearchActive && searchMode === 'tags'" class="search-tags-section">
            <h4>Результаты поиска тегов ({{ searchTagsResults.length }})</h4>
            <div class="tag-cloud">
              <span
                v-for="tag in searchTagsResults"
                :key="tag"
                class="tag-cloud-item"
                :class="{ 'active': notesStore.selectedTag === tag }"
                @click="handleSelectTag(tag)"
                :title="tag"
              >
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
					<span
					v-for="tag in notesStore.allTags"
					:key="tag"
					class="tag-cloud-item"
					:class="{ 'active': notesStore.selectedTag === tag }"
					@click="handleSelectTag(tag)"
					:title="tag"
					>
					#{{ tag }}
					</span>
				</div>
			</div>
          </div>

          <!-- Группированные теги (если не ищем) -->
          <div v-if="(!isSearchActive || searchMode !== 'tags') && !notesStore.isLoading" class="tag-groups-section">
            <h4>Группы тегов</h4>
            <div 
              v-for="(groupTags, groupName) in notesStore.groupedTags" 
              :key="groupName"
              class="tag-group-section"
            >
              <h5>{{ groupName }}</h5>
              <div class="tag-group-items">
                <span
                  v-for="tag in groupTags"
                  :key="tag.full"
                  class="tag-group-item"
                  :class="{ 'active': notesStore.selectedTag === tag.full }"
                  @click="handleSelectTag(tag.full)"
                  :title="tag.full"
                >
                  {{ tag.display }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </main>

    <!-- Статусная строка -->
    <footer class="app-footer">
      <div class="status-info">
        <span v-if="notesStore.isLoading" class="loading-status">
          ⏳ Загрузка данных...
        </span>
        <span v-else class="ready-status">
          ✅ Готово
        </span>
      </div>
      
      <div class="global-stats">
        Всего заметок: {{ notesStore.totalNotes }} | Тегов: {{ notesStore.totalTags }}
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, type Ref } from 'vue'
import { useNotesStore } from './stores/notes'
import type { TreeItem, FileItem } from './types/treeItem'
import FolderTree from './components/FolderTree.vue'

// === 1. ИНИЦИАЛИЗАЦИЯ STORE ===
const notesStore = useNotesStore()

// === 2. СОСТОЯНИЕ КОМПОНЕНТА ===
const searchQuery = ref('')
const selectedFile: Ref<FileItem | null> = ref(null)
const rightPanelMode = ref<'files' | 'tags'>('files')
const viewMode = ref<'preview' | 'raw'>('preview')
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
    if (isSearchActive.value && searchMode.value === 'files') return `Поиск файлов: "${searchQuery.value}"`
    if (notesStore.selectedTag) return `Тег: #${notesStore.selectedTag}`
    return 'Все файлы'
  }
  return 'Теги'
})

// Активен ли поиск
const isSearchActive = computed(() => {
  return !!searchQuery.value.trim()
})

// Теги свернуты?
const isTagsActive = ref(false);

// Результаты поиска тегов
const searchTagsResults = computed(() => {
  if (!isSearchActive.value || searchMode.value !== 'tags') return []
  
  const query = searchQuery.value.toLowerCase().trim()
  return notesStore.allTags.filter(tag => 
    tag.toLowerCase().includes(query)
  )
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

// Автопоиск при изменении запроса
let searchTimeout: number | null = null
watch(searchQuery, (newQuery) => {
  if (!newQuery.trim()) {
    clearSearch()
    return
  }
  
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(() => {
    if (newQuery.trim()) {
      performSearch()
    }
  }, 300)
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
    selectedFile.value = item
    notesStore.selectItem(item)
    rightPanelMode.value = 'files'
  }
}

function handleSelectFile(file: FileItem): void {
  selectedFile.value = file
  notesStore.selectItem(file)
}

function handleSelectTag(tag: string): void {
  notesStore.selectTag(tag)
  rightPanelMode.value = 'files'
  searchQuery.value = ''
  searchMode.value = 'files'
  selectedFile.value = null
}

function handleTagClick(tag: string): void {
  handleSelectTag(tag)
}

function handleSearchInput(): void {
  // Автопоиск через watch
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

function clearSearch(): void {
  searchQuery.value = ''
  notesStore.selectTag(null)
  selectedFile.value = null
}

function clearTagFilter(): void {
  notesStore.selectTag(null)
  searchQuery.value = ''
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

function isFileSelected(file: FileItem): boolean {
  return notesStore.currentItem?.path === file.path
}

function toggleTags(): void {
	//debugger;
    isTagsActive.value = !isTagsActive.value
}
 
</script>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

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

.search-btn, .clear-search {
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

.file-content-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  border-bottom: 1px solid #dee2e6;
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

.raw-content, .preview-content {
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

/* Правая панель */
.right-panel {
  background: white;
  border-left: 1px solid #dee2e6;
  overflow-y: auto;
  transition: width 0.3s ease;
}

.panel-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
}

.panel-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #2c3e50;
}

.panel-tabs {
  display: flex;
  gap: 0.25rem;
}

.panel-tabs button {
  padding: 0.5rem 1rem;
  border: none;
  background: #e9ecef;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #6c757d;
}

.panel-tabs button:hover {
  background: #dee2e6;
}

.panel-tabs button.active {
  background: #3498db;
  color: white;
}

/* Панель файлов */
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

.loading-files, .no-files {
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

/* Панель тегов */
.tags-panel {
  padding: 1rem;
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

/* Футер */
.app-footer {
  padding: 0.5rem 1rem;
  background: white;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #6c757d;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-status {
  color: #e74c3c;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.ready-status {
  color: #27ae60;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.global-stats {
  font-weight: 500;
}
</style>