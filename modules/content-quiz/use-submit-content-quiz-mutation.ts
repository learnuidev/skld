"use client";

import { useMutation } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";
import {
  SubmitContentQuizParams,
  SubmitContentQuizResponse,
} from "./content-quiz.types";

export function useSubmitContentQuizMutation() {
  return useMutation({
    mutationFn: async (
      params: SubmitContentQuizParams
    ): Promise<SubmitContentQuizResponse> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/courses/${params.courseId}/contents/${params.contentId}/content-quiz/${params.mockExamId}/submit`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            answers: params.answers,
            eliminatedAnswerIds: params.eliminatedAnswerIds,
            questionId: params.questionId,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit content quiz");
      }

      return response.json();
    },
  });
}
