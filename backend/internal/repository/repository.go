package repository

import (
	"context"
	"database/sql"
	"time"
)

type Repository struct {
	DB *sql.DB
}

func NewRepository(DB *sql.DB) *Repository {
	return &Repository{DB: DB}
}

type TimeSeriesData struct {
	Date    time.Time `json:"date"`
	Country string    `json:"country,omitempty"`
	Value   int64     `json:"value"`
	Label   string    `json:"label"`
}

func (r *Repository) GetCountries(ctx context.Context) ([]string, error) {
	rows, err := r.DB.QueryContext(ctx, "SELECT DISTINCT substring(location_key, 1, 2) AS country_code FROM covid19 ORDER BY country_code;")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var countries []string
	for rows.Next() {
		var country string
		if err := rows.Scan(&country); err != nil {
			return nil, err
		}
		countries = append(countries, country)
	}
	return countries, rows.Err()
}

// Returns a single aggregated value per period for all countries or the filtered countries.
func (r *Repository) GetAggregatedTimeSeriesData(ctx context.Context, start, end, timeGrouping, column string, countryFilter string) ([]TimeSeriesData, error) {
	query := `
		SELECT 
			` + timeGrouping + ` AS period,
			SUM(` + column + `) AS value
		FROM covid19
		WHERE date BETWEEN ? AND ?
		` + countryFilter + `
		GROUP BY period
		ORDER BY period;`

	rows, err := r.DB.QueryContext(ctx, query, start, end)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []TimeSeriesData
	for rows.Next() {
		var data TimeSeriesData
		data.Country = "" // no country grouping in this query
		if err := rows.Scan(&data.Date, &data.Value); err != nil {
			return nil, err
		}
		results = append(results, data)
	}
	return results, rows.Err()
}

// GetCountryTimeSeriesData returns separate values per period per country.
func (r *Repository) GetCountryTimeSeriesData(ctx context.Context, start, end, timeGrouping, column string, countryFilter string) ([]TimeSeriesData, error) {
	query := `
		SELECT 
			` + timeGrouping + ` AS period,
			substring(location_key, 1, 2) AS country,
			SUM(` + column + `) AS value
		FROM covid19
		WHERE date BETWEEN ? AND ?
		` + countryFilter + `
		GROUP BY period, country
		ORDER BY period;`

	rows, err := r.DB.QueryContext(ctx, query, start, end)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []TimeSeriesData
	for rows.Next() {
		var data TimeSeriesData
		if err := rows.Scan(&data.Date, &data.Country, &data.Value); err != nil {
			return nil, err
		}
		results = append(results, data)
	}
	return results, rows.Err()
}
