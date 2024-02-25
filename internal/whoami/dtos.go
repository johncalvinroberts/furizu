package whoami

import "time"

type StartWhoamiChallengeDTO struct {
	Email string `json:"email"`
}

type TryWhoamiChallengeRequestDTO struct {
	Email string `json:"email"`
	OTP   string `json:"otp"`
}

type TryWhoamiChallengeResponseDTO struct {
	JWT string `json:"jwt"`
}

type RefreshWhoamiTokenResponseDTO struct {
	JWT string `json:"jwt"`
}

type GetWhoamiResponseDTO struct {
	Email string `json:"email"`
}

type WhoamiChallengeRow struct {
	Id          *int      `db:"id"`
	Otp         string    `db:"otp"`
	EmailDigest string    `db:"email_digest"`
	CreatedAt   time.Time `db:"created_at"`
	UpdatedAt   time.Time `db:"updated_at"`
}
