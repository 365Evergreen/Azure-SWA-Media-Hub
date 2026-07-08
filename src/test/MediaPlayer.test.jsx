import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MediaPlayer from '../components/MediaPlayer.jsx'
import * as mediaApi from '../services/mediaApi.js'

vi.mock('../services/mediaApi.js')

describe('MediaPlayer', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows loading state initially', () => {
    mediaApi.getMediaUrl.mockReturnValue(new Promise(() => {}))
    render(
      <MemoryRouter>
        <MediaPlayer blobName="video.mp4" title="My Video" />
      </MemoryRouter>,
    )
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders video element for video content type', async () => {
    mediaApi.getMediaUrl.mockResolvedValue({
      url: 'https://example.blob.core.windows.net/media/video.mp4?sas=token',
      contentType: 'video/mp4',
    })
    render(
      <MemoryRouter>
        <MediaPlayer blobName="video.mp4" title="My Video" />
      </MemoryRouter>,
    )
    await waitFor(() => {
      expect(screen.getByLabelText('Video: My Video')).toBeInTheDocument()
    })
  })

  it('renders audio element for audio content type', async () => {
    mediaApi.getMediaUrl.mockResolvedValue({
      url: 'https://example.blob.core.windows.net/media/song.mp3?sas=token',
      contentType: 'audio/mpeg',
    })
    render(
      <MemoryRouter>
        <MediaPlayer blobName="song.mp3" title="My Song" />
      </MemoryRouter>,
    )
    await waitFor(() => {
      expect(screen.getByLabelText('Audio: My Song')).toBeInTheDocument()
    })
  })

  it('shows error message on API failure', async () => {
    mediaApi.getMediaUrl.mockRejectedValue(new Error('Blob not found'))
    render(
      <MemoryRouter>
        <MediaPlayer blobName="missing.mp4" title="Missing" />
      </MemoryRouter>,
    )
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Blob not found')
    })
  })

  it('calls onClose when back button clicked on error', async () => {
    const onClose = vi.fn()
    mediaApi.getMediaUrl.mockRejectedValue(new Error('error'))
    render(
      <MemoryRouter>
        <MediaPlayer blobName="bad.mp4" title="Bad" onClose={onClose} />
      </MemoryRouter>,
    )
    await waitFor(() => screen.getByRole('alert'))
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    await user.click(screen.getByText('Back'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
