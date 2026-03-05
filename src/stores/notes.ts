// src/stores/notes.ts (упрощенный)
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
//import GitHubService from '../services/githubService'
import { GitHubService }  from '../services/githubServiceFactory'
import type { TreeItem, FolderItem, FileItem } from '../types/treeItem'
import { decodeBase64 } from '../utils/base64'

export const useNotesStore = defineStore('notes', () => {
  // === STATE ===
  const tree = ref<TreeItem[]>([])
  const isLoading = ref(false)
  const selectedTag = ref<string | null>(null)
  const currentItem = ref<TreeItem | null>(null)

  const githubConfig = ref({
    owner: import.meta.env.VITE_GITHUB_OWNER || '',
    repo: import.meta.env.VITE_GITHUB_REPO || '',
    token: import.meta.env.VITE_GITHUB_TOKEN || null
  })

  // === GETTERS ===
  const githubService = GitHubService()
  

  const allFiles = computed(() => {
    const files: FileItem[] = []
    
    function collectFiles(items: TreeItem[]): void {
      items.forEach(item => {
        if (item.type === 'file') {
          files.push(item)
        } else if (item.type === 'folder') {
          collectFiles(item.children)
        }
      })
    }
    
    if (tree.value.length > 0) {
      collectFiles(tree.value)
    }
    
    return files
  })

  const allTags = computed(() => {
    const tags = new Set<string>()
    
    allFiles.value.forEach(file => {
      file.tags.forEach(tag => tags.add(tag))
    })
    
    return Array.from(tags)
  })

  const groupedTags = computed(() => {
    const grouped: Record<string, Array<{
      full: string
      display: string
      language?: 'ru' | 'en'
    }>> = {}
    
    allTags.value.forEach(tag => {
      const parts = tag.split('/')
      const group = parts[0] || 'other'
      
      if (!grouped[group]) {
        grouped[group] = []
      }
      
      grouped[group].push({
        full: tag,
        display: parts.length > 1 ? parts.slice(1).join('/') : tag,
        language: /[а-яА-ЯёЁ]/.test(tag) ? 'ru' : 'en'
      })
    })
    
    return grouped
  })

  const filteredFiles = computed(() => {
    if (!selectedTag.value) return []
    
    return allFiles.value.filter(file => 
      file.tags.includes(selectedTag.value!)
    )
  })

  const totalNotes = computed(() => allFiles.value.length)
  const totalTags = computed(() => allTags.value.length)

  // === UTILITY FUNCTIONS ===
  function parseTags(content: string): string[] {
    const tags: string[] = []
    const tagRegex = /#([\wа-яА-ЯёЁ\/\-\.]+)/gi
    
    let match: RegExpExecArray | null
    while ((match = tagRegex.exec(content)) !== null) {
      const tag = match[1]?.trim()
      if (tag) {
        tags.push(tag)
      }
    }
    
    return tags
  }

  function groupTags(tags: string[]): typeof groupedTags.value {
    const grouped: typeof groupedTags.value = {}
    
    tags.forEach(tag => {
      const parts = tag.split('/')
      const group = parts[0] || 'other'
      
      if (!grouped[group]) {
        grouped[group] = []
      }
      
      grouped[group].push({
        full: tag,
        display: parts.length > 1 ? parts.slice(1).join('/') : tag,
        language: /[а-яА-ЯёЁ]/.test(tag) ? 'ru' : 'en'
      })
    })
    
    return grouped
  }

  // === ACTIONS ===
  async function loadStructure(path: string = ''): Promise<TreeItem[]> {
    const contents = await githubService.getFolderContents(path)
    const structure: TreeItem[] = []
    
    for (const item of contents) {
      if (item.type === 'dir') {
        const folder: FolderItem = {
          type: 'folder',
          name: item.name,
          path: item.path,
          isOpen: false,
          children: await loadStructure(item.path),
          hasChildren: true
        }
        structure.push(folder)
      } else if (item.type === 'file' && item.name.endsWith('.md')) {
        const fileData = await githubService.getFileContent(item.path)
        
        let content = ''
        let tags: string[] = []
        
        if (fileData?.content && fileData.encoding === 'base64') {
          content = decodeBase64(fileData.content)
          tags = parseTags(content)
        }
        
        const file: FileItem = {
          type: 'file',
          name: item.name.replace('.md', ''),
          path: item.path,
          content,
          tags,
          rawTags: tags,
          groupedTags: groupTags(tags)
        }
        
        structure.push(file)
      }
    }
    
    return structure
  }

  async function loadNotesStructure(): Promise<void> {
    isLoading.value = true
    try {
      tree.value = await loadStructure()
      console.log('Structure loaded:', tree.value.length, 'items')
    } catch (error) {
      console.error('Error loading structure:', error)
    } finally {
      isLoading.value = false
    }
  }

  function selectItem(item: TreeItem): void {
    currentItem.value = item
    
    if (item.type === 'folder') {
      item.isOpen = !item.isOpen
    }
  }

  function selectTag(tag: string | null): void {
    selectedTag.value = tag
  }

  // === RETURN STORE ===
  return {
    // State
    tree,
    isLoading,
    selectedTag,
    currentItem,
    githubConfig,
    
    // Getters
    allFiles,
    allTags,
    groupedTags,
    filteredFiles,
    totalNotes,
    totalTags,
    githubService,
    
    // Actions
    loadNotesStructure,
    selectItem,
    selectTag
  }
})