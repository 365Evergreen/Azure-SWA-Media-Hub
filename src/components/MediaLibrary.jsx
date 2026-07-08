import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMediaList } from '../services/mediaApi.js'
import './MediaLibrary.css'

const MEDIA_ICONS = {
  video: '🎬',
  audio: '🎵',
  other: '📄',
}

function mediaIcon(contentType) {
  if (contentType?.startsWith('video/')) return MEDIA_ICONS.video
  if (contentType?.startsWith('audio/')) return MEDIA_ICONS.audio
  return MEDIA_ICONS.other
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatDate(iso) {
  return new Date(iso).toLocaleString()
}

/**
 * MediaLibrary – lists audio and video items available in Azure Blob Storage.
 * Each item links to the player page for streaming.
 */
export default function MediaLibrary() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    setLoading(true)
    getMediaList()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(filter.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="library-status" role="status">
        <span className="spinner" aria-hidden="true" />
        <p>Loading media library…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="library-status library-error" role="alert">
        <p>⚠️ {error}</p>
      </div>
    )
  }

  return (
    <section className="library" aria-label="Media library">
      <div className="library-toolbar">
        <h1 className="library-heading">Media Library</h1>
        <input
          className="search-input"
          type="search"
          placeholder="Search files…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Search media files"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="library-empty">
          <p>{items.length === 0 ? 'No media files found in storage.' : 'No results match your search.'}</p>
        </div>
      ) : (
        <ul className="media-grid" role="list">
          {filtered.map((item) => (
            <li key={item.name} className="media-card">
              <Link
                to={`/media/${encodeURIComponent(item.name)}`}
                className="media-card-link"
                aria-label={`Play ${item.name}`}
              >
                <span className="media-card-icon" aria-hidden="true">
                  {mediaIcon(item.contentType)}
                </span>
                <div className="media-card-info">
                  <span className="media-card-name">{item.name}</span>
                  <span className="media-card-meta">
                    {item.contentType} &middot; {formatBytes(item.size)}
                  </span>
                  <span className="media-card-date">{formatDate(item.lastModified)}</span>
                </div>
                <span className="media-card-play" aria-hidden="true">▶</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
