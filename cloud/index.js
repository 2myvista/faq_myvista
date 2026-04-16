const GITHUB_API = 'https://api.github.com';

function json(statusCode, data, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      ...extraHeaders,
    },
    body: JSON.stringify(data),
  };
}

function getPathParams(event) {
  const qs = event.queryStringParameters || {};

  return {
    owner: qs.owner,
    repo: qs.repo,
    path: qs.path || '',
    ref: qs.ref || 'main',
    mode: qs.mode || 'content', // content | tree
  };
}

async function githubRequest(url, token) {
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'yc-faq-proxy',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  const text = await res.text();

  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  return { ok: res.ok, status: res.status, data };
}

module.exports.handler = async function (event) {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return json(200, { ok: true });
    }

    if (event.httpMethod !== 'GET') {
      return json(405, { error: 'Method not allowed' });
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return json(500, { error: 'Missing GITHUB_TOKEN env variable' });
    }

    const { owner, repo, path, ref, mode } = getPathParams(event);

    if (!owner || !repo) {
      return json(400, {
        error: 'Query params owner and repo are required',
        example: '......',
      });
    }

    let url;

    if (mode === 'tree') {
      // Список содержимого директории или корня
      const encodedPath = path
        .split('/')
        .filter(Boolean)
        .map(encodeURIComponent)
        .join('/');

      url = encodedPath
        ? `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`
        : `${GITHUB_API}/repos/${owner}/${repo}/contents?ref=${encodeURIComponent(ref)}`;
    } else {
      // content: содержимое конкретного файла
      if (!path) {
        return json(400, { error: 'path is required for mode=content' });
      }

      const encodedPath = path
        .split('/')
        .filter(Boolean)
        .map(encodeURIComponent)
        .join('/');

      url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`;
    }

    const gh = await githubRequest(url, token);

    if (!gh.ok) {
      return json(gh.status, {
        error: 'GitHub API error',
        details: gh.data,
      });
    }
		if (mode === 'content') {
			if (Array.isArray(gh.data)) {
				return json(400, { error: 'Expected file, got directory' });
			}
				const file = gh.data;

			return json(200, {
				name: file.name,
				path: file.path,
				sha: file.sha,
				size: file.size,
				type: file.type,
				content: file.content,
				encoding: file.encoding,
			});		  
		}
		else if (mode === 'tree') {
			if (!Array.isArray(gh.data)) {
				return json(400, { error: 'Expected directory, got file' });
			}
			const items = gh.data.map(item => ({
				name: item.name,
				path: item.path,
				sha: item.sha,
				size: item.size,
				type: item.type,
			}));

			return json(200, items);		  
	  }
		else {
			return json(400, {
				error: 'Invalid mode',
				allowed: ['tree', 'content'],
			});			
	  }

 

  } catch (error) {
    return json(500, {
      error: 'Internal error',
      message: error instanceof Error ? error.message : String(error),
    });
  }
};