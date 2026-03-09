"use client";

import { appConfig } from "@/lib/app-config";
import { fetchAuthSession } from "@aws-amplify/auth";
import { useQuery } from "@tanstack/react-query";
import { CourseContent } from "./course-content.types";

export function useListCourseContentsQuery(courseId: string) {
  return useQuery({
    queryKey: ["courseContents", courseId],
    queryFn: async (): Promise<CourseContent[]> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/courses/${courseId}/contents`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch course contents");
      }

      const courseContents = (await response.json()) as CourseContent[];

      return courseContents.sort((a, b) => a.createdAt - b.createdAt);
    },
    enabled: !!courseId,
  });
}
