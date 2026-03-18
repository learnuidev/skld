"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";
import { SkldRequest, SkldResponse } from "./skld.types";

export function useSkldMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: SkldRequest): Promise<SkldResponse> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/skld`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(params),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit skld request");
      }

      const resp = (await response.json()) as SkldResponse;

      queryClient.refetchQueries({
        queryKey: ["userContentStats", params?.contentId],
      });

      return resp;
    },
  });
}
