import { Elysia } from 'elysia'
import { Container } from '../../infrastructure/di/Container'

export const createFoldersRouter = () => {
  const container = Container.getInstance()
  const folderController = container.getFolderController()

  return new Elysia({ prefix: '/api/v1/folders' })
    .get('/tree', (context) => folderController.getFolderTree(context))
    .get('/:id/children', (context) => folderController.getFolderChildren(context))
    .get('/root', (context) => folderController.getRootFolders(context))
    .get('/search', (context) => folderController.searchFoldersAndFiles(context))
}