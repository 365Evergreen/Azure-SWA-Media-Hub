import { useEffect, useRef, useState } from 'react'
import { getMediaUrl } from '../services/mediaApi.js'
import './MediaPlayer.css'

const AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/webm', 'audio/flac']

function isAudio(contentType) {
  return AUDIO_TYPES.some((t) => contentType?.startsWith(t))
}

/**
 * MediaPlayer – streams a blob from Azure Blob Storage via a SAS URL.
 *
 * Props:
 *   blobName    {string}  – blob path as stored in the container
 *   title       {string}  – display title
 *   onClose     {func}    – called when the user closes the player (optional)
 */
export default function MediaPlayer({ blobName, title, onClose }) {
  const [state, setState] = useState({ url: null, contentType: null, loading: true, error: null })
  const mediaRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    setState({ url: null, contentType: null, loading: true, error: null })

    getMediaUrl(blobName)
      .then(({ url, contentType }) => {
        if (!cancelled) setState({ url, contentType, loading: false, error: null })
      })
      .catch((err) => {
        if (!cancelled) setState({ url: null, contentType: null, loading: false, error: err.message })
      })

    return () => {
      cancelled = true
    }
  }, [blobName])

  if (state.loading) {
    return (
      <div className="player-wrapper player-loading" role="status">
        <span className="spinner" aria-hidden="true" />
        <p>Preparing stream…</p>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="player-wrapper player-error" role="alert">
        <p>⚠️ {state.error}</p>
        {onClose && (
          <button className="btn btn-ghost" onClick={onClose}>
            Back
          </button>
        )}
      </div>
    )
  }

  const audio = isAudio(state.contentType)

  return (
    <div className="player-wrapper">
      <div className="player-header">
        <h2 className="player-title" title={title}>{title}</h2>
        {onClose && (
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close player">
            ✕
          </button>
        )}
      </div>

      {audio ? (
        <div className="player-audio-container">
          <div className="audio-icon" aria-hidden="true">🎵</div>
          <audio
            ref={mediaRef}
            className="player-audio"
            src={state.url}
            controls
            autoPlay
            aria-label={`Audio: ${title}`}
          >
            <source src={state.url} type={state.contentType} />
            Your browser does not support the audio element.
          </audio>
        </div>
      ) : (
        <video
          ref={mediaRef}
          className="player-video"
          src={state.url}
          controls
          autoPlay
          aria-label={`Video: ${title}`}
        >
          <source src={state.url} type={state.contentType} />
          Your browser does not support the video element.
        </video>
      )}
    </div>
  )
}
