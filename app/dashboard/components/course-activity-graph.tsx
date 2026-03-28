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

  const weeks = Math.ceil(data.length / 7);

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
        <div className="flex gap-1">
          {Array.from({ length: weeks }, (_, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const dataIndex = weekIndex * 7 + dayIndex;
                const value = data[dataIndex] || 0;

                return (
                  <div
                    key={dayIndex}
                    className={`w-3 h-3 rounded-sm ${getColor(value)} transition-colors`}
                    title={`${value} activities`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-muted" />
            <div className="w-3 h-3 rounded-sm bg-green-100 dark:bg-green-900/30" />
            <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-800/40" />
            <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-700/50" />
            <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-600/60" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
