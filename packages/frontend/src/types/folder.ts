export interface Folder {
  id: number
  name: string
  parentId: number | null
  createdAt: string
  updatedAt: string
}

export interface FolderTree extends Folder {
  children?: FolderTree[]
}

export interface APIResponse<T> {
  success: boolean
  data: T
  error?: string
}

export interface File {
  id: number
  name: string
  folderId: number
  sizeBytes?: number
  createdAt: string
  updatedAt: string
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface FolderChildrenResponse {
  folder: Folder
  children: Folder[]
  files: File[]
  stats: {
    childrenCount: number
    filesCount: number
  }
  pagination?: PaginationInfo
}

export interface SearchResponse {
  query: string
  results: {
    folders: Folder[]
    files: File[]
  }
  counts: {
    folders: number
    files: number
    total: number
  }
}