export interface Folder {
  id: number
  name: string
  parent_id: number | null
  created_at: string
  updated_at: string
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

export interface FolderChildrenResponse {
  folder: Folder
  children: Folder[]
  files: File[]
  stats: {
    childrenCount: number
    filesCount: number
  }
}