"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import uPlot, { AlignedData } from "uplot";
import "uplot/dist/uPlot.min.css";
import { fetchCountries, fetchTimeSeries } from "../api/api";
import dynamic from "next/dynamic";
import { formatLabel, ONE_YEAR, ONE_MONTH } from "../utils/format";
import stringToColor from "../utils/color";

const Select = dynamic(() => import("react-select"), { ssr: false });

export default function Home() {

  const aggregationLevels = ["month", "week", "day"] as const;
  type Aggregation = typeof aggregationLevels[number];

  const [dateRange, setDateRange] = useState<Date[]>([
    new Date("2020-01-01"),
    new Date("2022-01-01"),
  ]);
  const [countries, setCountries] = useState<string[]>([]);
  const [metrics, setMetrics] = useState("cases");
  const [aggregation, setAggregation] = useState<Aggregation>("month");
  const [selectedCountry, setSelectedCountry] = useState<string[]>(["US"]);
  const [loading, setLoading] = useState(false);

  const chartRef = useRef<HTMLDivElement | null>(null);
  const plotInstance = useRef<uPlot | null>(null);

  const labelsRef = useRef<string[]>([]);

  const isZooming = useRef(false);

  const getNextAggregation = (
    current: Aggregation,
    direction: "in" | "out"
  ): Aggregation | null => {
    const currentIndex = aggregationLevels.indexOf(current);
    if (direction === "in" && currentIndex < aggregationLevels.length - 1) {
      return aggregationLevels[currentIndex + 1];
    } else if (direction === "out" && currentIndex > 0) {
      return aggregationLevels[currentIndex - 1];
    }
    return null; 
  };

  // Color mapping
  const colorMapRef = useRef<{ [country: string]: string }>({});

  const getColorForCountry = (country: string): string => {
    if (!colorMapRef.current[country]) {
      colorMapRef.current[country] = stringToColor(country);
    }
    return colorMapRef.current[country];
  };

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
    if (dateRange.length !== 2) return;
    const loadChartData = async () => {
      setLoading(true);
      try {
        const response = await fetchTimeSeries(
          dateRange[0].toISOString().split("T")[0],
          dateRange[1].toISOString().split("T")[0],
          metrics,
          aggregation,
          selectedCountry
        );

        labelsRef.current = response.labels;

        const indices = response.labels.map((_: any, i: number) => i);

        const alignedData: AlignedData = [
          indices,
          ...selectedCountry.map((country) => response.data[country] || []),
        ];

        if (plotInstance.current) {
          plotInstance.current.destroy();
        }

        const options: uPlot.Options = {
          width: 850,
          height: 400,
          scales: { x: { time: false }, y: { auto: true } },
          axes: [
            {
              label: "Time",
              values: (u, ticks) =>
                ticks.map(
                  (t) =>
                    formatLabel(
                      labelsRef.current[Math.round(t)] || "",
                      aggregation
                    ) || ""
                ),
            },
            {
              label: "Value",
            },
          ],
          series: [
            {},
            ...selectedCountry.map((country) => ({
              label: country,
              stroke: getColorForCountry(country),
              width: 2,
            })),
          ],
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

                u.over.addEventListener("mousemove", (e: MouseEvent) => {
                  const { left, top } = u.cursor.left
                    ? u.cursor
                    : { left: null, top: null };
                  if (left === null || top === null) {
                    tooltip.style.display = "none";
                    return;
                  }

                  const idx = u.cursor.idx!;
                  const label = labelsRef.current[idx] || "";

                  // Build tooltip for all selected countries
                  let tooltipContent = `<strong>${label}</strong><br />`;
                  selectedCountry.forEach((country, i) => {
                    const value = alignedData[i + 1][idx];
                    tooltipContent += `${country}: ${value} ${metrics}<br />`;
                  });

                  tooltip.style.left = `${e.pageX + 10}px`;
                  tooltip.style.top = `${e.pageY + 10}px`;
                  tooltip.style.display = "block";
                  tooltip.innerHTML = tooltipContent;
                });

                u.over.addEventListener("mouseleave", () => {
                  tooltip.style.display = "none";
                });
              },
            ],
          },
        };

        if (chartRef.current) {
          plotInstance.current = new uPlot(options, alignedData, chartRef.current);
        }

        setLoading(false);
        isZooming.current = false; // Reset the zooming flag after loading
      } catch (error) {
        console.error("Failed to load chart data:", error);
        setLoading(false);
        isZooming.current = false; // Reset the zooming flag on error
      }
    };

    if (selectedCountry.length > 0) loadChartData();
  }, [selectedCountry, aggregation, metrics, dateRange]);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      // Prevent handling another zoom while current zoom is processing
      if (isZooming.current) return;

      let direction: "in" | "out" | null = null;
      if (e.deltaY < 0) {
        direction = "in"; // Zoom in
      } else if (e.deltaY > 0) {
        direction = "out"; // Zoom out
      }

      if (!direction) return;

      const nextAgg = getNextAggregation(aggregation, direction);
      if (nextAgg && plotInstance.current) {
        const u = plotInstance.current;
        const start = u.cursor.idx
       
        if(start != null) {
          const startDate = new Date(labelsRef.current[start])
          if(nextAgg === "week") {
            setDateRange([startDate, new Date(startDate.getTime() + ONE_YEAR)]) 
          } else if(nextAgg === "day") {
            setDateRange([startDate, new Date(startDate.getTime() + ONE_MONTH)]) 
          }
        }
        isZooming.current = true; // Set the zooming flag
        setAggregation(nextAgg);
      }
    },
    [aggregation]
  );

  useEffect(() => {
    const chartElement = chartRef.current;
    if (!chartElement) return;

    chartElement.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      chartElement.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">
          COVID-19 Data Visualization
        </h1>
        <div className="flex flex-row flex-wrap justify-center space-x-4">
          <Select
            isMulti
            options={countries.map((country) => ({
              value: country,
              label: country,
            }))}
            onChange={(e: any) => {
              setSelectedCountry(e.map((item: any) => item.value));
            }}
            value={selectedCountry.map((country) => ({
              value: country,
              label: country,
            }))}
            className="w-60"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: "#ccc",
                boxShadow: "none",
              }),
              multiValue: (base, { data }: { data: any }) => ({
                ...base,
                backgroundColor: getColorForCountry(data.value),
                color: "white", 
              }),
              multiValueLabel: (base, { data }: { data: any }) => ({
                ...base,
                color: "white",
              }),
              multiValueRemove: (base, { data }: { data: any }) => ({
                ...base,
                color: "white",
                ":hover": {
                  backgroundColor: "darkred",
                  color: "white",
                },
              }),
            }}
          />

          <input
            type="date"
            onChange={(e) =>
              setDateRange([new Date(e.target.value), dateRange[1]])
            }
            value={dateRange[0].toISOString().split("T")[0]}
            className="block w-48 px-4 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="date"
            onChange={(e) =>
              setDateRange([dateRange[0], new Date(e.target.value)])
            }
            value={dateRange[1].toISOString().split("T")[0]}
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
          className="mt-6 w-full max-w-4xl bg-white shadow-md rounded-md p-4 overflow-hidden relative"
          style={{ maxHeight: "500px", height: "500px" }}
        >
          {loading && (
            <div className="flex justify-center items-center h-full absolute inset-0 bg-white bg-opacity-75 z-10">
              <p className="text-gray-500 font-bold">Loading...</p>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-800">
          <a
            target="_blank"
            href="https://github.com/rwiteshbera/KloudMateAssignment"
            className="text-blue-500 hover:underline"
            rel="noopener noreferrer"
          >
            Github
          </a>
        </p>
        <p className="text-sm text-gray-600">
          Current Aggregation: <strong>{aggregation}</strong>
        </p>
      </div>
    </div>
  );
}
