"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";
import { Enrollment } from "./enrollment.types";

export function useGetEnrollmentQuery(courseId: string) {
  return useQuery({
    queryKey: ["enrollment", courseId],
    queryFn: async (): Promise<Enrollment | null> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/enrollments/${courseId}`,
        {
          headers: {
            Authorization: token,
          },
        },
      );

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch enrollment");
      }

      return response.json();
    },
    enabled: !!courseId,
  });
}

export function useGetEnrollmentsQuery() {
  return useQuery({
    queryKey: ["enrollments"],
    queryFn: async (): Promise<Enrollment[]> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/enrollments`,
        {
          headers: {
            Authorization: token,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch enrollments");
      }

      return response.json();
    },
  });
}
