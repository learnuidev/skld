"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";
import { CourseContent } from "./course-content.types";

export function useGetCourseContentQuery(courseId: string, contentId: string) {
  return useQuery({
    queryKey: ["courseContent", courseId, contentId],
    queryFn: async (): Promise<CourseContent> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/courses/${courseId}/contents/${contentId}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch course content");
      }

      return response.json();
    },
    enabled: !!courseId && !!contentId,
  });
}
