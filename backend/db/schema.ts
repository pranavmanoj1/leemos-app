import {
    pgTable, bigint, text, integer, jsonb, primaryKey
  } from 'drizzle-orm/pg-core';
  
  export const books = pgTable('books', {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    title: text('title').notNull(),
    author: text('author').notNull(),
  });
  
  export const chapters = pgTable('chapters', {
    id: text('id').primaryKey(),                    // ChapterId is a string
    bookId: bigint('book_id', { mode: 'number' })
      .notNull()
      .references(() => books.id, { onDelete: 'cascade' }),
    prose: text('prose').notNull(),
    position: integer('position').notNull(),        // preserves chapter order
  });
  
