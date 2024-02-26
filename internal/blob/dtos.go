package blob

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

type BlobDTO struct {
	Id        string       `json:"id"`
	Title     string       `json:"title"`
	SizeBytes int64        `json:"sizeBytes"`
	CreatedAt time.Time    `json:"createdAt"`
	UpdatedAt time.Time    `json:"updatedAt"`
	S3Pointer S3PointerDTO `json:"s3Pointer"`
}

type S3PointerDTO struct {
	URL string `json:"URL"`
	Key string `json:"key"`
}

type BlobPGRow struct {
	Id           string
	Title        string            `db:"title"`
	SizeBytes    int64             `db:"size_bytes"`
	EmailDigest  string            `db:"email_digest"`
	AwsS3Pointer AWSS3PointerJSONB `db:"aws_s3"`
	CreatedAt    time.Time         `db:"created_at"`
	UpdatedAt    time.Time         `db:"updated_at"`
}

type UploadBlobRequestDTO struct {
	Title      string `json:"title"`
	CrypString string `json:"crypString"`
}

type UploadBlobResponseDTO struct {
	BlobDTO
}

type BlobPointersResponseDTO struct {
	Blobs []BlobDTO `json:"blobs"`
	Count int       `json:"count"`
}

type AWSS3PointerJSONB struct {
	Key string `json:"key"`
}

func (p *AWSS3PointerJSONB) Scan(src interface{}) error {
	if src == nil {
		return nil
	}
	switch val := src.(type) {
	case string:
		return json.Unmarshal([]byte(val), p)
	case []byte:
		return json.Unmarshal(val, p)
	default:
		return errors.New("incompatible type for AWSS3PointerJSONB")
	}
}

func (p AWSS3PointerJSONB) Value() (driver.Value, error) {
	return json.Marshal(p)
}
