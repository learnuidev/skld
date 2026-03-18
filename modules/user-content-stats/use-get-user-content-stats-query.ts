"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";
import { UserContentStatsResponse } from "./user-content-stats.types";

export function useGetUserContentStatsQuery(
  courseId: string,
  contentId: string
) {
  return useQuery({
    queryKey: ["userContentStats", contentId],
    queryFn: async (): Promise<UserContentStatsResponse> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/enrollments/${courseId}/contents/${contentId}/stats`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch user content stats");
      }

      return response.json();
    },
    enabled: !!courseId && !!contentId,
  });
}
