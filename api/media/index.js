/**
 * GET /api/media
 *
 * Lists all blobs in the configured Azure Blob Storage container that have
 * an audio or video content type (or recognised extension when content-type
 * is absent).
 *
 * Required environment variables:
 *   AZURE_STORAGE_CONNECTION_STRING  – connection string for the storage account
 *   MEDIA_CONTAINER_NAME             – name of the blob container (default: "media")
 *
 * Response: JSON array of { name, contentType, size, lastModified }
 */

const { BlobServiceClient } = require('@azure/storage-blob')

const MEDIA_CONTENT_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/x-msvideo',
  'video/quicktime',
  'audio/mpeg',
  'audio/mp4',
  'audio/ogg',
  'audio/wav',
  'audio/webm',
  'audio/flac',
  'audio/x-flac',
])

const MEDIA_EXTENSIONS = new Set([
  '.mp4', '.webm', '.ogv', '.avi', '.mov',
  '.mp3', '.m4a', '.ogg', '.oga', '.wav', '.flac',
])

function isMedia(name, contentType) {
  if (contentType) {
    const base = contentType.split(';')[0].trim().toLowerCase()
    if (MEDIA_CONTENT_TYPES.has(base)) return true
    if (base.startsWith('audio/') || base.startsWith('video/')) return true
  }
  const ext = name.substring(name.lastIndexOf('.')).toLowerCase()
  return MEDIA_EXTENSIONS.has(ext)
}

module.exports = async function (context, req) {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
  const containerName = process.env.MEDIA_CONTAINER_NAME || 'media'

  if (!connectionString) {
    context.res = {
      status: 500,
      body: { error: 'AZURE_STORAGE_CONNECTION_STRING environment variable is not configured.' },
    }
    return
  }

  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
    const containerClient = blobServiceClient.getContainerClient(containerName)

    const items = []
    for await (const blob of containerClient.listBlobsFlat({ includeMetadata: true })) {
      const contentType = blob.properties.contentType || ''
      if (!isMedia(blob.name, contentType)) continue

      items.push({
        name: blob.name,
        contentType: contentType || inferContentType(blob.name),
        size: blob.properties.contentLength ?? 0,
        lastModified: blob.properties.lastModified?.toISOString() ?? '',
      })
    }

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: items,
    }
  } catch (err) {
    context.log.error('Error listing blobs:', err)
    context.res = {
      status: 500,
      body: { error: 'Failed to list media. Please try again later.' },
    }
  }
}

function inferContentType(name) {
  const ext = name.substring(name.lastIndexOf('.')).toLowerCase()
  const map = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ogv': 'video/ogg',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
    '.mp3': 'audio/mpeg',
    '.m4a': 'audio/mp4',
    '.ogg': 'audio/ogg',
    '.oga': 'audio/ogg',
    '.wav': 'audio/wav',
    '.flac': 'audio/flac',
  }
  return map[ext] || 'application/octet-stream'
}
