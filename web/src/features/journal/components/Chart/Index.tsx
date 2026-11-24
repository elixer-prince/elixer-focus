import { useGetTotalFocusTimeForRanges } from "@/features/countdown-timer/stores/session-history-store";
import { formatElapsedTime } from "@/utils/formatting";
import type { TooltipItem } from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { addDays, format, startOfWeek } from "date-fns";
import { useMemo } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const FocusTimeChart = () => {
  // Build the 7-day ranges for the current week (Monday to Sunday)
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const dayRanges = [];
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    const startOfDay = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
    ).getTime();
    const endOfDay = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      23,
      59,
      59,
      999,
    ).getTime();
    dayRanges.push({ start: startOfDay, end: endOfDay });
  }

  // Subscribe to timer + session changes for all days in one hook call
  const focusTimes = useGetTotalFocusTimeForRanges(dayRanges);

  const chartData = useMemo(() => {
    const labels = dayRanges.map((range) => {
      const date = new Date(range.start);
      return format(date, "EEE");
    });

    // Get theme colors from CSS variables
    const primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--p")
      .trim();
    const primaryRgba = `hsla(${primaryColor || "260 80% 62%"}, 0.7)`;
    const primaryBorder = `hsl(${primaryColor || "260 80% 62%"})`;

    // Use fallback colors if CSS variable not available
    const bgColor = primaryColor.startsWith("hsl") ? primaryRgba : "#8b5cf6";
    const borderColor = primaryColor.startsWith("hsl")
      ? primaryBorder
      : "#7c3aed";

    return {
      labels,
      datasets: [
        {
          label: "Focus Time (seconds)",
          data: focusTimes,
          backgroundColor: [bgColor],
          borderColor: [borderColor],
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [dayRanges, focusTimes]);

  const options = {
    responsive: true as const,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"bar">) => {
            const value = context.parsed.y ?? 0;
            return `Focus: ${formatElapsedTime(value)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number | string) => {
            const num = Number(value);
            if (num === 0) return "0";
            if (num >= 3600) return `${Math.floor(num / 3600)}h`;
            if (num >= 60) return `${Math.floor(num / 60)}m`;
            return `${num}s`;
          },
        },
        grid: {
          color: "rgba(0,0,0,0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="focus-time-chart bg-base-100 rounded-box p-4 shadow-sm transition-colors duration-500">
      <h3 className="text-base-content mb-3 text-lg font-semibold">
        This Week
      </h3>
      <div className="h-48">
        {chartData && <Bar data={chartData} options={options} />}
      </div>
    </div>
  );
};

export default FocusTimeChart;
