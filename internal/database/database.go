package database

import (
	"log"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type DatabaseService struct {
	DB *sqlx.DB
}

func InitDatabaseService(connectionString string) *DatabaseService {
	DB, err := sqlx.Connect("postgres", connectionString)
	if err != nil {
		log.Fatalf("Error connecting to the database: %v", err)
	}
	return &DatabaseService{
		DB: DB,
	}
}

func (svc *DatabaseService) Clean() error {
	err := svc.DB.Close()
	return err
}
