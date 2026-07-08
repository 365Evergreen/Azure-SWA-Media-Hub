/**
 * GET /api/media/url?blobName=<blob path>
 *
 * Generates a short-lived SAS (Shared Access Signature) URL that allows the
 * browser to stream the requested blob directly from Azure Blob Storage.
 *
 * Required environment variables:
 *   AZURE_STORAGE_CONNECTION_STRING  – connection string for the storage account
 *   MEDIA_CONTAINER_NAME             – name of the blob container (default: "media")
 *   SAS_EXPIRY_MINUTES               – SAS token lifetime in minutes (default: 60)
 *
 * Query parameters:
 *   blobName {string} – path of the blob within the container
 *
 * Response: JSON { url: string, contentType: string }
 */

const {
  BlobServiceClient,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} = require('@azure/storage-blob')

module.exports = async function (context, req) {
  const blobName = req.query.blobName

  if (!blobName) {
    context.res = { status: 400, body: { error: 'blobName query parameter is required.' } }
    return
  }

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
  const containerName = process.env.MEDIA_CONTAINER_NAME || 'media'
  const expiryMinutes = parseInt(process.env.SAS_EXPIRY_MINUTES || '60', 10)

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
    const blobClient = containerClient.getBlobClient(blobName)

    // Verify the blob exists
    const exists = await blobClient.exists()
    if (!exists) {
      context.res = { status: 404, body: { error: `Blob "${blobName}" not found.` } }
      return
    }

    // Get blob properties for content type
    const props = await blobClient.getProperties()
    const contentType = props.contentType || 'application/octet-stream'

    // Build SAS token using the account credentials extracted from the connection string
    const { accountName, accountKey } = parseConnectionString(connectionString)
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey)

    const expiresOn = new Date(Date.now() + expiryMinutes * 60 * 1000)

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse('r'),
        expiresOn,
        contentType,
      },
      sharedKeyCredential,
    ).toString()

    const sasUrl = `${blobClient.url}?${sasToken}`

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { url: sasUrl, contentType },
    }
  } catch (err) {
    context.log.error('Error generating SAS URL:', err)
    context.res = {
      status: 500,
      body: { error: 'Failed to generate streaming URL. Please try again later.' },
    }
  }
}

/**
 * Extracts AccountName and AccountKey from an Azure Storage connection string.
 * @param {string} connectionString
 * @returns {{ accountName: string, accountKey: string }}
 */
function parseConnectionString(connectionString) {
  const parts = Object.fromEntries(
    connectionString.split(';').filter(Boolean).map((part) => {
      const idx = part.indexOf('=')
      return [part.substring(0, idx), part.substring(idx + 1)]
    }),
  )
  return { accountName: parts.AccountName, accountKey: parts.AccountKey }
}
