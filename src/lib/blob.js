// Vercel Blob is "connected" with either credential style:
//  - BLOB_READ_WRITE_TOKEN (classic stores), or
//  - BLOB_STORE_ID + Vercel's built-in OIDC token (newer stores). @vercel/blob picks either up automatically.
export function blobConnected() {
  return !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

// Photos in a *private* store are served through /api/img (the gallery is public anyway).
export const PROXY_PREFIX = "/api/img?u=";

export function toProxyUrl(blobUrl) {
  return PROXY_PREFIX + encodeURIComponent(blobUrl);
}

// The real Blob URL behind a stored photo URL (for deleting)
export function rawBlobUrl(stored) {
  if (stored?.startsWith(PROXY_PREFIX)) return decodeURIComponent(stored.slice(PROXY_PREFIX.length));
  return stored;
}

export function isBlobUrl(u) {
  try { return new URL(u).hostname.endsWith(".blob.vercel-storage.com"); } catch { return false; }
}
