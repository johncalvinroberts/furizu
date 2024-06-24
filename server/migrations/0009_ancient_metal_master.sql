CREATE TABLE IF NOT EXISTS "file_keys" (
	"id" uuid PRIMARY KEY NOT NULL,
	"file_id" uuid NOT NULL,
	"electric_user_id" uuid NOT NULL,
	"encrypted_symmetric_key" varchar,
	"iv" varchar NOT NULL,
	"public_key_id" uuid NOT NULL
);

CREATE TABLE IF NOT EXISTS "public_keys" (
	"id" uuid PRIMARY KEY NOT NULL,
	"electric_user_id" uuid NOT NULL,
	"value" varchar NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);



ALTER TABLE "files" ADD COLUMN "iv" varchar NOT NULL;
ALTER TABLE "file_keys" ADD CONSTRAINT "file_keys_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;


ALTER TABLE "file_keys" ADD CONSTRAINT "file_keys_public_key_id_public_keys_id_fk" FOREIGN KEY ("public_key_id") REFERENCES "public"."public_keys"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "public_keys" ENABLE ELECTRIC;
ALTER TABLE "file_keys" ENABLE ELECTRIC;