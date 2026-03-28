"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";
import { EnrollmentStatsResponse } from "./enrollment.types";

export function useListUserEnrollmentStatsQuery(
  courseId: string,
  props?: {
    onSuccess?: (resp: EnrollmentStatsResponse) => void;
  }
) {
  return useQuery({
    queryKey: ["enrollmentStats", courseId],
    queryFn: async (): Promise<EnrollmentStatsResponse> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/enrollments/${courseId}/stats`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch enrollment stats");
      }

      const resp = (await response.json()) as EnrollmentStatsResponse;

      if (props?.onSuccess) {
        props?.onSuccess(resp);
      }

      return resp;
    },
    enabled: !!courseId,
  });
}
