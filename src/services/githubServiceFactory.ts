import GitHubServiceReal  from './githubService'
import { MockGitHubService } from './__mocks__/mockGitHubService'

export function GitHubService() {

	const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'
	
	if (useMocks) {
		console.log('Using mock GitHub service')
    	return new MockGitHubService()
	}
  
	console.log('Using real GitHub service')
	return new GitHubServiceReal (
		import.meta.env.VITE_GITHUB_OWNER || '',
		import.meta.env.VITE_GITHUB_REPO || '',
		import.meta.env.VITE_GITHUB_TOKEN || null
	)
}