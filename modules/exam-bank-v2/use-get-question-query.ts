"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";
import { QuestionV2 } from "@/modules/exam-bank/exam-bank.types";

export function useGetQuestionQuery(questionId: string) {
  return useQuery({
    queryKey: ["question", questionId],
    queryFn: async (): Promise<QuestionV2> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/v1/questions/${questionId}`,
        {
          headers: {
            Authorization: token,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch question");
      }

      return response.json();
    },
    enabled: !!questionId,
  });
}
