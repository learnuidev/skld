"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";
import {
  ExamBank,
  CreateExamBankParams,
  UpdateExamBankParams,
} from "./exam-bank.types";

export function useCreateExamBankMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateExamBankParams): Promise<ExamBank> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/courses/${params.courseId}/exam-banks`,
        {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: params.title,
            description: params.description,
            questions: params.questions,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create exam bank");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["examBanks", variables.courseId],
      });
    },
  });
}

export function useUpdateExamBankMutation(
  courseId: string,
  examBankId: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateExamBankParams): Promise<ExamBank> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/courses/${courseId}/exam-banks/${examBankId}`,
        {
          method: "PUT",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update exam bank");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["examBanks", courseId],
      });
      queryClient.invalidateQueries({
        queryKey: ["examBankV2", courseId, examBankId],
      });
    },
  });
}

export function useDeleteExamBankMutation(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (examBankId: string): Promise<void> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/courses/${courseId}/exam-banks/${examBankId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: token,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete exam bank");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["examBanks", courseId],
      });
    },
  });
}
