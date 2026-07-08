/**
 * mediaApi – thin client for the Azure Functions API.
 *
 * Endpoints (backed by /api Azure Functions):
 *   GET /api/media          → list of media items { name, contentType, size, lastModified }
 *   GET /api/media/url      → { url: "<SAS URL>", contentType } for a given blob
 *                             query param: ?blobName=path/to/file.mp4
 */

const BASE = '/api'

/**
 * @returns {Promise<Array<{name: string, contentType: string, size: number, lastModified: string}>>}
 */
export async function getMediaList() {
  const res = await fetch(`${BASE}/media`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to load media list: ${res.status} ${text}`)
  }
  return res.json()
}

/**
 * @param {string} blobName
 * @returns {Promise<{url: string, contentType: string}>}
 */
export async function getMediaUrl(blobName) {
  const res = await fetch(`${BASE}/media/url?blobName=${encodeURIComponent(blobName)}`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to get media URL: ${res.status} ${text}`)
  }
  return res.json()
}
