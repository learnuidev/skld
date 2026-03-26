"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";
import {
  UserCourseRating,
  CreateUserCourseRatingParams,
} from "./user-course-rating.types";

export function useAddUserCourseRatingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      params: CreateUserCourseRatingParams,
    ): Promise<UserCourseRating> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/user-course-ratings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(params),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add course rating");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({
        queryKey: ["courses", variables.courseId],
      });
      queryClient.invalidateQueries({ queryKey: ["public-courses"] });
    },
  });
}
