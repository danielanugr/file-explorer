import { Elysia } from 'elysia'
import { DrizzleFolderRepository } from '../repositories/drizzleFolderRepository'

const folderRepo = new DrizzleFolderRepository()

export const foldersRouter = new Elysia({ prefix: '/api/folders' })

  .get('/tree', async () => {
    try {
      const tree = await folderRepo.getFolderTree()
      return {
        success: true,
        data: tree
      }
    } catch (error) {
      console.error('Error fetching folder tree:', error)
      return {
        success: false,
        error: 'Failed to fetch folder tree'
      }
    }
  })

  .get('/:id/children', async ({ params }) => {
    try {
      const folderId = parseInt(params.id)

      if (isNaN(folderId)) {
        return {
          success: false,
          error: 'Invalid folder ID'
        }
      }

      const stats = await folderRepo.getFolderWithStats(folderId)

      if (!stats.folder) {
        return {
          success: false,
          error: 'Folder not found'
        }
      }

      const children = await folderRepo.getFolderChildren(folderId)

      return {
        success: true,
        data: {
          folder: stats.folder,
          children,
          files: stats.files,
          stats: {
            childrenCount: stats.childrenCount,
            filesCount: stats.filesCount
          }
        }
      }
    } catch (error) {
      console.error('Error fetching folder contents:', error)
      return {
        success: false,
        error: 'Failed to fetch folder contents'
      }
    }
  })

  .get('/root', async () => {
    try {
      const rootFolders = await folderRepo.getFolderChildren(null)
      return {
        success: true,
        data: rootFolders
      }
    } catch (error) {
      console.error('Error fetching root folders:', error)
      return {
        success: false,
        error: 'Failed to fetch root folders'
      }
    }
  })

  .get('/search', async ({ query }) => {
    try {
      const searchQuery = query.q as string
      const limitParam = query.limit as string

      if (!searchQuery || searchQuery.trim().length === 0) {
        return {
          success: false,
          error: 'Search query is required'
        }
      }

      if (searchQuery.trim().length < 2) {
        return {
          success: false,
          error: 'Search query must be at least 2 characters'
        }
      }

      const limit = limitParam ? parseInt(limitParam) : 50
      const searchLimit = isNaN(limit) ? 50 : Math.min(limit, 100)

      const results = await folderRepo.searchFoldersAndFiles(searchQuery.trim(), searchLimit)

      return {
        success: true,
        data: {
          query: searchQuery.trim(),
          results: {
            folders: results.folders,
            files: results.files
          },
          counts: {
            folders: results.folders.length,
            files: results.files.length,
            total: results.folders.length + results.files.length
          }
        }
      }
    } catch (error) {
      console.error('Error searching:', error)
      return {
        success: false,
        error: 'Failed to search folders and files'
      }
    }
  })