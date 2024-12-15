"use client";

import React, { useEffect, useState, useRef } from "react";
import uPlot, { AlignedData } from "uplot";
import "uplot/dist/uPlot.min.css";
import { fetchCountries, fetchTimeSeries } from "../api/api";

interface TimeSeriesItem {
  date: string;
  value: number;
  label: string;
}

export default function Home() {
  const [startDate, setStartDate] = useState("2020-01-01");
  const [endDate, setEndDate] = useState("2023-01-01");
  const [countries, setCountries] = useState<string[]>([]);
  const [metrics, setMetrics] = useState("cases");

  const [zoomLevel, setZoomLevel] = useState(0);
  const [aggregation, setAggregation] = useState("month");

  const [selectedCountry, setSelectedCountry] = useState("all");

  const chartRef = useRef<HTMLDivElement | null>(null);
  const plotInstance = useRef<uPlot | null>(null);

  const labelsRef = useRef<string[]>([]);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await fetchCountries();
        setCountries(data);
      } catch (error) {
        console.error("Failed to load countries:", error);
      }
    };
    loadCountries();
  }, []);

  useEffect(() => {
    const duration =
      new Date(endDate).getTime() - new Date(startDate).getTime();

    if (zoomLevel === 0) setAggregation("month");
    else if (zoomLevel === 1) {
      if (duration <= 365 * 24 * 60 * 60 * 1000) setAggregation("week");
    } else if (zoomLevel === 2) {
      if (duration <= 30 * 24 * 60 * 60 * 1000) setAggregation("day");
    }
  }, [zoomLevel]);

  useEffect(() => {
    if (new Date(startDate).getTime() > new Date(endDate).getTime()) return;

    const loadChartData = async () => {
      try {
        const data: TimeSeriesItem[] = await fetchTimeSeries(
          startDate,
          endDate,
          metrics,
          aggregation,
          selectedCountry
        );

        const indices = data.map((_, i) => i);
        const values = data.map((item) => item.value);
        const labels = data.map((item) => item.label);
        labelsRef.current = labels;

        const alignedData: AlignedData = [indices, values];

        if (plotInstance.current) {
          plotInstance.current.setData(alignedData);
        } else {
          const options: uPlot.Options = {
            title:
              selectedCountry === "all"
                ? `COVID-19 ${metrics} Across All Countries`
                : `COVID-19 ${metrics} in ${selectedCountry}`,
            width: 850,
            height: 400,
            scales: { x: { time: false }, y: { auto: true } },
            axes: [
              {
                label: "Time",
                values: (u, ticks) =>
                  ticks.map((t) => labelsRef.current[Math.round(t)] || ""),
              },
              {
                label: metrics.charAt(0).toUpperCase() + metrics.slice(1),
              },
            ],
            series: [{}, { label: metrics, stroke: "blue" }],
            hooks: {
              ready: [
                (u) => {
                  const tooltip = document.createElement("div");
                  tooltip.style.position = "absolute";
                  tooltip.style.background = "#fff";
                  tooltip.style.border = "1px solid #ccc";
                  tooltip.style.padding = "5px";
                  tooltip.style.fontSize = "12px";
                  tooltip.style.pointerEvents = "none";
                  tooltip.style.display = "none";
                  document.body.appendChild(tooltip);

                  u.over.addEventListener("mousemove", (e) => {
                    const { left, top } = u.cursor.left
                      ? u.cursor
                      : { left: null, top: null };
                    if (left === null || top === null) {
                      tooltip.style.display = "none";
                      return;
                    }

                    const idx = u.cursor.idx!;
                    const label = labelsRef.current[idx] || "";
                    const value = alignedData[1][idx];

                    tooltip.style.left = `${e.pageX + 10}px`;
                    tooltip.style.top = `${e.pageY + 10}px`;
                    tooltip.style.display = "block";
                    tooltip.innerHTML = `<strong>${label}</strong><br />${value} ${metrics}`;
                  });

                  u.over.addEventListener("mouseleave", () => {
                    tooltip.style.display = "none";
                  });
                },
              ],
            },
          };

          if (chartRef.current) {
            plotInstance.current = new uPlot(
              options,
              alignedData,
              chartRef.current
            );

            chartRef.current.addEventListener("wheel", (e) => {
              e.preventDefault();
              setZoomLevel((prev) =>
                e.deltaY > 0 ? Math.min(prev + 1, 2) : Math.max(prev - 1, 0)
              );
            });
          }
        }
      } catch (error) {
        console.error("Failed to load chart data:", error);
      }
    };

    loadChartData();
  }, [selectedCountry, aggregation, metrics, startDate, endDate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">
          COVID-19 Visualization
        </h1>
        <div className="flex flex-row space-x-4">
          <select
            onChange={(e) => setSelectedCountry(e.target.value)}
            value={selectedCountry}
            className="block w-48 px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          <input
            type="date"
            onChange={(e) => setStartDate(e.target.value)}
            value={startDate}
            className="block w-48 px-4 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="date"
            onChange={(e) => setEndDate(e.target.value)}
            value={endDate}
            className="block w-48 px-4 py-2 border border-gray-300 rounded-md"
          />
          <select
            onChange={(e) => setMetrics(e.target.value)}
            value={metrics}
            className="block w-64 px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="cases">New Cases</option>
            <option value="deaths">New Deceased</option>
            <option value="recoveries">New Recovered</option>
            <option value="tests">New Tested</option>
          </select>
        </div>
        <div
          id="chart-container"
          ref={chartRef}
          className="mt-6 w-full max-w-4xl bg-white shadow-md rounded-md p-4 overflow-auto"
          style={{ maxHeight: "500px" }}
        ></div>
      </div>
    </div>
  );
}
