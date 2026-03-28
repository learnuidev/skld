import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityGraphProps {
  data: number[] | undefined;
  viewMode: "monthly" | "yearly";
  setViewMode: (mode: "monthly" | "yearly") => void;
}

export function CourseActivityGraph({
  data,
  viewMode,
  setViewMode,
}: ActivityGraphProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
          No activity data available
        </div>
      </div>
    );
  }

  const maxActivity = Math.max(...data, 1);

  const getColor = (value: number) => {
    const intensity = value / maxActivity;
    if (intensity === 0) return "bg-muted";
    if (intensity < 0.25) return "bg-green-100 dark:bg-green-900/30";
    if (intensity < 0.5) return "bg-green-200 dark:bg-green-800/40";
    if (intensity < 0.75) return "bg-green-300 dark:bg-green-700/50";
    return "bg-green-400 dark:bg-green-600/60";
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const circleSize = viewMode === "monthly" ? "w-6 h-6" : "w-3 h-3";
  const circleShape = viewMode === "monthly" ? "rounded-full" : "rounded-sm";
  const circlesPerRow = viewMode === "monthly" ? 10 : 7;

  const now = new Date();
  const daysToShow = data.length;
  const startDate =
    viewMode === "monthly"
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : new Date(now.getTime() - daysToShow * 24 * 60 * 60 * 1000);

  const rows = Math.ceil(data.length / circlesPerRow);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Activity Graph
        </h2>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "monthly" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("monthly")}
          >
            Monthly
          </Button>
          <Button
            variant={viewMode === "yearly" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("yearly")}
          >
            Yearly
          </Button>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex gap-1 justify-center flex-wrap">
          {Array.from({ length: rows }, (_, rowIndex) => (
            <div key={rowIndex} className="flex gap-1">
              {Array.from({ length: circlesPerRow }, (_, colIndex) => {
                const dataIndex = rowIndex * circlesPerRow + colIndex;
                if (dataIndex >= data.length) return null;

                const value = data[dataIndex];
                const date = new Date(
                  startDate.getTime() + dataIndex * 24 * 60 * 60 * 1000,
                );

                return (
                  <div
                    key={colIndex}
                    className={`${circleSize} ${circleShape} ${getColor(value)} transition-colors hover:scale-110 cursor-pointer`}
                    title={`${formatDate(date)}\n${value} activities`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className={`flex gap-1`}>
            <div className={`w-3 h-3 rounded-sm bg-muted`} />
            <div
              className={`w-3 h-3 rounded-sm bg-green-100 dark:bg-green-900/30`}
            />
            <div
              className={`w-3 h-3 rounded-sm bg-green-200 dark:bg-green-800/40`}
            />
            <div
              className={`w-3 h-3 rounded-sm bg-green-300 dark:bg-green-700/50`}
            />
            <div
              className={`w-3 h-3 rounded-sm bg-green-400 dark:bg-green-600/60`}
            />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
