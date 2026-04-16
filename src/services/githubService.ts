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
	private apiUrl = import.meta.env.VITE_API_URL

	constructor(owner: string, repo: string) {
		this.owner = owner
		this.repo = repo

	}

	async getFolderContents(path: string = ''): Promise<GitHubFile[]> {
		try {
			const response = await axios.get<GitHubFile[]>(this.apiUrl, {
				params: {
					owner: this.owner,
					repo: this.repo,
					path: path,
					ref: 'main',
					mode: 'tree',
				},
			})
			

			return response.data
		} catch (error) {
			console.error('Error fetching folder contents:', error)
			return []
		}
	}

	async getFileContent(path: string): Promise<GitHubFile | null> {
		try {
			const response = await axios.get<GitHubFile>(this.apiUrl, {
				params: {
					owner: this.owner,
					repo: this.repo,
					path,
					ref: 'main',
					mode: 'content',
				},
			})
			return response.data

		} catch (error) {
			console.error('Error fetching file:', error)
			return null
		}
	}
}

export default GitHubService