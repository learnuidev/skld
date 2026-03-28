"use client";

import { appConfig } from "@/lib/app-config";
import { fetchAuthSession } from "@aws-amplify/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ExamBank } from "./exam-bank.types";

export function useRetryExamBankMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      courseId: string;
      examBankId: string;
    }): Promise<ExamBank> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/courses/${params.courseId}/exam-banks/${params.examBankId}/retry`,
        {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to retry exam bank");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.refetchQueries({
        queryKey: ["examBank", variables.examBankId],
      });
    },
  });
}
