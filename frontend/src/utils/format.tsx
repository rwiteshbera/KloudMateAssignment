export const formatLabel = (label: string, aggregation: string) => {
  const date = new Date(label);

  if (aggregation === "month") {
    return date.toLocaleString("default", { month: "short", year: "numeric" });
  }

  if (aggregation === "week") {
    const weekNumber = Math.ceil((date.getDate() - date.getDay() + 12) / 7);
    return `W:${weekNumber}, ${date.getFullYear()}`;
  }
  if (aggregation === "day") {
    const day = date.getDate().toString().padStart(2, "0"); 
    const month = date.toLocaleString("default", { month: "short" }); 
    return `${day} ${month}`;
  }

  return label;
};


// 1 Year = 31536000000
// 1 Month = 2629746000
export const ONE_YEAR = 31536000000
export const ONE_MONTH = 2629746000
