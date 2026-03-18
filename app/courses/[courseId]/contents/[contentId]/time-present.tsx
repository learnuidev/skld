"use client";

import { UserContentStatsResponse } from "@/modules/user-content-stats/user-content-stats.types";
import { Clock, Eye } from "lucide-react";

export const TimePresent = ({
  showTimeSpent,
  currentTime,
  startTime,
  userContentStats,
}: {
  showTimeSpent: boolean;
  currentTime: number;
  startTime: number;
  userContentStats: UserContentStatsResponse;
}) => {
  return (
    showTimeSpent && (
      <div className="fixed top-0 left-0 right-0 z-50 py-4 bg-background/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto sm:px-6 px-4 py-2 flex justify-between">
          <div className="text-sm text-muted-foreground flex gap-2 items-end">
            <Clock />{" "}
            <span>{Math.floor((currentTime - startTime) / 1000)}s</span>
          </div>

          {userContentStats?.userContentStat?.metadata?.timesRead && (
            <div>
              <div className="text-sm text-muted-foreground flex gap-2 items-end">
                <Eye />
                <span>
                  {userContentStats?.userContentStat?.metadata?.timesRead}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  );
};
