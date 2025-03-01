import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const LineChart = ({ prices }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!prices?.length || !canvasRef.current) return;

    // Extract labels and data
    const labels = prices.map((item) =>
      new Date(Number(item.timestamp)).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    );
    const dataset1 = prices.map((item) => Number(item.price[0]) / 1e18);
    const dataset2 = prices.map((item) => Number(item.price[1]) / 1e18);

    // Destroy existing chart before creating a new one
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `No`,
            backgroundColor: "#FE69B3",
            borderColor: "#FE69B3",
            data: dataset2,
            fill: false,
          },
          {
            label: `Yes`,
            backgroundColor: "#3FDEC9",
            borderColor: "#3FDEC9",
            data: dataset1,
            fill: false,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        hover: {
          mode: "nearest",
          intersect: true,
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [prices]);

  return <canvas ref={canvasRef} />;
};

export default LineChart;
