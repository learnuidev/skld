"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";
import { MockExam } from "./user-mock-exams.types";

export function useGetMockExamsQuery(courseId: string) {
  return useQuery({
    queryKey: ["mockExams", courseId],
    queryFn: async (): Promise<MockExam[]> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/mocks?courseId=${courseId}`,
        {
          headers: {
            Authorization: token,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch mock exams");
      }

      return response.json();
    },
    enabled: !!courseId,
  });
}
