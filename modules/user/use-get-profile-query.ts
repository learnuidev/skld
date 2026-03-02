"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";
import { UserProfile } from "./user.types";

export function useGetProfileQuery() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<UserProfile> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/user/profile`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch profile");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
