import {
  pgTable,
  text,
  varchar,
  uuid,
  timestamp,
  bigint,
  jsonb,
  real,
  customType,
  integer,
} from 'drizzle-orm/pg-core';
import { JobCommands, FileStates } from '@shared/types';
import { boolean } from 'drizzle-orm/mysql-core';

const bytea = customType<{ data: Buffer; notNull: false; default: false }>({
  dataType() {
    return 'bytea';
  },
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  fullName: text('full_name'),
  email: varchar('email'),
  password: varchar('password'),
  email_verified_at: timestamp('email_verified_at'),
  unprovisional_at: timestamp('unprovisional_at'),
  created_at: timestamp('created_at').notNull(),
  updated_at: timestamp('updated_at').notNull(),
  default_folder_id: uuid('default_folder_id'),
});

export const folders = pgTable('folders', {
  id: uuid('id').primaryKey(),
  parentId: uuid('parent_id').references(() => folders.id, {
    onDelete: 'cascade',
  }),
  electric_user_id: uuid('electric_user_id').notNull(),
  name: varchar('name').notNull(),
  created_at: timestamp('created_at').notNull(),
  updated_at: timestamp('updated_at').notNull(),
});

export const files = pgTable('files', {
  id: uuid('id').primaryKey(),
  folderId: uuid('folder_id')
    .notNull()
    .references(() => folders.id, { onDelete: 'cascade' }),
  name: varchar('name').notNull(),
  type: varchar('type').notNull(),
  size: bigint('size', { mode: 'bigint' }).notNull(),
  created_at: timestamp('created_at').notNull(),
  updated_at: timestamp('updated_at').notNull(),
  electric_user_id: uuid('electric_user_id').notNull(),
  state: varchar('state', { enum: FileStates }),
  locations: jsonb('locations'),
});

export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey(),
  command: varchar('command', { enum: JobCommands }),
  payload: jsonb('payload'),
  result: jsonb('result'),
  progress: real('progress').notNull(),
  created_at: timestamp('created_at').notNull(),
  electric_user_id: uuid('electric_user_id').notNull(),
  completed_at: timestamp('completed_at'),
  cancelled_at: timestamp('cancelled_at'),
  errored_at: timestamp('errored_at'),
  errored_reason: varchar('errored_reason'),
  updated_at: timestamp('updated_at').notNull(),
});

export const quotas = pgTable('quotas', {
  id: uuid('id').primaryKey(),
  bytes_total: bigint('bytes_total', { mode: 'bigint' }).notNull(),
  bytes_used: bigint('bytes_used', { mode: 'bigint' }).notNull(),
  electric_user_id: uuid('electric_user_id').notNull(),
  created_at: timestamp('created_at').notNull(),
  updated_at: timestamp('updated_at').notNull(),
});

export const file_chunks = pgTable('file_chunks', {
  id: uuid('id').primaryKey(),
  file_id: uuid('file_id')
    .notNull()
    .references(() => files.id, {
      onDelete: 'cascade',
    }),
  electric_user_id: uuid('electric_user_id').notNull(),
  size: bigint('size', { mode: 'bigint' }).notNull(),
  data: bytea('data').notNull(),
  created_at: timestamp('created_at').notNull(),
  updated_at: timestamp('updated_at').notNull(),
  chunk_index: integer('chunk_index').notNull(),
});
