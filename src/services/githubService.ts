// src/services/githubService.ts
import axios from 'axios'

export interface GitHubFile {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string | null
  type: 'file' | 'dir'
  content?: string
  encoding?: string
  _links: {
    self: string
    git: string
    html: string
  }
}

class GitHubService {
  private owner: string
  private repo: string
  private token: string | null
  private headers: Record<string, string>

  constructor(owner: string, repo: string, token: string | null = null) {
    this.owner = owner
    this.repo = repo
    this.token = token
    
    this.headers = {
      'Accept': 'application/vnd.github.v3+json'
    }
    
    if (this.token) {
      this.headers['Authorization'] = `token ${this.token}`
    }
  }

  async getFolderContents(path: string = ''): Promise<GitHubFile[]> {
    try {
      const encodedPath = encodeURIComponent(path).replace(/%2F/g, '/')
      const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${encodedPath}`
      
      const response = await axios.get<GitHubFile[]>(url, { 
        headers: this.headers,
        params: { ref: 'main' }
      })
      
      return response.data
    } catch (error) {
      console.error('Error fetching folder contents:', error)
      return []
    }
  }

  async getFileContent(path: string): Promise<GitHubFile | null> {
    try {
      const encodedPath = encodeURIComponent(path).replace(/%2F/g, '/')
      const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${encodedPath}`
      
      const response = await axios.get<GitHubFile>(url, { 
        headers: this.headers,
        params: { ref: 'main' }
      })
      
      return response.data
    } catch (error) {
      console.error('Error fetching file:', error)
      return null
    }
  }
}

export default GitHubService