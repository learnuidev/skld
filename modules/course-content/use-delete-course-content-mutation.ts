"use client";

import { appConfig } from "@/lib/app-config";
import { fetchAuthSession } from "@aws-amplify/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteCourseContentMutation(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentId: string): Promise<void> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/courses/${courseId}/contents/${contentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: token,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete course content");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["courseContents", courseId],
      });
    },
  });
}
