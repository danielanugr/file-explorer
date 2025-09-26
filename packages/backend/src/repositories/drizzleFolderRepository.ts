import { eq, isNull, asc, ilike, count } from 'drizzle-orm'
import { db } from '../config/drizzle'
import { folders, files } from '../schema'
import { IFolderRepository, PaginationOptions, SearchOptions, PaginatedResult } from '../domain/interfaces/IFolderRepository'
import { Folder, NewFolder, File, FolderWithChildren } from '../domain/entities/Folder'

export class DrizzleFolderRepository implements IFolderRepository {

  async findById(id: number): Promise<Folder | null> {
    const result = await db
      .select()
      .from(folders)
      .where(eq(folders.id, id))
      .limit(1) as Folder[]

    return result[0] || null
  }

  async findAll(options?: PaginationOptions): Promise<PaginatedResult<Folder>> {
    const page = options?.page || 1
    const limit = options?.limit || 50
    const offset = (page - 1) * limit

    const [items, totalResult] = await Promise.all([
      db.select()
        .from(folders)
        .orderBy(asc(folders.parentId), asc(folders.name))
        .limit(limit)
        .offset(offset) as Promise<Folder[]>,

      db.select({ count: count() })
        .from(folders)
    ])

    const total = totalResult[0].count
    const totalPages = Math.ceil(total / limit)

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }

  async findByParentId(parentId: number | null, options?: PaginationOptions): Promise<PaginatedResult<Folder>> {
    const page = options?.page || 1
    const limit = options?.limit || 50
    const offset = (page - 1) * limit

    const whereClause = parentId === null ? isNull(folders.parentId) : eq(folders.parentId, parentId)

    const [items, totalResult] = await Promise.all([
      db.select()
        .from(folders)
        .where(whereClause)
        .orderBy(asc(folders.name))
        .limit(limit)
        .offset(offset) as Promise<Folder[]>,

      db.select({ count: count() })
        .from(folders)
        .where(whereClause)
    ])

    const total = totalResult[0].count
    const totalPages = Math.ceil(total / limit)

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }

  async create(folderData: NewFolder): Promise<Folder> {
    const result = await db
      .insert(folders)
      .values({
        ...folderData,
        updatedAt: new Date(),
      })
      .returning() as Folder[]

    return result[0]
  }

  async update(id: number, folderData: Partial<NewFolder>): Promise<Folder | null> {
    const result = await db
      .update(folders)
      .set({
        ...folderData,
        updatedAt: new Date(),
      })
      .where(eq(folders.id, id))
      .returning() as Folder[]

    return result[0] || null
  }

  async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(folders)
      .where(eq(folders.id, id))

    return result.rowsAffected > 0
  }

  async getFolderTree(): Promise<Folder[]> {
    const allFolders = await this.findAll({ page: 1, limit: 10000 })

    const folderMap = new Map<number, FolderWithChildren>()
    const rootFolders: FolderWithChildren[] = []

    allFolders.items.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [] })
    })

    allFolders.items.forEach(folder => {
      const folderNode = folderMap.get(folder.id)!

      if (folder.parentId === null) {
        rootFolders.push(folderNode)
      } else {
        const parent = folderMap.get(folder.parentId)
        if (parent) {
          parent.children!.push(folderNode)
        }
      }
    })

    return rootFolders
  }

  async search(options: SearchOptions): Promise<{ folders: Folder[], files: File[] }> {
    const searchPattern = `%${options.query}%`
    const limit = Math.min(options.limit || 50, 100)

    const [matchingFolders, matchingFiles] = await Promise.all([
      db.select()
        .from(folders)
        .where(ilike(folders.name, searchPattern))
        .orderBy(asc(folders.name))
        .limit(limit),

      db.select()
        .from(files)
        .where(ilike(files.name, searchPattern))
        .orderBy(asc(files.name))
        .limit(limit)
    ]) as [Folder[], File[]]

    return {
      folders: matchingFolders,
      files: matchingFiles
    }
  }

  async getFolderStats(id: number): Promise<{ filesCount: number, childrenCount: number }> {
    const [filesResult, childrenResult] = await Promise.all([
      db.select({ count: count() })
        .from(files)
        .where(eq(files.folderId, id)),

      db.select({ count: count() })
        .from(folders)
        .where(eq(folders.parentId, id))
    ])

    return {
      filesCount: filesResult[0].count,
      childrenCount: childrenResult[0].count
    }
  }

  async getFilesInFolder(folderId: number): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(eq(files.folderId, folderId))
      .orderBy(asc(files.name)) as File[]
  }

  async getFolderWithStats(id: number): Promise<{
    folder: Folder | null
    filesCount: number
    childrenCount: number
    files: File[]
  }> {
    const folder = await this.getFolderById(id)

    if (!folder) {
      return { folder: null, filesCount: 0, childrenCount: 0, files: [] }
    }

    const [filesInFolder, children] = await Promise.all([
      this.getFilesInFolder(id),
      this.getFolderChildren(id)
    ])

    return {
      folder,
      filesCount: filesInFolder.length,
      childrenCount: children.length,
      files: filesInFolder,
    }
  }

  async searchFoldersAndFiles(query: string, limit: number = 50): Promise<{
    folders: Folder[]
    files: File[]
  }> {
    const searchPattern = `%${query}%`

    const [matchingFolders, matchingFiles] = await Promise.all([
      db.select()
        .from(folders)
        .where(ilike(folders.name, searchPattern))
        .orderBy(asc(folders.name))
        .limit(limit),

      db.select()
        .from(files)
        .where(ilike(files.name, searchPattern))
        .orderBy(asc(files.name))
        .limit(limit)
    ]) as [Folder[], File[]]

    return {
      folders: matchingFolders,
      files: matchingFiles
    }
  }
}