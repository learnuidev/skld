"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";
import { UserCourseRating } from "./user-course-rating.types";

export function useGetUserCourseRatingQuery(courseId: string | undefined) {
  return useQuery({
    queryKey: ["userCourseRating", courseId],
    queryFn: async (): Promise<UserCourseRating | null> => {
      if (!courseId) return null;

      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/user-course-ratings/${courseId}`,
        {
          headers: {
            Authorization: token,
          },
        },
      );

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch user course rating");
      }

      return response.json();
    },
    enabled: !!courseId,
  });
}
