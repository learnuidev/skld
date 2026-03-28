"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";
import {
  UserContentHistoriesResponse,
  UserContentHistory,
} from "@/modules/user-content-histories/user-content-histories.types";
import { useListCourseContentsQuery } from "@/modules/course-content/use-list-course-contents-query";
import { useMemo } from "react";

export function useUserActivityGraph(courseId: string, enrollmentId: string) {
  const { data: courseContents } = useListCourseContentsQuery(courseId);

  return useQuery({
    queryKey: ["activityGraph", courseId, enrollmentId],
    queryFn: async (): Promise<UserContentHistory[]> => {
      if (!courseContents || courseContents.length === 0) return [];

      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const allHistories: UserContentHistory[] = [];

      for (const content of courseContents) {
        const response = await fetch(
          `${appConfig.NEXT_PUBLIC_API_BASE_URL}/enrollments/${courseId}/contents/${content.id}/history`,
          {
            headers: {
              Authorization: token,
            },
          },
        );

        if (response.ok) {
          const data: UserContentHistoriesResponse = await response.json();
          allHistories.push(...data.userContentHistories);
        }
      }

      return allHistories;
    },
    enabled:
      !!courseId &&
      !!enrollmentId &&
      !!courseContents &&
      courseContents.length > 0,
  });
}

export function useActivityData(
  histories: UserContentHistory[] | undefined,
  viewMode: "monthly" | "yearly",
  currentDate: { month: number; year: number },
): number[] {
  return useMemo(() => {
    if (!histories || histories.length === 0) return [];

    const startDate =
      viewMode === "monthly"
        ? new Date(currentDate.year, currentDate.month, 1)
        : new Date(currentDate.year, 0, 1);

    const yearStart = new Date(currentDate.year, 0, 1);
    const yearEnd = new Date(currentDate.year, 11, 31);
    const daysToShow =
      viewMode === "monthly"
        ? new Date(currentDate.year, currentDate.month + 1, 0).getDate()
        : Math.floor(
            (yearEnd.getTime() - yearStart.getTime()) / (24 * 60 * 60 * 1000),
          ) + 1;

    const activityMap = new Map<string, number>();

    for (const history of histories) {
      const historyDate = new Date(history.createdAt);
      if (historyDate >= startDate) {
        const dateKey = historyDate.toISOString().split("T")[0];
        activityMap.set(dateKey, (activityMap.get(dateKey) || 0) + 1);
      }
    }

    const result: number[] = [];
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split("T")[0];
      result.push(activityMap.get(dateKey) || 0);
    }

    return result;
  }, [histories, viewMode, currentDate]);
}
