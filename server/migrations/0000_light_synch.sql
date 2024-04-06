CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text,
	"email" varchar,
	"password" varchar,
	"email_verified_at" timestamp,
	"unprovisional_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);

ALTER TABLE "users" ENABLE ELECTRIC;