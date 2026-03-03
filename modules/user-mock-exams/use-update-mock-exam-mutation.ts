"use client";

import { useMutation } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";
import { MockExam, UpdateMockExamParams } from "./user-mock-exams.types";

export function useUpdateMockExamMutation(mockExamId: string) {
  return useMutation({
    mutationFn: async (params: UpdateMockExamParams): Promise<MockExam> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/mocks/${mockExamId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(params),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update mock exam");
      }

      return response.json();
    },
  });
}
