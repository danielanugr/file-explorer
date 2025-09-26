import { pgTable, serial, varchar, integer, timestamp, bigint } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const folders = pgTable('folders', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  parentId: integer('parent_id').references(() => folders.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const files = pgTable('files', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  folderId: integer('folder_id').references(() => folders.id, { onDelete: 'cascade' }).notNull(),
  sizeBytes: bigint('size_bytes', { mode: 'number' }).default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const foldersRelations = relations(folders, ({ one, many }) => ({
  parent: one(folders, {
    fields: [folders.parentId],
    references: [folders.id],
    relationName: 'parent_child',
  }),
  children: many(folders, {
    relationName: 'parent_child',
  }),
  files: many(files),
}))

export const filesRelations = relations(files, ({ one }) => ({
  folder: one(folders, {
    fields: [files.folderId],
    references: [folders.id],
  }),
}))

export type Folder = typeof folders.$inferSelect
export type NewFolder = typeof folders.$inferInsert
export type File = typeof files.$inferSelect
export type NewFile = typeof files.$inferInsert