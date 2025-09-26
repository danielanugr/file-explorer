import { Folder, File, NewFolder } from '../entities/Folder'

export interface PaginationOptions {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface SearchOptions extends PaginationOptions {
  query: string
}

export interface IFolderRepository {
  findById(id: number): Promise<Folder | null>
  findAll(options?: PaginationOptions): Promise<PaginatedResult<Folder>>
  findByParentId(parentId: number | null, options?: PaginationOptions): Promise<PaginatedResult<Folder>>
  create(folderData: NewFolder): Promise<Folder>
  update(id: number, folderData: Partial<NewFolder>): Promise<Folder | null>
  delete(id: number): Promise<boolean>
  search(options: SearchOptions): Promise<{ folders: Folder[], files: File[] }>
  getFolderTree(): Promise<Folder[]>
  getFolderStats(id: number): Promise<{ filesCount: number, childrenCount: number }>
  getFilesInFolder(folderId: number): Promise<File[]>
}