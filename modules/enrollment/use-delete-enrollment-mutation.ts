"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";

export function useDeleteEnrollmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string): Promise<void> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/enrollments/${courseId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: token,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete enrollment");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
}
