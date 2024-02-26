package blob

import (
	"encoding/json"
	"log"
	"strings"

	"github.com/johncalvinroberts/cryp/internal/database"
	"github.com/johncalvinroberts/cryp/internal/errors"
	"github.com/johncalvinroberts/cryp/internal/storage"
	"github.com/johncalvinroberts/cryp/internal/utils"
	"github.com/rs/xid"
)

type BlobService struct {
	storageSrv       *storage.StorageService
	dbSrv            *database.DatabaseService
	blobBucketName   string
	freeBalanceBytes int64
}

func (svc *BlobService) CreateBlob(file, title, email string) (*BlobPGRow, error) {
	var (
		guid        = xid.New()
		id          = guid.String()
		reader      = strings.NewReader(file)
		size        = reader.Len()
		emailDigest = utils.Sha256Hash(email)
		key         = storage.ComposeKey(id, emailDigest, "-upload.cryp")
	)
	s3URL, err := svc.storageSrv.Write(svc.blobBucketName, key, reader)
	if err != nil {
		return nil, err
	}
	s3Pointer := &AWSS3PointerJSONB{Key: key, URL: s3URL}
	s3PointerJSON, err := json.Marshal(s3Pointer)
	if err != nil {
		return nil, err
	}
	_, err = svc.dbSrv.DB.Exec(`
		INSERT INTO blobs (id, title, email_digest, size_bytes, s3)
		VALUES ($1, $2, $3, $4, $5)
		`, id, title, emailDigest, size, s3PointerJSON)
	if err != nil {
		log.Printf("Failed to create blob: %v\n", err)
		return nil, errors.ErrDataCreationFailure
	}
	blob, err := svc.FindBlobById(id)
	if err != nil {
		log.Printf("Failed to query blob: %v\n", err)
		return nil, errors.ErrDataCreationFailure
	}
	return blob, nil
}

func (svc *BlobService) FindBlobById(id string) (*BlobPGRow, error) {
	blob := &BlobPGRow{}
	query := "SELECT * FROM blobs WHERE id = $1"
	err := svc.dbSrv.DB.Get(blob, query, id)
	if err != nil {
		return nil, err
	}
	return blob, nil
}

func (svc *BlobService) ListBlobs(email string, cursor int, limit int) ([]*BlobPGRow, error) {
	emailDigest := utils.Sha256Hash(email)
	blobs := []*BlobPGRow{}
	query := `SELECT * FROM blobs WHERE email_digest = $1 AND created_at < to_timestamp($2) ORDER BY created_at DESC LIMIT $3`
	err := svc.dbSrv.DB.Select(&blobs, query, emailDigest, int64(cursor), limit)
	if err != nil {
		return nil, err
	}
	return blobs, nil
}

func (svc *BlobService) CountBlobs(email string) (int, error) {
	emailDigest := utils.Sha256Hash(email)
	var count int
	err := svc.dbSrv.DB.Get(&count, "SELECT COUNT(*) FROM blobs WHERE email_digest = $1", emailDigest)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (svc *BlobService) DestroyBlob(email, key string) error {
	return errors.ErrNotImplemented
}

func (svc *BlobService) TransformBlobPGRowToBlobDTO(blob BlobPGRow) *BlobDTO {
	s3Pointer := &S3PointerDTO{Key: blob.AwsS3Pointer.Key, URL: blob.AwsS3Pointer.URL}
	return &BlobDTO{
		Id:        blob.Id,
		Title:     blob.Title,
		SizeBytes: blob.SizeBytes,
		CreatedAt: blob.CreatedAt,
		UpdatedAt: blob.UpdatedAt,
		S3:        *s3Pointer,
	}
}

func InitBlobService(storageSrv *storage.StorageService, dbSrv *database.DatabaseService, blobBucketName string, freeBalanceBytes int64) *BlobService {
	return &BlobService{
		storageSrv:       storageSrv,
		dbSrv:            dbSrv,
		blobBucketName:   blobBucketName,
		freeBalanceBytes: freeBalanceBytes,
	}
}
