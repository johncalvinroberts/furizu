CREATE TABLE whoami_challenges (
    id SERIAL PRIMARY KEY,
    otp TEXT,
    email_digest TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
);

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = (NOW() AT TIME ZONE 'utc');
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER whoami_challenges_name_modtime
BEFORE UPDATE ON whoami_challenges
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
