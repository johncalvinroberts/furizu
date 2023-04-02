package blob

import (
	"net/http"

	"github.com/johncalvinroberts/cryp/internal/utils"
	"github.com/johncalvinroberts/cryp/internal/whoami"
	"github.com/labstack/echo/v4"
)

func (svc *BlobService) HandleCreateBlob(c echo.Context) error {
	req := &UploadBlobRequestDTO{}
	err := c.Bind(req)
	if err != nil {
		return utils.RespondError(c, http.StatusBadRequest, err)
	}
	var (
		claims          = whoami.GetUserFromContext(c)
		email           = claims.Email
		blob, createErr = svc.CreateBlob(req.CrypString, req.Title, email)
	)
	// TODO: more granular error handling
	if createErr != nil {
		return utils.RespondError(c, http.StatusBadRequest, createErr)
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
