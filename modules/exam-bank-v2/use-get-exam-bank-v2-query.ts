"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";
import {
  ExamBankV2WithQuestions,
  GetExamBankV2Params,
} from "./exam-bank-v2.types";

export function useGetExamBankV2Query({
  courseId,
  examBankId,
}: GetExamBankV2Params) {
  return useQuery({
    queryKey: ["examBankV2", courseId, examBankId],
    queryFn: async (): Promise<ExamBankV2WithQuestions> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const url = `${appConfig.NEXT_PUBLIC_API_BASE_URL}/courses/${courseId}/v2/exam-banks/${examBankId}`;

      const response = await fetch(url, {
        headers: {
          Authorization: token,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch exam bank v2");
      }

      return response.json();
    },
    enabled: !!courseId && !!examBankId,
  });
}
