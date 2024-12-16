import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Fetch available countries
export const fetchCountries = async () => {
  try {
    const response = await axiosInstance.get("/v1/countries");
    return response.data;
  } catch (error) {
    console.error("Error fetching countries:", error);
    return [];
  }
};

// Fetch time series data
export const fetchTimeSeries = async (
  startDate: string,
  endDate: string,
  metric: string,
  aggregation: string,
  selectedCountry: string
) => {
  try {
    const url =
      selectedCountry === "all"
        ? `/v1/timeseries?start=${startDate}&end=${endDate}&metric=${metric}&aggregation=${aggregation}`
        : `/v1/timeseries?start=${startDate}&end=${endDate}&metric=${metric}&countries='${selectedCountry}'&aggregation=${aggregation}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return [];
  }
};
