package service

import (
	"context"
	"fmt"
	"kloudmate/internal/repository"
)

type Service struct {
	Repository *repository.Repository
}

func NewService(repository *repository.Repository) *Service {
	return &Service{Repository: repository}
}

func (s *Service) GetTimeSeriesData(ctx context.Context, start, end, metric, countries, aggregation string) ([]repository.TimeSeriesData, error) {
	allowedMetrics := map[string]string{
		"cases":                 "new_confirmed",
		"deaths":                "new_deceased",
		"recoveries":            "new_recovered",
		"tests":                 "new_tested",
		"cumulative_cases":      "cumulative_confirmed",
		"cumulative_deaths":     "cumulative_deceased",
		"cumulative_recoveries": "cumulative_recovered",
		"cumulative_tests":      "cumulative_tested",
	}
	column, ok := allowedMetrics[metric]
	if !ok {
		return nil, fmt.Errorf("invalid metric: %s", metric)
	}

	var timeGrouping string
	switch aggregation {
	case "month":
		timeGrouping = "toStartOfMonth(date)"
	case "week":
		timeGrouping = "toStartOfWeek(date)"
	case "day":
		timeGrouping = "date"
	default:
		return nil, fmt.Errorf("invalid aggregation: %s", aggregation)
	}

	var countryFilter string
	if countries != "" && countries != "'all'" {
		countryFilter = fmt.Sprintf("AND substring(location_key, 1, 2) IN (%s)", countries)
	}

	var data []repository.TimeSeriesData
	var err error
	if countryFilter == "" {
		data, err = s.Repository.GetAggregatedTimeSeriesData(ctx, start, end, timeGrouping, column, countryFilter)
	} else {
		data, err = s.Repository.GetCountryTimeSeriesData(ctx, start, end, timeGrouping, column, countryFilter)
	}
	if err != nil {
		return nil, err
	}

	// Format labels based on aggregation
	for i := range data {
		switch aggregation {
		case "month":
			data[i].Label = data[i].Date.Format("Jan 2006")
		case "week":
			_, w := data[i].Date.ISOWeek()
			data[i].Label = fmt.Sprintf("Week %d", w)
		case "day":
			data[i].Label = data[i].Date.Format("2006-01-02")
		}
	}

	return data, nil
}

func (s *Service) GetCountries(ctx context.Context) ([]string, error) {
	return s.Repository.GetCountries(ctx)
}
