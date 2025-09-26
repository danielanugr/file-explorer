import type { FolderTree, Folder, APIResponse, FolderChildrenResponse } from '../types/folder'

const API_BASE_URL = 'http://localhost:3000/api'

class FolderService {
  private async fetchAPI<T>(endpoint: string): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      return {
        success: false,
        data: null as any,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Get complete folder tree
  async getFolderTree(): Promise<APIResponse<FolderTree[]>> {
    return this.fetchAPI<FolderTree[]>('/folders/tree')
  }

  // Get direct children of a folder
  async getFolderChildren(folderId: number): Promise<APIResponse<FolderChildrenResponse>> {
    return this.fetchAPI<FolderChildrenResponse>(`/folders/${folderId}/children`)
  }

  // Get root folders
  async getRootFolders(): Promise<APIResponse<Folder[]>> {
    return this.fetchAPI<Folder[]>('/folders/root')
  }
}

// Export singleton instance
export const folderService = new FolderService()