"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";
import { MockExam } from "./user-mock-exams.types";

export function useGetMockExamQuery(mockExamId: string) {
  return useQuery({
    queryKey: ["mockExam", mockExamId],
    queryFn: async (): Promise<MockExam> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/mocks/${mockExamId}`,
        {
          headers: {
            Authorization: token,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch mock exam");
      }

      return response.json();
    },
    enabled: !!mockExamId,
  });
}
