package database

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/ClickHouse/clickhouse-go/v2"
)

type ClickhouseConfig struct {
	URL      string
	Username string
	Password string
}

func ConnectClickhouse(config ClickhouseConfig) *sql.DB {
	DB := clickhouse.OpenDB(&clickhouse.Options{
		Addr:     []string{config.URL},
		Protocol: clickhouse.Native,
		// TLS:      &tls.Config{},
		Auth: clickhouse.Auth{
			Username: config.Username,
			Password: config.Password,
		},
	})

	err := DB.Ping()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Connected to Clickhouse")
	return DB
}

func CloseClickhouse(DB *sql.DB) {
	DB.Close()
}
