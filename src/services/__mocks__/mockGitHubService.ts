// src/services/__mocks__/mockGitHubService.ts

//import type { GitHubFile } from '../githubService'

// Хелпер для кодирования в base64
function encodeToBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
}

// Типы для моковых данных
interface MockFolderContent {
  name: string
  path: string
  type: 'dir' | 'file'
}

interface MockFileData {
  content: string
  encoding: 'base64'
  sha: string
}

// Моковые данные с типами
const mockFolderContents: Record<string, MockFolderContent[]> = {
  '': [
    {
      name: 'obsidian',
      path: 'obsidian',
      type: 'dir'
    },
    {
      name: 'pim',
      path: 'pim',
      type: 'dir'
    },
    {
      name: 'git',
      path: 'git',
      type: 'dir'
    }
  ],
  'obsidian': [
    {
      name: 'callout.md',
      path: 'obsidian/callout.md',
      type: 'file'
    },
    {
      name: 'вставить код.md',
      path: 'obsidian/вставить код.md',
      type: 'file'
    }
  ],
  'pim': [
    {
      name: 'deploy pim.md',
      path: 'pim/deploy pim.md',
      type: 'file'
    },
    {
      name: 'pgAdmin.md',
      path: 'pim/pgAdmin.md',
      type: 'file'
    }
  ],
  'git': [
    {
      name: 'git история переключений git.md',
      path: 'git/git история переключений git.md',
      type: 'file'
    },
  ]
}

const mockFileContents: Record<string, MockFileData> = {
  'obsidian/callout.md': {
    content: encodeToBase64(`# Callout примеры

> [!note] Обычный callout
> Это пример обычного callout

> [!warning] Внимание!ttt
> Это предупреждение

> [!tip] Совет
> Полезный совет

#obsidian/callout #markdown/notes`),
    encoding: 'base64',
    sha: 'mock-sha-callout-001'
  },
  
  'obsidian/вставить код.md': {
    content: encodeToBase64(`# Как вставить код в Obsidian

## Пример JavaScript
\`\`\`javascript
function hello() {
  console.log('Hello, World!')
}
\`\`\`

## Пример Python
\`\`\`python
def hello():
    print("Hello, World!")
\`\`\`

#obsidian/code #programming/javascript #programming/python`),
    encoding: 'base64',
    sha: 'mock-sha-code-002'
  },
  
  'pim/deploy pim.md': {
    content: encodeToBase64(`# Деплой PIM системы

## Предварительные требования
- Docker
- Kubernetes
- Helm

## Шаги деплоя
1. Собрать Docker образ
2. Запушить в registry
3. Обновить Helm chart

## Проверка
\`\`\`bash
kubectl get pods
kubectl logs -f deployment/pim
\`\`\`

#pim/deploy #pim/database #obsidian/postgresql #obsidian/admin #pim/bash #pim/script  #pim/linux #devops/kubernetes #devops/docker #devops/docker55`),
    encoding: 'base64',
    sha: 'mock-sha-deploy-003'
  },
  
  'pim/pgAdmin.md': {
    content: encodeToBase64(`# Настройка pgAdmin для PIM

## Подключение к базе
- Host: postgres-service
- Port: 5432
- Database: pim_db
- User: pim_user

## Запросы
\`\`\`sql
SELECT * FROM products;
SELECT * FROM categories;
\`\`\`

#pim/database #postgresql #admin`),
    encoding: 'base64',
    sha: 'mock-sha-pgadmin-004'
  },
  
  'git/git история переключений git.md': {
    content: encodeToBase64(`команда покажет историю всех операций с HEAD (переключения веток, коммиты, rebase, merge и т.д.) в обратном хронологическом порядке.

также можно увидеть из какой ветки создана та либо иная ветка
\`\`\`bash
git reflog --date=format:'%d-%m-%Y' | grep "checkout: moving" | head -20
\`\`\`


#git/движение #git/reflog #git/история #git/log`),
    encoding: 'base64',
    sha: 'git-reflog-005'
  }
}

// КЛАСС с методами
export class MockGitHubService {
  async getFolderContents(path: string = ''): Promise<MockFolderContent[]> {
    console.log(`[MOCK] getFolderContents: "${path}"`)
    await this.delay(300)
    
    const contents = mockFolderContents[path]
    if (!contents) {
      console.warn(`[MOCK] Path not found: "${path}", returning empty array`)
      return []
    }
    return contents
  }

  async getFileContent(path: string): Promise<MockFileData | null> {
    console.log(`[MOCK] getFileContent: "${path}"`)
    await this.delay(200)
    
    const content = mockFileContents[path]
    if (!content) {
      console.warn(`[MOCK] File not found: "${path}"`)
      return null
    }
    return content
  }

  async searchCode(query: string): Promise<{ items: { path: string; name: string; type: 'file' }[]; total_count: number }> {
    console.log(`[MOCK] searchCode: "${query}"`)
    await this.delay(400)
    
    const results = Object.entries(mockFileContents)
      .filter(([, data]) => {
        const decoded = decodeURIComponent(escape(atob(data.content)))
        return decoded.toLowerCase().includes(query.toLowerCase())
      })
      .map(([path]) => ({
        path,
        name: path.split('/').pop() || '',
        type: 'file' as const
      }))
    
    return {
      items: results,
      total_count: results.length
    }
  }

  async getRepoInfo(): Promise<{ name: string; full_name: string; description: string; private: boolean }> {
    return {
      name: 'mock-repo',
      full_name: 'mock-owner/mock-repo',
      description: 'Mock repository for development',
      private: false
    }
  }

  async testConnection(): Promise<boolean> {
    console.log('[MOCK] Testing connection...')
    await this.delay(200)
    return true
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default MockGitHubService