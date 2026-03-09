"use client";

import { appConfig } from "@/lib/app-config";
import { fetchAuthSession } from "@aws-amplify/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CourseContent,
  CreateCourseContentParams,
} from "./course-content.types";

export function useCreateCourseContentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      params: CreateCourseContentParams
    ): Promise<CourseContent> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/courses/${params.courseId}/contents`,
        {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: params.title,
            description: params.description,
            content: params.content,
            contentVariants: params.contentVaraints,
            order: params.order,
            chapterId: params.chapterId,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create course content");
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
