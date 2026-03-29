"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";
import { ExamBank } from "./exam-bank.types";

export function useListExamBanksQuery(courseId: string) {
  return useQuery({
    queryKey: ["examBanks", courseId],
    queryFn: async (): Promise<ExamBank[]> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/courses/${courseId}/exam-banks`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch exam banks");
      }

      return response.json();
    },
    enabled: !!courseId,
  });
}
