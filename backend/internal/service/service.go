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

func (s *Service) GetTimeSeriesData(ctx context.Context, start, end, metric, countries, aggregation string) (map[string][]int64, []string, error) {
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
		return nil, nil, fmt.Errorf("invalid metric: %s", metric)
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
		return nil, nil, fmt.Errorf("invalid aggregation: %s", aggregation)
	}

	var countryFilter string
	if countries != "" && countries != "'all'" {
		countryFilter = fmt.Sprintf("AND substring(location_key, 1, 2) IN (%s)", countries)
	}

	var data []repository.TimeSeriesData
	data, err := s.Repository.GetCountryTimeSeriesData(ctx, start, end, timeGrouping, column, countryFilter)
	if err != nil {
		return nil, nil, err
	}

	// Format labels based on aggregation
	for i := range data {
		data[i].Label = data[i].Date.Format("2006-01-02")
	}

	groupedData := make(map[string][]int64)
	var labels []string
	var labelSet = make(map[string]bool)

	for _, d := range data {
		groupedData[d.Country] = append(groupedData[d.Country], d.Value)

		if !labelSet[d.Date.Format("2006-01-02")] {
			labels = append(labels, d.Label)
			labelSet[d.Date.Format("2006-01-02")] = true
		}
	}

	return groupedData, labels, nil
}

func (s *Service) GetCountries(ctx context.Context) ([]string, error) {
	return s.Repository.GetCountries(ctx)
}
