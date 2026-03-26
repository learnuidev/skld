"use client";

import { useMutation } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";
import { MockExam, CreateContentQuizParams } from "./content-quiz.types";

export function useCreateContentQuizMutation() {
  return useMutation({
    mutationFn: async (params: CreateContentQuizParams): Promise<MockExam> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/courses/${params.courseId}/contents/${params.contentId}/content-quiz`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },

          body: JSON.stringify({
            questionIds: params.questionIds,
            examBankIds: params.examBankIds,
            examType: params.examType,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create content quiz");
      }

      return response.json();
    },
  });
}
