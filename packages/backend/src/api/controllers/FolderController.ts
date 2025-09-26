import { Context } from 'elysia'
import { IFolderService } from '../../domain/services/IFolderService'
import { RateLimiter } from '../../infrastructure/rate-limiting/RateLimiter'

export class FolderController {
  constructor(
    private folderService: IFolderService,
    private rateLimiter: RateLimiter
  ) {}

  async getFolderTree(context: Context) {
    const clientId = this.getClientIdentifier(context)
    const rateLimit = await this.rateLimiter.checkLimit(`tree:${clientId}`)

    if (!rateLimit.allowed) {
      context.set.status = 429
      return {
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      }
    }

    try {
      const tree = await this.folderService.getFolderTree()
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
  }

  async getFolderChildren(context: Context & { params: { id: string } }) {
    const clientId = this.getClientIdentifier(context)
    const rateLimit = await this.rateLimiter.checkLimit(`children:${clientId}`)

    if (!rateLimit.allowed) {
      context.set.status = 429
      return {
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      }
    }

    try {
      const folderId = parseInt(context.params.id)

      if (isNaN(folderId)) {
        context.set.status = 400
        return {
          success: false,
          error: 'Invalid folder ID'
        }
      }

      const page = parseInt(context.query?.page as string || '1')
      const limit = Math.min(parseInt(context.query?.limit as string || '50'), 100)

      const stats = await this.folderService.getFolderWithStats(folderId)

      if (!stats) {
        context.set.status = 404
        return {
          success: false,
          error: 'Folder not found'
        }
      }

      const children = await this.folderService.getFolderChildren(folderId, { page, limit })

      return {
        success: true,
        data: {
          folder: stats.folder,
          children: children.items,
          files: stats.files,
          stats: {
            childrenCount: stats.childrenCount,
            filesCount: stats.filesCount
          },
          pagination: {
            page: children.page,
            limit: children.limit,
            total: children.total,
            totalPages: children.totalPages,
            hasNext: children.hasNext,
            hasPrev: children.hasPrev
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
  }

  async getRootFolders(context: Context) {
    const clientId = this.getClientIdentifier(context)
    const rateLimit = await this.rateLimiter.checkLimit(`root:${clientId}`)

    if (!rateLimit.allowed) {
      context.set.status = 429
      return {
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      }
    }

    try {
      const page = parseInt(context.query?.page as string || '1')
      const limit = Math.min(parseInt(context.query?.limit as string || '50'), 100)

      const rootFolders = await this.folderService.getFolderChildren(null, { page, limit })

      return {
        success: true,
        data: rootFolders.items,
        pagination: {
          page: rootFolders.page,
          limit: rootFolders.limit,
          total: rootFolders.total,
          totalPages: rootFolders.totalPages,
          hasNext: rootFolders.hasNext,
          hasPrev: rootFolders.hasPrev
        }
      }
    } catch (error) {
      console.error('Error fetching root folders:', error)
      return {
        success: false,
        error: 'Failed to fetch root folders'
      }
    }
  }

  async searchFoldersAndFiles(context: Context) {
    const clientId = this.getClientIdentifier(context)
    const rateLimit = await this.rateLimiter.checkLimit(`search:${clientId}`)

    if (!rateLimit.allowed) {
      context.set.status = 429
      return {
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      }
    }

    try {
      const searchQuery = context.query?.q as string
      const page = parseInt(context.query?.page as string || '1')
      const limitParam = context.query?.limit as string

      if (!searchQuery || searchQuery.trim().length === 0) {
        context.set.status = 400
        return {
          success: false,
          error: 'Search query is required'
        }
      }

      if (searchQuery.trim().length < 2) {
        context.set.status = 400
        return {
          success: false,
          error: 'Search query must be at least 2 characters'
        }
      }

      const limit = limitParam ? Math.min(parseInt(limitParam), 100) : 50
      const searchLimit = isNaN(limit) ? 50 : limit

      const results = await this.folderService.searchFoldersAndFiles({
        query: searchQuery.trim(),
        page,
        limit: searchLimit
      })

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
  }

  private getClientIdentifier(context: Context): string {
    return context.request.headers.get('x-forwarded-for') ||
           context.request.headers.get('x-real-ip') ||
           'unknown'
  }
}