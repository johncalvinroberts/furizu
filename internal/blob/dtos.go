package blob

type Blob struct {
	Url       string `json:"url"`
	CreatedAt int64  `json:"createdAt"`
	UpdatedAt int64  `json:"updatedAt"`
	Title     string `json:"title"`
	Key       string `json:"key"`
	SizeBytes int64  `json:"sizeBytes"`
}
type BlobPointers struct {
	Blobs        []Blob `json:"blobs"`
	Count        int    `json:"count"`
	BalanceBytes int64  `json:"balanceBytes"`
}

type UploadBlobRequestDTO struct {
	Title      string `json:"title"`
	CrypString string `json:"crypString"`
}

type UploadBlobResponseDTO struct {
	Blob
}

type BlobPointersResponseDTO struct {
	BlobPointers
}
