// Long cache for static assets (images, fonts, css/js without a build hash get a
// shorter window so updates still show up within a day); HTML is revalidated
// on every request so page edits go live immediately.
function getCacheControl(pathname) {
  const ext = pathname.substring(pathname.lastIndexOf('.')).toLowerCase();
  if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'].includes(ext)) {
    return 'public, max-age=604800, stale-while-revalidate=86400';
  }
  if (['.css', '.js'].includes(ext)) {
    return 'public, max-age=86400, stale-while-revalidate=3600';
  }
  return 'public, max-age=0, must-revalidate';
}

function candidatePaths(pathname) {
  if (pathname === '/') {
    return ['/index.html', '/Public/index.html'];
  }

  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const candidates = [cleanPath];

  if (cleanPath.startsWith('/Public/')) {
    candidates.push(cleanPath.replace('/Public', ''));
  } else {
    candidates.push(`/Public${cleanPath}`);
  }

  return [...new Set(candidates)];
}

async function tryAssetFetch(assetBinding, request, pathname) {
  const candidates = candidatePaths(pathname);

  for (const candidate of candidates) {
    const candidateUrl = new URL(request.url);
    candidateUrl.pathname = candidate;
    const response = await assetBinding.fetch(new Request(candidateUrl.toString(), request));

    if (response.status !== 404) {
      return { response, resolvedPath: candidate };
    }
  }

  return { response: null, resolvedPath: null };
}

export default {
  async fetch(request, env) {
    try {
      const assets = env.ASSETS;
      if (!assets || typeof assets.fetch !== 'function') {
        return new Response(
          'Assets binding is unavailable or invalid',
          {
            status: 500,
            headers: { 'content-type': 'text/plain; charset=utf-8' },
          }
        );
      }

      const url = new URL(request.url);

      const { response, resolvedPath } = await tryAssetFetch(assets, request, url.pathname);
      if (!response) {
        return new Response('Not found', { status: 404 });
      }

      const headers = new Headers(response.headers);
      headers.set('Cache-Control', getCacheControl(resolvedPath));

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (error) {
      return new Response('Worker error', { status: 500 });
    }
  },
};