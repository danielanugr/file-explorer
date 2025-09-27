import { describe, it, expect, mock, beforeEach } from 'bun:test'
import { FolderService } from './FolderService'
import { IFolderRepository } from '../interfaces/IFolderRepository'
import { ICacheService } from '../interfaces/ICacheService'
import { Folder } from '../entities/Folder'

// Create mock functions
const mockRepositoryMethods = {
  findById: mock(),
  findAll: mock(() => Promise.resolve({ items: [], total: 0, page: 1, limit: 10, totalPages: 0, hasNext: false, hasPrev: false })),
  findByParentId: mock(() => Promise.resolve({ items: [], total: 0, page: 1, limit: 10, totalPages: 0, hasNext: false, hasPrev: false })),
  getFolderTree: mock(),
  getFolderStats: mock(() => Promise.resolve({ filesCount: 0, childrenCount: 0 })),
  getFilesInFolder: mock(() => Promise.resolve([])),
  search: mock(),
  create: mock(() => Promise.resolve({} as Folder)),
  update: mock(() => Promise.resolve(null)),
  delete: mock(() => Promise.resolve(false))
}

const mockCacheMethods = {
  get: mock(),
  set: mock(() => Promise.resolve()),
  delete: mock(() => Promise.resolve()),
  deletePattern: mock(() => Promise.resolve()),
  exists: mock(() => Promise.resolve(false)),
  increment: mock(() => Promise.resolve(1)),
  expire: mock(() => Promise.resolve()),
  clear: mock(() => Promise.resolve()),
  cleanup: mock(() => {})
}

const mockFolderRepository: IFolderRepository = mockRepositoryMethods
const mockCacheService: ICacheService = mockCacheMethods

describe('FolderService', () => {
  let folderService: FolderService

  beforeEach(() => {
    // Reset all mocks
    Object.values(mockRepositoryMethods).forEach(m => m.mockClear())
    Object.values(mockCacheMethods).forEach(m => m.mockClear())
    folderService = new FolderService(mockFolderRepository, mockCacheService)
  })

  describe('getFolderById', () => {
    it('should return cached folder if available', async () => {
      const mockFolder: Folder = {
        id: 1,
        name: 'Test Folder',
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockCacheMethods.get.mockReturnValueOnce(Promise.resolve(mockFolder))

      const result = await folderService.getFolderById(1)

      expect(result).toEqual(mockFolder)
      expect(mockCacheMethods.get).toHaveBeenCalledWith('folder:1')
      expect(mockRepositoryMethods.findById).not.toHaveBeenCalled()
    })

    it('should fetch from repository and cache if not in cache', async () => {
      const mockFolder: Folder = {
        id: 1,
        name: 'Test Folder',
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockCacheMethods.get.mockReturnValue(Promise.resolve(null))
      mockRepositoryMethods.findById.mockReturnValueOnce(Promise.resolve(mockFolder))

      const result = await folderService.getFolderById(1)

      expect(result).toEqual(mockFolder)
      expect(mockCacheMethods.get).toHaveBeenCalledWith('folder:1')
      expect(mockRepositoryMethods.findById).toHaveBeenCalledWith(1)
      expect(mockCacheMethods.set).toHaveBeenCalledWith('folder:1', mockFolder, 300)
    })

    it('should return null if folder not found', async () => {
      mockCacheMethods.get.mockReturnValue(Promise.resolve(null))
      mockRepositoryMethods.findById.mockReturnValue(Promise.resolve(null))

      const result = await folderService.getFolderById(999)

      expect(result).toBeNull()
      expect(mockRepositoryMethods.findById).toHaveBeenCalledWith(999)
      expect(mockCacheMethods.set).not.toHaveBeenCalled()
    })
  })

  describe('getFolderTree', () => {
    it('should return cached tree if available', async () => {
      const mockTree: Folder[] = [
        {
          id: 1,
          name: 'Root',
          parentId: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      mockCacheMethods.get.mockReturnValueOnce(Promise.resolve(mockTree))

      const result = await folderService.getFolderTree()

      expect(result).toEqual(mockTree)
      expect(mockCacheMethods.get).toHaveBeenCalledWith('folder_tree')
      expect(mockRepositoryMethods.getFolderTree).not.toHaveBeenCalled()
    })

    it('should fetch from repository and cache if not in cache', async () => {
      const mockTree: Folder[] = [
        {
          id: 1,
          name: 'Root',
          parentId: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      mockCacheMethods.get.mockReturnValue(Promise.resolve(null))
      mockRepositoryMethods.getFolderTree.mockReturnValueOnce(Promise.resolve(mockTree))

      const result = await folderService.getFolderTree()

      expect(result).toEqual(mockTree)
      expect(mockRepositoryMethods.getFolderTree).toHaveBeenCalled()
      expect(mockCacheMethods.set).toHaveBeenCalledWith('folder_tree', mockTree, 180)
    })
  })

  describe('createFolder', () => {
    it('should create folder and invalidate caches', async () => {
      const mockFolder: Folder = {
        id: 1,
        name: 'New Folder',
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockRepositoryMethods.create.mockReturnValue(Promise.resolve(mockFolder))

      const result = await folderService.createFolder('New Folder', null)

      expect(result).toEqual(mockFolder)
      expect(mockRepositoryMethods.create).toHaveBeenCalledWith({ name: 'New Folder', parentId: null })
      expect(mockCacheMethods.deletePattern).toHaveBeenCalledWith('folder_children:null:*')
      expect(mockCacheMethods.delete).toHaveBeenCalledWith('folder_tree')
    })
  })

  describe('searchFoldersAndFiles', () => {
    it('should return cached results if available', async () => {
      const mockResults = { folders: [], files: [] }
      const searchOptions = { query: 'test', limit: 10, page: 1 }

      mockCacheMethods.get.mockReturnValueOnce(Promise.resolve(mockResults))

      const result = await folderService.searchFoldersAndFiles(searchOptions)

      expect(result).toEqual(mockResults)
      expect(mockCacheMethods.get).toHaveBeenCalledWith(`search:${JSON.stringify(searchOptions)}`)
      expect(mockRepositoryMethods.search).not.toHaveBeenCalled()
    })

    it('should search repository and cache results if not in cache', async () => {
      const mockResults = {
        folders: [{ id: 1, name: 'Test Folder', parentId: null, createdAt: new Date(), updatedAt: new Date() }],
        files: []
      }
      const searchOptions = { query: 'test', limit: 10, page: 1 }

      mockCacheMethods.get.mockReturnValue(Promise.resolve(null))
      mockRepositoryMethods.search.mockReturnValueOnce(Promise.resolve(mockResults))

      const result = await folderService.searchFoldersAndFiles(searchOptions)

      expect(result).toEqual(mockResults)
      expect(mockRepositoryMethods.search).toHaveBeenCalledWith(searchOptions)
      expect(mockCacheMethods.set).toHaveBeenCalledWith(`search:${JSON.stringify(searchOptions)}`, mockResults, 30)
    })
  })
})