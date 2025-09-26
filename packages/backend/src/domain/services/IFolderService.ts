import { Folder, File } from '../entities/Folder'
import { PaginatedResult, PaginationOptions, SearchOptions } from '../interfaces/IFolderRepository'

export interface FolderWithStats {
  folder: Folder
  filesCount: number
  childrenCount: number
  files: File[]
  children: Folder[]
}

export interface IFolderService {
  getFolderById(id: number): Promise<Folder | null>
  getFolderTree(): Promise<Folder[]>
  getFolderChildren(parentId: number | null, options?: PaginationOptions): Promise<PaginatedResult<Folder>>
  getFolderWithStats(id: number): Promise<FolderWithStats | null>
  searchFoldersAndFiles(options: SearchOptions): Promise<{ folders: Folder[], files: File[] }>
  createFolder(name: string, parentId: number | null): Promise<Folder>
  updateFolder(id: number, name: string): Promise<Folder | null>
  deleteFolder(id: number): Promise<boolean>
}