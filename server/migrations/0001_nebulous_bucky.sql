CREATE TABLE IF NOT EXISTS "files" (
	"id" uuid PRIMARY KEY NOT NULL,
	"folder_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar NOT NULL,
	"size" bigint NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "folders" (
	"id" uuid PRIMARY KEY NOT NULL,
	"parent_id" uuid,
	"electric_user_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);

ALTER TABLE "files" ADD CONSTRAINT "files_folder_id_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "folders" ADD CONSTRAINT "folders_parent_id_folders_id_fk" FOREIGN KEY ("parent_id") REFERENCES "folders"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "folders" ENABLE ELECTRIC;
ALTER TABLE "files" ENABLE ELECTRIC;