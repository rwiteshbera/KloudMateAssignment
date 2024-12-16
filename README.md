# COVID-19 Data Visualization

## Objective

Build a data visualization app that displays timeseries COVID-19 data using a **React** frontend and a **Go** backend. The backend should fetch and aggregate data from **ClickHouse**, while the frontend should provide interactive visualizations using **uPlot**.

---

## Tech Stack
- **Backend**: Golang, ClickHouse  
- **Frontend**: React, TypeScript, uPlot  
- **Deployment**: AWS EC2, AWS API Gateway, Vercel  

---

## Features

### Backend (REST API)
The backend, built in Go, connects to ClickHouse to fetch timeseries data. It supports:
- **Time Range Filtering**: Retrieve data for a specified start and end date.
- **Country Filtering**: Query data for single or multiple countries.
- **Dynamic Aggregation**: Aggregate data into daily, weekly, or monthly intervals based on the time range or zoom level.

### Frontend
The frontend provides:
- **Interactive Line Charts**: Built using uPlot, charts visualize metrics like Cases, New Cases, and Deaths.
- **Metric Selection**: Users can switch between metrics via a dropdown.
- **Filtering Options**: Filter data using a date picker and a multi-select dropdown for countries.
- **Tooltips**: Hover over data points to display detailed values for all series.
- **Zooming**: Zoom dynamically adjusts the data aggregation level, from monthly to weekly to daily views.

---

## Live URL

[Live Demo](https://kloud-mate-assignment.vercel.app/)  

---

## Screenshots
<img width="1280" alt="Screenshot 2024-12-17 at 2 35 07 AM" src="https://github.com/user-attachments/assets/8638afb9-86e2-43b5-ac6c-c09045ea60f3" />

<img width="1280" alt="Screenshot 2024-12-17 at 2 35 24 AM" src="https://github.com/user-attachments/assets/916d4631-0a70-4a9f-aa76-0b818a3887a0" />

---
