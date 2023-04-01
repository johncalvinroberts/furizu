package blob

import (
	"net/http"
	"os"

	"github.com/johncalvinroberts/cryp/internal/utils"
	"github.com/johncalvinroberts/cryp/internal/whoami"
	"github.com/labstack/echo/v4"
)

func (svc *BlobService) HandleCreateBlob(c echo.Context) error {
	file, err := c.FormFile("file")
	if err != nil {
		return utils.RespondError(c, http.StatusBadRequest, err)
	}
	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()
	// get size of file
	var size int64
	switch t := src.(type) {
	case *os.File:
		stat, _ := t.Stat()
		size = stat.Size()
	default:
		size, _ = src.Seek(0, 0)
	}
	var (
		claims            = whoami.GetUserFromContext(c)
		email             = claims.Email
		title             = c.FormValue("title")
		blob, createError = svc.CreateBlob(src, title, email, size)
	)
	// TODO: more granular error handling
	if createError != nil {
		return utils.RespondError(c, http.StatusBadRequest, createError)
	}
	res := &UploadBlobResponseDTO{
		Blob{
			Url:       blob.Url,
			CreatedAt: blob.CreatedAt,
			UpdatedAt: blob.UpdatedAt,
			Title:     blob.Title,
			Key:       blob.Key,
			SizeBytes: blob.SizeBytes,
		},
	}
	return utils.RespondOK(c, res)
}

func (svc *BlobService) HandleListBlobs(c echo.Context) error {
	var (
		claims   = whoami.GetUserFromContext(c)
		email    = claims.Email
		ptr, err = svc.ListBlobs(email)
	)
	if err != nil {
		return utils.RespondError(c, http.StatusBadRequest, err)
	}
	res := &BlobPointersResponseDTO{
		BlobPointers{
			Blobs:        ptr.Blobs,
			Count:        ptr.Count,
			BalanceBytes: ptr.BalanceBytes,
		},
	}
	return utils.RespondOK(c, res)
}

func (svc *BlobService) HandleDeleteBlob(c echo.Context) error {
	var (
		key    = c.Param("key")
		claims = whoami.GetUserFromContext(c)
		email  = claims.Email
		err    = svc.DestroyBlob(email, key)
	)
	if err != nil {
		return utils.RespondError(c, http.StatusBadRequest, err)
	}
	return utils.RespondOK(c, nil)
}
