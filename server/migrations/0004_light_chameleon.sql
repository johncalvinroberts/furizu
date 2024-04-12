CREATE TABLE IF NOT EXISTS "quotas" (
	"id" uuid PRIMARY KEY NOT NULL,
	"bytes_total" bigint NOT NULL,
	"bytes_used" bigint NOT NULL,
	"electric_user_id" uuid NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
ALTER TABLE "quotas" ENABLE ELECTRIC;