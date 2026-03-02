"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";
import { UserProfile } from "./user.types";

export function useBecomeCreatorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<UserProfile> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/user/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ addRole: "creator" }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to become creator");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data);
    },
  });
}
