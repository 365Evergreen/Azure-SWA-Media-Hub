import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MediaLibrary from '../components/MediaLibrary.jsx'
import * as mediaApi from '../services/mediaApi.js'

vi.mock('../services/mediaApi.js')

const SAMPLE_ITEMS = [
  {
    name: 'sample-video.mp4',
    contentType: 'video/mp4',
    size: 10485760,
    lastModified: '2024-01-15T10:30:00.000Z',
  },
  {
    name: 'podcast-episode.mp3',
    contentType: 'audio/mpeg',
    size: 5242880,
    lastModified: '2024-01-16T08:00:00.000Z',
  },
]

describe('MediaLibrary', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows loading spinner initially', () => {
    mediaApi.getMediaList.mockReturnValue(new Promise(() => {})) // never resolves
    render(
      <MemoryRouter>
        <MediaLibrary />
      </MemoryRouter>,
    )
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders media items after loading', async () => {
    mediaApi.getMediaList.mockResolvedValue(SAMPLE_ITEMS)
    render(
      <MemoryRouter>
        <MediaLibrary />
      </MemoryRouter>,
    )
    await waitFor(() => {
      expect(screen.getByText('sample-video.mp4')).toBeInTheDocument()
      expect(screen.getByText('podcast-episode.mp3')).toBeInTheDocument()
    })
  })

  it('shows empty message when no items', async () => {
    mediaApi.getMediaList.mockResolvedValue([])
    render(
      <MemoryRouter>
        <MediaLibrary />
      </MemoryRouter>,
    )
    await waitFor(() => {
      expect(screen.getByText(/no media files found/i)).toBeInTheDocument()
    })
  })

  it('shows error when API fails', async () => {
    mediaApi.getMediaList.mockRejectedValue(new Error('Network error'))
    render(
      <MemoryRouter>
        <MediaLibrary />
      </MemoryRouter>,
    )
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Network error')
    })
  })

  it('filters items by search', async () => {
    mediaApi.getMediaList.mockResolvedValue(SAMPLE_ITEMS)
    const { getByRole } = render(
      <MemoryRouter>
        <MediaLibrary />
      </MemoryRouter>,
    )
    await waitFor(() => screen.getByText('sample-video.mp4'))

    const searchInput = getByRole('searchbox')
    // Import userEvent dynamically since it's an async import
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    await user.type(searchInput, 'podcast')

    expect(screen.queryByText('sample-video.mp4')).not.toBeInTheDocument()
    expect(screen.getByText('podcast-episode.mp3')).toBeInTheDocument()
  })
})
