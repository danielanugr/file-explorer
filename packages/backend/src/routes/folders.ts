import { Elysia } from 'elysia'
import { DrizzleFolderRepository } from '../repositories/drizzleFolderRepository'

const folderRepo = new DrizzleFolderRepository()

export const foldersRouter = new Elysia({ prefix: '/api/folders' })

  // Get complete folder tree
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

  // Get direct children of a specific folder (includes files)
  .get('/:id/children', async ({ params }) => {
    try {
      const folderId = parseInt(params.id)

      if (isNaN(folderId)) {
        return {
          success: false,
          error: 'Invalid folder ID'
        }
      }

      // Get folder with stats (includes files and children)
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
          children, // subfolders
          files: stats.files, // files in this folder
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

  // Get root folders (folders with no parent)
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