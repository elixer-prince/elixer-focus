import { useGetTotalFocusTimeForRanges } from "@/features/countdown-timer/stores/session-history-store";
import useTrackedTimeTotalsForRanges from "@/features/countdown-timer/hooks/useTrackedTimeTotals";
import { formatElapsedTime } from "@/utils/formatting";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import { Bar } from "react-chartjs-2";
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
  const dayRanges = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const ranges = [];
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
      ranges.push({ start: startOfDay, end: endOfDay });
    }
    return ranges;
  }, []);

  // Subscribe to timer + session changes for all days in one hook call
  const focusTimes = useGetTotalFocusTimeForRanges(dayRanges);
  const trackedRanges = useMemo(
    () => dayRanges.map((range) => ({ ...range, end: range.end + 1 })),
    [dayRanges],
  );
  const trackedTotals = useTrackedTimeTotalsForRanges(trackedRanges);
  const idleTimes = trackedTotals.map((totals) => totals.idleSeconds);

  const chartData = useMemo(() => {
    const labels = dayRanges.map((range) => {
      const date = new Date(range.start);
      return format(date, "EEE");
    });

    // Get theme colors from CSS variables
    const styles = getComputedStyle(document.documentElement);
    const primaryColor = styles.getPropertyValue("--color-primary").trim();
    const secondaryColor = styles.getPropertyValue("--color-secondary").trim();

    return {
      labels,
      datasets: [
        {
          label: "Focus Time",
          data: focusTimes,
          backgroundColor: primaryColor,
          borderColor: primaryColor,
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: "Idle Time",
          data: idleTimes,
          backgroundColor: secondaryColor,
          borderColor: secondaryColor,
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [dayRanges, focusTimes, idleTimes]);

  const contentColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-base-content")
    .trim();

  const options = {
    responsive: true as const,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: contentColor,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"bar">) => {
            const value = context.parsed.y ?? 0;
            return `${context.dataset.label}: ${formatElapsedTime(value)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: contentColor,
          callback: (value: number | string) => {
            const num = Number(value);
            if (num === 0) return "0";
            if (num >= 3600) return `${Math.floor(num / 3600)}h`;
            if (num >= 60) return `${Math.floor(num / 60)}m`;
            return `${num}s`;
          },
        },
        grid: {
          color: `color-mix(in srgb, ${contentColor} 12%, transparent)`,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: contentColor,
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
