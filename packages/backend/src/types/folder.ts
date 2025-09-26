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

export interface File {
  id: number
  name: string
  folder_id: number
  size_bytes: number
  created_at: string
  updated_at: string
}