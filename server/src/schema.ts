import {
  pgTable,
  text,
  varchar,
  uuid,
  timestamp,
  bigint,
  jsonb,
  real,
  serial,
} from 'drizzle-orm/pg-core';

export const JobCommands = ['provisional_user_created', 'signup'] as const;

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  fullName: text('full_name'),
  email: varchar('email'),
  password: varchar('password'),
  email_verified_at: timestamp('email_verified_at'),
  unprovisional_at: timestamp('unprovisional_at'),
  created_at: timestamp('created_at').notNull(),
  updated_at: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
});

export const folders = pgTable('folders', {
  id: uuid('id').primaryKey(),
  parentId: uuid('parent_id').references(() => folders.id, {
    onDelete: 'cascade',
  }),
  electric_user_id: uuid('electric_user_id').notNull(),
  name: varchar('name').notNull(),
  created_at: timestamp('created_at').notNull(),
  updated_at: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
});

export const files = pgTable('files', {
  id: uuid('id').primaryKey(),
  folderId: uuid('folder_id')
    .notNull()
    .references(() => folders.id, { onDelete: 'cascade' }),
  name: varchar('name').notNull(),
  type: varchar('type').notNull(),
  s3_key: varchar('s3_key').notNull(),
  size: bigint('size', { mode: 'bigint' }).notNull(),
  created_at: timestamp('created_at').notNull(),
  updated_at: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
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
  updated_at: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
});

export const quotas = pgTable('quotas', {
  id: uuid('id').primaryKey(),
  bytes_total: bigint('bytes_total', { mode: 'bigint' }).notNull(),
  bytes_used: bigint('bytes_used', { mode: 'bigint' }).notNull(),
  electric_user_id: uuid('electric_user_id').notNull(),
  created_at: timestamp('created_at').notNull(),
  updated_at: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
});
