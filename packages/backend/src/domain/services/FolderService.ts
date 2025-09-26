import { IFolderService, FolderWithStats } from './IFolderService'
import { IFolderRepository, PaginationOptions, SearchOptions, PaginatedResult } from '../interfaces/IFolderRepository'
import { ICacheService } from '../interfaces/ICacheService'
import { Folder, File } from '../entities/Folder'

export class FolderService implements IFolderService {
  constructor(
    private folderRepository: IFolderRepository,
    private cacheService: ICacheService
  ) {}

  async getFolderById(id: number): Promise<Folder | null> {
    const cacheKey = `folder:${id}`

    let folder = await this.cacheService.get<Folder>(cacheKey)
    if (folder) {
      return folder
    }

    folder = await this.folderRepository.findById(id)
    if (folder) {
      await this.cacheService.set(cacheKey, folder, 300)
    }

    return folder
  }

  async getFolderTree(): Promise<Folder[]> {
    const cacheKey = 'folder_tree'

    let tree = await this.cacheService.get<Folder[]>(cacheKey)
    if (tree) {
      return tree
    }

    tree = await this.folderRepository.getFolderTree()
    await this.cacheService.set(cacheKey, tree, 180)

    return tree
  }

  async getFolderChildren(parentId: number | null, options?: PaginationOptions): Promise<PaginatedResult<Folder>> {
    const cacheKey = `folder_children:${parentId}:${JSON.stringify(options)}`

    let children = await this.cacheService.get<PaginatedResult<Folder>>(cacheKey)
    if (children) {
      return children
    }

    children = await this.folderRepository.findByParentId(parentId, options)
    await this.cacheService.set(cacheKey, children, 120)

    return children
  }

  async getFolderWithStats(id: number): Promise<FolderWithStats | null> {
    const cacheKey = `folder_stats:${id}`

    let stats = await this.cacheService.get<FolderWithStats>(cacheKey)
    if (stats) {
      return stats
    }

    const folder = await this.folderRepository.findById(id)
    if (!folder) {
      return null
    }

    const [folderStats, children, files] = await Promise.all([
      this.folderRepository.getFolderStats(id),
      this.folderRepository.findByParentId(id),
      this.folderRepository.getFilesInFolder(id)
    ])

    stats = {
      folder,
      filesCount: folderStats.filesCount,
      childrenCount: folderStats.childrenCount,
      files: files,
      children: children.items
    }

    await this.cacheService.set(cacheKey, stats, 60)
    return stats
  }

  async searchFoldersAndFiles(options: SearchOptions): Promise<{ folders: Folder[], files: File[] }> {
    const cacheKey = `search:${JSON.stringify(options)}`

    let results = await this.cacheService.get<{ folders: Folder[], files: File[] }>(cacheKey)
    if (results) {
      return results
    }

    results = await this.folderRepository.search(options)
    await this.cacheService.set(cacheKey, results, 30)

    return results
  }

  async createFolder(name: string, parentId: number | null): Promise<Folder> {
    const folder = await this.folderRepository.create({ name, parentId })

    await this.invalidateFolderCaches(parentId)
    await this.cacheService.delete('folder_tree')

    return folder
  }

  async updateFolder(id: number, name: string): Promise<Folder | null> {
    const existingFolder = await this.folderRepository.findById(id)
    if (!existingFolder) {
      return null
    }

    const folder = await this.folderRepository.update(id, { name })

    if (folder) {
      await this.invalidateFolderCaches(folder.parentId)
      await this.cacheService.delete(`folder:${id}`)
      await this.cacheService.delete('folder_tree')
    }

    return folder
  }

  async deleteFolder(id: number): Promise<boolean> {
    const folder = await this.folderRepository.findById(id)
    if (!folder) {
      return false
    }

    const deleted = await this.folderRepository.delete(id)

    if (deleted) {
      await this.invalidateFolderCaches(folder.parentId)
      await this.cacheService.delete(`folder:${id}`)
      await this.cacheService.delete('folder_tree')
    }

    return deleted
  }

  private async invalidateFolderCaches(parentId: number | null): Promise<void> {
    await this.cacheService.deletePattern(`folder_children:${parentId}:*`)
    await this.cacheService.deletePattern(`folder_stats:*`)
    await this.cacheService.deletePattern('search:*')
  }
}