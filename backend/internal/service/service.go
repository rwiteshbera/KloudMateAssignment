package service

import "kloudmate/internal/repository"

type Service struct {
	Repository *repository.Repository
}

func NewService(repository *repository.Repository) *Service {
	return &Service{Repository: repository}
}

func (s *Service) GetTimeSeriesData(start, end, metric, countries, aggregation string) {

}

func (s *Service) GetCountries() {

}
