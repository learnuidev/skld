"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";
import { QuestionV2 } from "@/modules/exam-bank/exam-bank.types";

interface UpdateQuestionParams {
  question: Partial<QuestionV2>;
}

export function useUpdateQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      questionId,
      updates,
    }: {
      questionId: string;
      updates: Partial<QuestionV2>;
    }): Promise<QuestionV2> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/v1/questions/${questionId}`,
        {
          method: "PUT",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update question");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["question", variables.questionId], data);
      queryClient.invalidateQueries({
        queryKey: ["questions"],
      });
    },
  });
}
