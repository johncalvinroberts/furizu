package whoami

import (
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/johncalvinroberts/cryp/internal/email"
	"github.com/johncalvinroberts/cryp/internal/errors"
	"github.com/johncalvinroberts/cryp/internal/storage"
	"github.com/johncalvinroberts/cryp/internal/token"
	"github.com/johncalvinroberts/cryp/internal/utils"
)

const (
	OTP_LENGTH              = 6
	WHOAMI_CHALLENGE_PREFIX = "whoami-challenge"
	CTX_JWT_KEY             = "CTX_JWT_KEY"
	CTX_JWT_CLAIMS_KEY      = "CTX_JWT_CLAIMS_KEY"
	CTX_JWT_EMAIL           = "CTX_JWT_EMAIL"
)

type WhoamiService struct {
	secret           string
	whoamiBucketName string
	storageSrv       *storage.StorageService
	emailSrv         *email.EmailService
	tokenSrv         *token.TokenService
}

func (svc *WhoamiService) FindWhoamiChallenge(email string) (string, error) {
	key := storage.ComposeKey(WHOAMI_CHALLENGE_PREFIX, email)
	return svc.storageSrv.ReadToString(svc.whoamiBucketName, key)
}

// create otp + start whoami flow
func (svc *WhoamiService) StartWhoamiChallenge(email string) error {
	if email == "" {
		return errors.ErrValidationFailure
	}
	otp := utils.RandomSecret(OTP_LENGTH)
	key := storage.ComposeKey(WHOAMI_CHALLENGE_PREFIX, email)
	_, err := svc.storageSrv.Write(svc.whoamiBucketName, key, strings.NewReader(otp))
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
	challenge, err := svc.FindWhoamiChallenge(email)
	if err != nil {
		log.Printf("encountered error when finding whoami challenge: %v\n", err)
		if storage.IsNotFoundError(err) {
			return "", errors.ErrWhoamiChallengeNotFound
		}
		return "", errors.ErrInternalServerError
	}
	if otp != challenge || challenge == "" {
		log.Println("whoami challenge failed or not found")
		// cheap throttling
		time.Sleep(2 * time.Second)
		return "", errors.ErrWhoamiChallengeNotFound
	}
	// TODO: check expiration of whoami challenge
	jwt, err := svc.tokenSrv.IssueJWT(email)
	if err != nil {
		log.Printf("failed to issue jwt: %v\n", err)
		return "", errors.ErrInternalServerError
	}
	// cleanup
	defer svc.DestroyWhoamiChallenge(email)
	return jwt, nil
}

func (svc *WhoamiService) DestroyWhoamiChallenge(email string) {
	key := storage.ComposeKey(WHOAMI_CHALLENGE_PREFIX, email)
	err := svc.storageSrv.Delete(svc.whoamiBucketName, key)
	if err != nil {
		log.Printf("failed to delete whoami challenge, key: %s", key)
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

func InitWhoamiService(JWTSecret string, whoamiBucketName string, TokenTTLMins int, storageSrv *storage.StorageService, emailSrv *email.EmailService) *WhoamiService {
	return &WhoamiService{
		secret:           JWTSecret,
		storageSrv:       storageSrv,
		whoamiBucketName: whoamiBucketName,
		emailSrv:         emailSrv,
		tokenSrv: &token.TokenService{
			Secret:   JWTSecret,
			TokenTTL: time.Duration(TokenTTLMins) * time.Minute,
		},
	}
}
