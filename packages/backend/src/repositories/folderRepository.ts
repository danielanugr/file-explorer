import { pool } from '../config/database'
import { Folder, FolderTree } from '../types/folder'

export class FolderRepository {

  async getAllFolders(): Promise<Folder[]> {
    const result = await pool.query(`
      SELECT id, name, parent_id, created_at, updated_at
      FROM folders
      ORDER BY parent_id NULLS FIRST, name
    `)
    return result.rows
  }

  async getFolderChildren(parentId: number | null): Promise<Folder[]> {
    const query = parentId === null
      ? 'SELECT id, name, parent_id, created_at, updated_at FROM folders WHERE parent_id IS NULL ORDER BY name'
      : 'SELECT id, name, parent_id, created_at, updated_at FROM folders WHERE parent_id = $1 ORDER BY name'

    const params = parentId === null ? [] : [parentId]
    const result = await pool.query(query, params)
    return result.rows
  }

  async getFolderTree(): Promise<FolderTree[]> {
    const folders = await this.getAllFolders()

    const folderMap = new Map<number, FolderTree>()
    const rootFolders: FolderTree[] = []

    folders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [] })
    })

    folders.forEach(folder => {
      const folderNode = folderMap.get(folder.id)!

      if (folder.parent_id === null) {
        rootFolders.push(folderNode)
      } else {
        const parent = folderMap.get(folder.parent_id)
        if (parent) {
          parent.children!.push(folderNode)
        }
      }
    })

    return rootFolders
  }

  async getFolderById(id: number): Promise<Folder | null> {
    const result = await pool.query(
      'SELECT id, name, parent_id, created_at, updated_at FROM folders WHERE id = $1',
      [id]
    )
    return result.rows[0] || null
  }
}