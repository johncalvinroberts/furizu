package blob

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/johncalvinroberts/cryp/internal/errors"
	"github.com/johncalvinroberts/cryp/internal/storage"
	"github.com/johncalvinroberts/cryp/internal/utils"
	"github.com/rs/xid"
)

type BlobService struct {
	storageSrv                                             *storage.StorageService
	blobBucketName, blobPointerBucketName, emailMaskSecret string
	freeBalanceBytes                                       int64
}

func (svc *BlobService) CreateBlob(file, title, email string) (*Blob, error) {
	var (
		guid   = xid.New()
		id     = guid.String()
		key    = storage.ComposeKey(id, utils.EncryptMessage(svc.emailMaskSecret, email), "-upload.cryp")
		reader = strings.NewReader(file)
		size   = reader.Len()
	)
	fmt.Println(id)
	fmt.Println(key)
	location, err := svc.storageSrv.Write(svc.blobBucketName, key, reader)
	if err != nil {
		log.Printf("Failed to create blob when writing to storage: %v\n", err)
		return nil, errors.ErrDataCreationFailure
	}
	blob, err := svc.AddBlobPointer(location, key, title, email, int64(size))
	if err != nil {
		return nil, errors.ErrDataCreationFailure
	}
	return blob, nil
}

func (svc *BlobService) AddBlobPointer(url, key, title, email string, size int64) (*Blob, error) {
	var (
		now               = time.Now().Unix()
		blobToAdd         = &Blob{Url: url, CreatedAt: now, UpdatedAt: now, Key: key, Title: title, SizeBytes: size}
		blobPointers, err = svc.FindOrCreateBlobPointers(email)
		nextBalance       = blobPointers.BalanceBytes - size
	)
	if err != nil {
		return nil, err
	}
	if nextBalance < 0 {
		return nil, errors.ErrBalanceLimitExceeded
	}
	// TODO: need to lock the s3 object to prevent concurrent writes to the same object resulting in data loss
	blobPointers.Blobs = append(blobPointers.Blobs, *blobToAdd)
	blobPointers.Count++
	blobPointers.BalanceBytes = nextBalance
	encodedPointers, err := json.Marshal(blobPointers)
	if err != nil {
		return nil, err
	}
	_, err = svc.storageSrv.Write(svc.blobPointerBucketName, email, strings.NewReader(string(encodedPointers)))
	if err != nil {
		return nil, err
	}
	return blobToAdd, nil
}

func (svc *BlobService) FindOrCreateBlobPointers(email string) (*BlobPointers, error) {
	var (
		blobPointers = &BlobPointers{}
		exists, err  = svc.storageSrv.Exists(svc.blobPointerBucketName, email)
	)
	if err != nil {
		return nil, err
	}

	if exists {
		var existingJSONPointers string
		// read directly and copy to blobPointers
		existingJSONPointers, err = svc.storageSrv.ReadToString(svc.blobPointerBucketName, email)
		if err != nil {
			return nil, err
		}
		err = json.Unmarshal([]byte(existingJSONPointers), blobPointers)
	}

	if !exists {
		// create initial blobPointers file
		blobPointers.BalanceBytes = svc.freeBalanceBytes
		var emptyPointersJSON []byte
		// if doesn't exist, write the empty value to s3
		emptyPointersJSON, err = json.Marshal(blobPointers)
		if err != nil {
			return nil, err
		}
		// write to db
		_, err = svc.storageSrv.Write(svc.blobPointerBucketName, email, strings.NewReader(string(emptyPointersJSON)))
	}
	return blobPointers, err
}

func (svc *BlobService) ListBlobs(email string) (*BlobPointers, error) {
	// TODO: pagination?
	// pointersStr, err := svc.storageSrv.ReadToString(svc.blobPointerBucketName, email)
	pointers, err := svc.FindOrCreateBlobPointers(email)
	if err != nil {
		return nil, errors.ErrDataAccessFailure
	}
	return pointers, err
}

func (svc *BlobService) DestroyBlob(email, key string) error {
	var (
		keyComponents       = storage.DecomposeKey(key)
		decryptedEmail, err = utils.DecryptMessage(svc.emailMaskSecret, keyComponents[1])
		blobPointers        = &BlobPointers{}
	)
	if err != nil {
		return errors.ErrInternalServerError
	}
	// check if it belongs to bearer
	if decryptedEmail != email {
		return errors.ErrForbidden
	}
	// first, remove it from the blob pointers
	existingJSONPointers, err := svc.storageSrv.ReadToString(svc.blobPointerBucketName, email)
	if err != nil {
		return err
	}
	err = json.Unmarshal([]byte(existingJSONPointers), blobPointers)
	if err != nil {
		return err
	}
	var nextBlobs []Blob

	for _, blob := range blobPointers.Blobs {
		if blob.Key != key {
			nextBlobs = append(nextBlobs, blob)
		}
	}
	blobPointers.Blobs = nextBlobs
	blobPointers.Count--
	encodedPointers, err := json.Marshal(blobPointers)
	if err != nil {
		return err
	}
	_, err = svc.storageSrv.Write(svc.blobPointerBucketName, email, strings.NewReader(string(encodedPointers)))
	if err != nil {
		return err
	}
	// remove the blob, finally
	err = svc.storageSrv.Delete(svc.blobBucketName, key)
	return err
}

func InitBlobService(storageSrv *storage.StorageService, blobBucketName, blobPointerBucketName, emailMaskSecret string, freeBalanceBytes int64) *BlobService {
	fmt.Printf("blobBucketName %s\n", blobBucketName)
	fmt.Printf("blobBublobPointerBucketNamecketName %s\n", blobPointerBucketName)
	return &BlobService{
		storageSrv:            storageSrv,
		blobBucketName:        blobBucketName,
		blobPointerBucketName: blobPointerBucketName,
		emailMaskSecret:       emailMaskSecret,
		freeBalanceBytes:      freeBalanceBytes,
	}
}
