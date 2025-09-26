import { eq, isNull, asc } from 'drizzle-orm'
import { db } from '../config/drizzle'
import { folders, files, type Folder, type NewFolder, type File } from '../schema'

// Enhanced folder type with children for tree structure
export interface FolderWithChildren extends Folder {
  children?: FolderWithChildren[]
}

export class DrizzleFolderRepository {

  // Get all folders (flat list)
  async getAllFolders(): Promise<Folder[]> {
    const result = await db
      .select()
      .from(folders)
      .orderBy(
        asc(folders.parentId), // NULL values first (root folders)
        asc(folders.name)
      )

    return result
  }

  // Get direct children of a folder (or root folders if parentId is null)
  async getFolderChildren(parentId: number | null): Promise<Folder[]> {
    if (parentId === null) {
      // Get root folders
      return await db
        .select()
        .from(folders)
        .where(isNull(folders.parentId))
        .orderBy(asc(folders.name))
    } else {
      // Get children of specific folder
      return await db
        .select()
        .from(folders)
        .where(eq(folders.parentId, parentId))
        .orderBy(asc(folders.name))
    }
  }

  // Build complete folder tree structure
  async getFolderTree(): Promise<FolderWithChildren[]> {
    const allFolders = await this.getAllFolders()

    // Create a map for quick lookup
    const folderMap = new Map<number, FolderWithChildren>()
    const rootFolders: FolderWithChildren[] = []

    // First pass: create all folder objects with empty children arrays
    allFolders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [] })
    })

    // Second pass: build the tree structure
    allFolders.forEach(folder => {
      const folderNode = folderMap.get(folder.id)!

      if (folder.parentId === null) {
        // Root folder
        rootFolders.push(folderNode)
      } else {
        // Child folder - add to parent's children
        const parent = folderMap.get(folder.parentId)
        if (parent) {
          parent.children!.push(folderNode)
        }
      }
    })

    return rootFolders
  }

  // Get folder by ID
  async getFolderById(id: number): Promise<Folder | null> {
    const result = await db
      .select()
      .from(folders)
      .where(eq(folders.id, id))
      .limit(1)

    return result[0] || null
  }

  // Create new folder
  async createFolder(folderData: NewFolder): Promise<Folder> {
    const result = await db
      .insert(folders)
      .values({
        ...folderData,
        updatedAt: new Date(),
      })
      .returning()

    return result[0]
  }

  // Update folder
  async updateFolder(id: number, folderData: Partial<NewFolder>): Promise<Folder | null> {
    const result = await db
      .update(folders)
      .set({
        ...folderData,
        updatedAt: new Date(),
      })
      .where(eq(folders.id, id))
      .returning()

    return result[0] || null
  }

  // Delete folder (cascades to children and files)
  async deleteFolder(id: number): Promise<boolean> {
    const result = await db
      .delete(folders)
      .where(eq(folders.id, id))

    return result.rowCount > 0
  }

  // Get files in a folder
  async getFilesInFolder(folderId: number): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(eq(files.folderId, folderId))
      .orderBy(asc(files.name))
  }

  // Get folder with its files and children count
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
}