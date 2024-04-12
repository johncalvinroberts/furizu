CREATE TABLE IF NOT EXISTS "jobs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"command" varchar,
	"payload" jsonb,
	"result" jsonb,
	"progress" real NOT NULL,
	"created_at" timestamp NOT NULL,
	"electric_user_id" uuid NOT NULL,
	"completed_at" timestamp,
	"cancelled_at" timestamp,
	"errored_at" timestamp,
	"updated_at" timestamp NOT NULL
);




-- When a job is submitted, notify the appropriate service to process it
CREATE OR REPLACE FUNCTION process_job()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NULL AND NEW.cancelled_at IS NULL AND NEW.errored_at IS NULL THEN
    PERFORM pg_notify('process_job', row_to_json(NEW)::TEXT);
  END IF;
  RETURN NULL;
END
$$ LANGUAGE plpgsql;


-- Create a trigger to execute the function on INSERT into "jobs" table
CREATE TRIGGER "process_job_trigger"
AFTER INSERT ON "jobs"
FOR EACH ROW
EXECUTE FUNCTION process_job();



-- Enable the triggers on the tables
ALTER TABLE "jobs" ENABLE ALWAYS TRIGGER process_job_trigger;
ALTER TABLE "jobs" ENABLE ELECTRIC;