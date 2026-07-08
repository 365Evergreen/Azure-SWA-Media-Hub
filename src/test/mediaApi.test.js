import { describe, it, expect } from 'vitest'
import { getMediaList, getMediaUrl } from '../services/mediaApi.js'

// These tests verify the API service functions handle responses and errors correctly.

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('mediaApi', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  describe('getMediaList', () => {
    it('returns parsed JSON on success', async () => {
      const items = [{ name: 'a.mp4', contentType: 'video/mp4', size: 100, lastModified: '' }]
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => items })
      const result = await getMediaList()
      expect(result).toEqual(items)
      expect(mockFetch).toHaveBeenCalledWith('/api/media')
    })

    it('throws on non-OK response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'Server error' })
      await expect(getMediaList()).rejects.toThrow('500')
    })
  })

  describe('getMediaUrl', () => {
    it('returns url and contentType on success', async () => {
      const payload = { url: 'https://example.com/blob?sas=x', contentType: 'video/mp4' }
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => payload })
      const result = await getMediaUrl('folder/video.mp4')
      expect(result).toEqual(payload)
      expect(mockFetch).toHaveBeenCalledWith('/api/media/url?blobName=folder%2Fvideo.mp4')
    })

    it('throws on non-OK response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404, text: async () => 'Not found' })
      await expect(getMediaUrl('missing.mp4')).rejects.toThrow('404')
    })
  })
})
