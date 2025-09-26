import { pgTable, serial, varchar, integer, timestamp, bigint } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Folders table with self-referencing relationship
export const folders = pgTable('folders', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  parentId: integer('parent_id').references(() => folders.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Files table
export const files = pgTable('files', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  folderId: integer('folder_id').references(() => folders.id, { onDelete: 'cascade' }).notNull(),
  sizeBytes: bigint('size_bytes', { mode: 'number' }).default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Define relationships
export const foldersRelations = relations(folders, ({ one, many }) => ({
  // Parent folder (many folders can have one parent)
  parent: one(folders, {
    fields: [folders.parentId],
    references: [folders.id],
    relationName: 'parent_child',
  }),
  // Child folders (one folder can have many children)
  children: many(folders, {
    relationName: 'parent_child',
  }),
  // Files in this folder
  files: many(files),
}))

export const filesRelations = relations(files, ({ one }) => ({
  // Folder that contains this file
  folder: one(folders, {
    fields: [files.folderId],
    references: [folders.id],
  }),
}))

// Export types inferred from schema
export type Folder = typeof folders.$inferSelect
export type NewFolder = typeof folders.$inferInsert
export type File = typeof files.$inferSelect
export type NewFile = typeof files.$inferInsert