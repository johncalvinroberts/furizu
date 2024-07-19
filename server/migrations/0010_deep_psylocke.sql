CREATE TABLE IF NOT EXISTS "file_locations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"file_id" uuid NOT NULL,
	"electric_user_id" uuid NOT NULL,
	"provider_name" varchar NOT NULL,
	"provider_type" varchar,
	"key" varchar NOT NULL,
	"bucket_name" varchar
);

ALTER TABLE "file_locations" ADD CONSTRAINT "file_locations_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;

-- ALTER TABLE "files" DROP COLUMN IF EXISTS "locations";
ALTER TABLE "files" ENABLE ELECTRIC;

ALTER TABLE "file_locations" ENABLE ELECTRIC;