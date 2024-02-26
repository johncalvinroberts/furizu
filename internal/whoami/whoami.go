package whoami

import (
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/johncalvinroberts/cryp/internal/database"
	"github.com/johncalvinroberts/cryp/internal/email"
	"github.com/johncalvinroberts/cryp/internal/errors"
	"github.com/johncalvinroberts/cryp/internal/token"
	"github.com/johncalvinroberts/cryp/internal/utils"
)

const (
	OTP_LENGTH         = 6
	OTP_TTL            = 10 * time.Minute
	CTX_JWT_KEY        = "CTX_JWT_KEY"
	CTX_JWT_CLAIMS_KEY = "CTX_JWT_CLAIMS_KEY"
	CTX_JWT_EMAIL      = "CTX_JWT_EMAIL"
)

type WhoamiService struct {
	secret   string
	dbSrv    *database.DatabaseService
	emailSrv *email.EmailService
	tokenSrv *token.TokenService
}

// create otp + start whoami flow
func (svc *WhoamiService) StartWhoamiChallenge(email string) error {
	if email == "" {
		return errors.ErrValidationFailure
	}
	otp := utils.RandomSecret(OTP_LENGTH)
	emailDigest := utils.Sha256Hash(strings.TrimSpace(email))
	_, err := svc.dbSrv.DB.Exec("INSERT INTO whoami_challenges (email_digest, otp) VALUES ($1, $2)", emailDigest, otp)
	if err != nil {
		return errors.ErrDataCreationFailure
	}
	msg := fmt.Sprintf("Your one-time password for Cryp: <code>%s</code>", otp)
	err = svc.emailSrv.SendANiceEmail(email, msg, "Cryp One-time password")
	if err != nil {
		return err
	}
	return nil
}

// redeem otp
func (svc *WhoamiService) TryWhoamiChallenge(email string, otp string) (string, error) {
	if email == "" || otp == "" {
		return "", errors.ErrValidationFailure
	}
	challenge := &WhoamiChallengePGRow{}
	emailDigest := utils.Sha256Hash(email)
	err := svc.dbSrv.DB.Get(challenge, "SELECT * FROM whoami_challenges WHERE otp=$1 AND email_digest=$2", strings.TrimSpace(otp), strings.TrimSpace(emailDigest))
	if err != nil || otp != challenge.Otp || challenge.Otp == "" {
		log.Println("whoami challenge failed or not found")
		// cheap throttling
		time.Sleep(2 * time.Second)
		return "", errors.ErrWhoamiChallengeNotFound
	}
	if time.Since(challenge.CreatedAt) > OTP_TTL {
		log.Println("OTP has expired")
		return "", errors.ErrWhoamiChallengeExpired
	}
	jwt, err := svc.tokenSrv.IssueJWT(email)
	if err != nil {
		log.Printf("failed to issue jwt: %v\n", err)
		return "", errors.ErrInternalServerError
	}
	// cleanup
	defer svc.DestroyWhoamiChallenge(emailDigest)
	return jwt, nil
}

func (svc *WhoamiService) DestroyWhoamiChallenge(emailDigest string) {
	_, err := svc.dbSrv.DB.Exec("DELETE FROM whoami_challenges WHERE email = $1", emailDigest)
	if err != nil {
		log.Printf("failed to delete whoami challenge, key")
	}
}

func (svc *WhoamiService) RefreshWhoamiToken(token string, claims *token.Claims) (string, error) {
	// TODO: validate token against database
	email := claims.Email
	jwt, err := svc.tokenSrv.IssueJWT(email)
	if err != nil {
		log.Printf("failed to issue jwt: %v\n", err)
		return "", errors.ErrInternalServerError
	}
	return jwt, nil
}

func (svc *WhoamiService) GetWhoami() error {
	return nil
}

func InitWhoamiService(JWTSecret string, TokenTTLMins int, dbSrv *database.DatabaseService, emailSrv *email.EmailService) *WhoamiService {
	return &WhoamiService{
		secret:   JWTSecret,
		emailSrv: emailSrv,
		dbSrv:    dbSrv,
		tokenSrv: &token.TokenService{
			Secret:   JWTSecret,
			TokenTTL: time.Duration(TokenTTLMins) * time.Minute,
		},
	}
}
