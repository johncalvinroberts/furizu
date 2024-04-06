import {
  pgTable,
  text,
  varchar,
  uuid,
  timestamp,
  bigint,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  fullName: text("full_name"),
  email: varchar("email"),
  password: varchar("password"),
  email_verified_at: timestamp("email_verified_at"),
  unprovisional_at: timestamp("unprovisional_at"),
  created_at: timestamp("created_at").notNull(),
  updated_at: timestamp("updated_at").notNull(),
});

// @ts-ignore
export const folders = pgTable("folders", {
  id: uuid("id").primaryKey(),
  parentId: uuid("parent_id").references(() => folders.id, {
    onDelete: "cascade",
  }),
  electricUserId: uuid("electric_user_id").notNull(),
  name: varchar("name").notNull(),
  created_at: timestamp("created_at").notNull(),
  updated_at: timestamp("updated_at").notNull(),
});

export const files = pgTable("files", {
  id: uuid("id").primaryKey(),
  folderId: uuid("folder_id")
    .notNull()
    .references(() => folders.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(),
  s3_key: varchar("s3_key").notNull(),
  size: bigint("size", { mode: "bigint" }).notNull(),
  created_at: timestamp("created_at").notNull(),
  updated_at: timestamp("updated_at").notNull(),
});
