// src/types/treeItem.ts
export interface TreeItemBase {
  type: 'folder' | 'file'
  name: string
  path: string
}

export interface FolderItem extends TreeItemBase {
  type: 'folder'
  isOpen: boolean
  children: TreeItem[]
  hasChildren: boolean
}

export interface FileItem extends TreeItemBase {
  type: 'file'
  content: string
  tags: string[]
  rawTags: string[]
  groupedTags: Record<string, Array<{
    full: string
    display: string
    language?: 'ru' | 'en'
  }>>
}

export type TreeItem = FolderItem | FileItem

export interface TagItem {
  full: string
  display: string
  language?: 'ru' | 'en'
}

export type GroupedTags = Record<string, TagItem[]>

// Type guards
export function isFolder(item: TreeItem): item is FolderItem {
  return item.type === 'folder'
}

export function isFile(item: TreeItem): item is FileItem {
  return item.type === 'file'
}

