"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";
import { Course } from "./course.types";

export function useGetCourseQuery(courseId: string) {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: async (): Promise<Course> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/courses/${courseId}`,
        {
          headers: {
            Authorization: token,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch course");
      }

      return response.json();
    },
    enabled: !!courseId,
  });
}
