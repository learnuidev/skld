"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";
import {
  ListExamBanksV2Response,
  ListExamBanksV2Params,
} from "./exam-bank-v2.types";

export function useListExamBanksV2Query({
  courseId,
  lastEvaluatedKey,
  limit,
}: ListExamBanksV2Params) {
  const queryParams = new URLSearchParams();
  if (lastEvaluatedKey) {
    queryParams.append("lastEvaluatedKey", lastEvaluatedKey);
  }
  if (limit) {
    queryParams.append("limit", limit.toString());
  }

  return useQuery({
    queryKey: ["examBanksV2", courseId, lastEvaluatedKey, limit],
    queryFn: async (): Promise<ListExamBanksV2Response> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const url = `${appConfig.NEXT_PUBLIC_API_BASE_URL}/courses/${courseId}/v2/exam-banks${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await fetch(url, {
        headers: {
          Authorization: token,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch exam banks v2");
      }

      return response.json();
    },
    enabled: !!courseId,
  });
}
