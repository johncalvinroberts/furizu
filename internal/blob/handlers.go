package blob

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

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
	blobDTO := svc.TransformBlobPGRowToBlobDTO(*blob)
	return utils.RespondOK(c, blobDTO)
}

func (svc *BlobService) HandleListBlobs(c echo.Context) error {
	cursorParam := c.QueryParam("cursor")
	countParam := c.QueryParam("count")
	countQs, _ := strconv.Atoi(countParam)
	cursorQs, _ := strconv.Atoi(cursorParam)
	// default to now
	if cursorQs == 0 {
		cursorQs = int(time.Now().Unix())
	}
	// default to page size of 50
	if countQs == 0 {
		countQs = 50
	}
	var (
		claims           = whoami.GetUserFromContext(c)
		email            = claims.Email
		blobRows, err    = svc.ListBlobs(email, cursorQs, countQs)
		count, count_err = svc.CountBlobs(email)
	)
	fmt.Printf("blobRows: %v\n", blobRows)
	if err != nil || count_err != nil {
		return utils.RespondError(c, http.StatusBadRequest, err)
	}
	blobs := make([]BlobDTO, len(blobRows))
	for i, blobRow := range blobRows {
		blobDTO := svc.TransformBlobPGRowToBlobDTO(*blobRow)
		blobs[i] = *blobDTO
	}

	res := &BlobPointersResponseDTO{
		Blobs: blobs,
		Count: count,
	}
	return utils.RespondOK(c, res)
}

func (svc *BlobService) HandleDeleteBlob(c echo.Context) error {
	var (
		key    = c.Param("id")
		claims = whoami.GetUserFromContext(c)
		email  = claims.Email
		err    = svc.DestroyBlob(email, key)
	)
	if err != nil {
		return utils.RespondError(c, http.StatusBadRequest, err)
	}
	return utils.RespondOK(c, nil)
}
