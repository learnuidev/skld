"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";
import { QuestionV2 } from "../exam-bank/exam-bank.types";

export interface ListQuestionsParams {
  contentId?: string;
  questionIds?: string[];
  examBankId?: string;
  mockExamId?: string;
  lastEvaluatedKey?: string;
  limit?: number;
}

export interface ListQuestionsResponse {
  items: QuestionV2[];
  pagination: Record<string, unknown>;
}

export function useListQuestionsQuery({
  contentId,
  questionIds,
  examBankId,
  mockExamId,
  lastEvaluatedKey,
  limit,
}: ListQuestionsParams) {
  const queryParams = new URLSearchParams();
  if (contentId) {
    queryParams.append("contentId", contentId);
  }
  if (examBankId) {
    queryParams.append("examBankId", examBankId);
  }
  if (mockExamId) {
    queryParams.append("mockExamId", mockExamId);
  }
  if (questionIds && questionIds.length > 0) {
    queryParams.append("questionIds", questionIds.join(","));
  }
  if (lastEvaluatedKey) {
    queryParams.append("lastEvaluatedKey", lastEvaluatedKey);
  }
  if (limit) {
    queryParams.append("limit", limit.toString());
  }

  return useQuery({
    queryKey: [
      "questions",
      contentId,
      questionIds,
      examBankId,
      mockExamId,
      lastEvaluatedKey,
      limit,
    ],
    queryFn: async (): Promise<ListQuestionsResponse> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const url = `${appConfig.NEXT_PUBLIC_API_BASE_URL}/v1/questions${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await fetch(url, {
        headers: {
          Authorization: token,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch questions");
      }

      return response.json();
    },
    enabled:
      !!contentId ||
      !!examBankId ||
      !!mockExamId ||
      (questionIds && questionIds.length > 0),
  });
}
