package controller

import (
	"kloudmate/internal/service"
	"kloudmate/router"
	"net/http"
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
	// GET /api/timeseries?start=2020-01-01&end=2021-01-01&metric=cases&countries=US,CA&aggregation=month
	start := ctx.Query("start")
	end := ctx.Query("end")
	metric := ctx.Query("metric")
	countries := ctx.Query("countries")
	aggregation := ctx.Query("aggregation")

	c.Service.GetTimeSeriesData(start, end, metric, countries, aggregation)

	ctx.JSON(http.StatusOK, "Time Series Data")
}

func (c *Controller) GetCountries(ctx *router.Context) {
	ctx.JSON(http.StatusOK, "Country List")
}
