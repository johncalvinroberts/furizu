package errors

import (
	goerrs "errors"
)

var (
	ErrValidationFailure = goerrs.New("validation failed")

	ErrDataCreationFailure = goerrs.New("data creation failure")
	ErrDataAccessFailure   = goerrs.New("data access failure")
	ErrDataUpdateFailure   = goerrs.New("data update failure")
	ErrDataDeletionFailure = goerrs.New("data deletion failure")
	ErrInternalServerError = goerrs.New("something unexpectedly went wrong")
	ErrInvalidToken        = goerrs.New("invalid token")
	ErrUnauthorized        = goerrs.New("unauthorized")
	ErrForbidden           = goerrs.New("forbidden")

	// auth
	ErrWhoamiChallengeNotFound = goerrs.New("whoami challenge failed or not found")
	ErrNotImplemented          = goerrs.New("not implemented")

	// email
	ErrUnableToSendEmail = goerrs.New("unable to send email")

	// blobs
	ErrBalanceLimitExceeded = goerrs.New("insufficent blob balance")
)
