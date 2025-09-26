// Export all schemas and relations
export * from './folders'

import { folders, files, foldersRelations, filesRelations } from './folders'

// Schema object for Drizzle
export const schema = {
  folders,
  files,
  foldersRelations,
  filesRelations,
}