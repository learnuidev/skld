"use client";

import { appConfig } from "@/lib/app-config";
import { fetchAuthSession } from "@aws-amplify/auth";
import { useQuery } from "@tanstack/react-query";
import { MockExam } from "./user-mock-exams.types";

export function useGetMockExamQuery(
  mockExamId: string,
  options?: {
    onSuccess?: (data: MockExam) => void;
  }
) {
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
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch mock exam");
      }

      const resp = await response.json();

      if (options?.onSuccess) {
        options?.onSuccess(resp);
      }

      return resp;
    },
    enabled: !!mockExamId,
  });
}
