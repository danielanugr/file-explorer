import { describe, it, expect, vi, beforeEach } from 'vitest'
import { folderService } from './folderService'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('FolderService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getFolderTree', () => {
    it('should fetch folder tree successfully', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 1,
            name: 'Root Folder',
            parentId: null,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
            children: []
          }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response)

      const result = await folderService.getFolderTree()

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/v1/folders/tree')
      expect(result).toEqual(mockResponse)
    })

    it('should handle fetch errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await folderService.getFolderTree()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response)

      const result = await folderService.getFolderTree()

      expect(result.success).toBe(false)
      expect(result.error).toBe('HTTP error! status: 500')
    })
  })

  describe('getFolderChildren', () => {
    it('should fetch folder children successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          folder: { id: 1, name: 'Parent', parentId: null, createdAt: '', updatedAt: '' },
          children: [],
          files: [
            {
              id: 1,
              name: 'test.txt',
              folderId: 1,
              sizeBytes: 1024,
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-01T00:00:00Z'
            }
          ],
          stats: { childrenCount: 0, filesCount: 1 }
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response)

      const result = await folderService.getFolderChildren(1)

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/v1/folders/1/children')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('searchFoldersAndFiles', () => {
    it('should search with encoded query parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          folders: [],
          files: []
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response)

      await folderService.searchFoldersAndFiles('test query', 25)

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/v1/folders/search?q=test%20query&limit=25')
    })

    it('should use default limit when not provided', async () => {
      const mockResponse = { success: true, data: { folders: [], files: [] } }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response)

      await folderService.searchFoldersAndFiles('test')

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/v1/folders/search?q=test&limit=50')
    })
  })
})