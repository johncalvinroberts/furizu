CREATE TABLE blobs (
    id char(20) PRIMARY KEY NOT NULL,
    email_digest TEXT,
    title TEXT,
    s3 jsonb,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc'),
    size_bytes INTEGER
);


CREATE TRIGGER blobs_modtime
BEFORE UPDATE ON blobs
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
