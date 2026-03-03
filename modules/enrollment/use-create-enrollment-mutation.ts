"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";
import { Enrollment, CreateEnrollmentParams } from "./enrollment.types";

export function useCreateEnrollmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateEnrollmentParams): Promise<Enrollment> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/enrollments`,
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
        throw new Error(error.error || "Failed to create enrollment");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
}
