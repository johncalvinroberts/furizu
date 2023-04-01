package whoami

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
