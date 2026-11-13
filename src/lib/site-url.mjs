const placeholderHost =
  /(^|\.)(example|test|invalid|localhost|local)(\.|$)|your[-.]?domain|placeholder/i;

export function validateSiteOrigin(value) {
  if (value === undefined || value.trim() === '') return undefined;
  if (value !== value.trim() || !/^https:\/\/[^/?#]+\/?$/i.test(value)) {
    throw new Error(
      'SITE_URL must be an absolute HTTPS origin without a path, query, or fragment.',
    );
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('SITE_URL must be an absolute HTTPS origin.');
  }

  if (
    url.protocol !== 'https:' ||
    url.username !== '' ||
    url.password !== '' ||
    url.pathname !== '/' ||
    url.search !== '' ||
    url.hash !== '' ||
    placeholderHost.test(url.hostname)
  ) {
    throw new Error(
      'SITE_URL must be a confirmed HTTPS origin without a path or placeholder host.',
    );
  }

  return url.origin;
}
