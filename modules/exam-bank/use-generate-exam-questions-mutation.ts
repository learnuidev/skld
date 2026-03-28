"use client";

import { useMutation } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";
import { ExamBank } from "./exam-bank.types";

export interface GenerateExamQuestionsParams {
  courseId: string;
  contentId: string;
  specification: {
    type?: string;
    difficulty?: string;
    questionType?: string;
    totalQuestions: number;
    domain?: string;
    title?: string;
    description?: string;
  };
  slideIndex?: number | null;
  filterQuestions?: Array<{ question: string }>;
}

export function useGenerateExamQuestionsMutation() {
  return useMutation({
    mutationFn: async (
      params: GenerateExamQuestionsParams,
    ): Promise<ExamBank> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/courses/${params.courseId}/contents/${params.contentId}/generate-exam-questions`,
        {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            specification: params.specification,
            slideIndex: params.slideIndex,
            filterQuestions: params.filterQuestions,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate exam questions");
      }

      return response.json();
    },
  });
}
