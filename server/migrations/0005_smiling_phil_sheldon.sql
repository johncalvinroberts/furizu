CREATE TABLE IF NOT EXISTS "file_chunks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"file_id" uuid NOT NULL,
	"electric_user_id" uuid NOT NULL,
	"size" bigint NOT NULL,
	"data" "bytea" NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"chunk_index" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "origin_storage_key" varchar;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "origin_storage_provider" varchar;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "electric_user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "file_chunks" ADD CONSTRAINT "file_chunks_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "file_chunks" ENABLE ELECTRIC;