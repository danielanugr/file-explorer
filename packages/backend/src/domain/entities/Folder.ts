export interface Folder {
  id: number
  name: string
  parentId: number | null
  createdAt: Date
  updatedAt: Date
}

export interface NewFolder {
  name: string
  parentId: number | null
}

export interface FolderWithChildren extends Folder {
  children?: FolderWithChildren[]
}

export interface File {
  id: number
  name: string
  folderId: number
  sizeBytes: number
  createdAt: Date
  updatedAt: Date
}

export interface NewFile {
  name: string
  folderId: number
  sizeBytes: number
}