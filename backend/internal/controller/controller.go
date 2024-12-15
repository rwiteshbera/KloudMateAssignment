package controller

import (
	"kloudmate/internal/service"
	"kloudmate/router"
	"net/http"
	"time"
)

type Controller struct {
	Service *service.Service
}

func NewController(service *service.Service) *Controller {
	return &Controller{Service: service}
}

func (c *Controller) TestHandler(ctx *router.Context) {
	ctx.JSON(http.StatusOK, "Hello, World!")
}

func (c *Controller) GetTimeSeriesData(ctx *router.Context) {
	startStr := ctx.Query("start")
	endStr := ctx.Query("end")
	metric := ctx.Query("metric")
	countries := ctx.Query("countries")
	aggregation := ctx.Query("aggregation")

	// Parse the start and end times
	startTime, err := time.Parse("2006-01-02", startStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, "Invalid start date")
		return
	}
	endTime, err := time.Parse("2006-01-02", endStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, "Invalid end date")
		return
	}

	// Start date cannot be after end date
	if startTime.After(endTime) {
		ctx.JSON(http.StatusBadRequest, "Start date cannot be after end date")
		return
	}

	// If countries is empty or 'all', consider all countries
	if countries == "" || countries == "'all'" {
		countries = ""
	}

	// Get time series data
	data, err := c.Service.GetTimeSeriesData(ctx.Context(), startStr, endStr, metric, countries, aggregation)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, err.Error())
		return
	}

	ctx.JSON(http.StatusOK, data)
}

func (c *Controller) GetCountries(ctx *router.Context) {
	// Get countries
	countries, err := c.Service.GetCountries(ctx.Context())
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, err.Error())
		return
	}
	ctx.JSON(http.StatusOK, countries)
}
