package main

import (
	"kloudmate/database"
	"kloudmate/internal/controller"
	"kloudmate/internal/repository"
	"kloudmate/internal/service"
	"kloudmate/router"
	"log"
)

func main() {
	clickhouseConfig := database.ClickhouseConfig{
		URL:      "localhost:9000",
		Username: "default",
		Password: "",
	}

	// Connect to Clickhouse
	DB := database.ConnectClickhouse(clickhouseConfig)
	defer DB.Close()

	// Used my custom router
	r := router.NewRouter()

	repository := repository.NewRepository(DB) // Repository layer
	service := service.NewService(repository)
	controller := controller.NewController(service)

	r.GET("/", controller.TestHandler)
	r.GET("/v1/timeseries", controller.GetTimeSeriesData)
	r.GET("/v1/countries", controller.GetCountries)

	// Start the server
	err := r.Start()
	if err != nil {
		log.Fatal(err)
	}
}
