"use client";

import { appConfig } from "@/lib/app-config";
import { fetchAuthSession } from "@aws-amplify/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CourseContent,
  BulkCreateCourseContentsParams,
} from "./course-content.types";

export function useBulkCreateCourseContentsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      params: BulkCreateCourseContentsParams,
    ): Promise<{ message: string; contents: CourseContent[] }> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/courses/${params.courseId}/contents/bulk`,
        {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: params.contents,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to bulk create course contents");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["courseContents", variables.courseId],
      });
    },
  });
}
