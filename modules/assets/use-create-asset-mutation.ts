"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";

interface CreateAssetParams {
  fileName: string;
  contentType: string;
  s3Key?: string;
}

interface Asset {
  id: string;
  fileName: string;
  contentType: string;
  s3Key: string;
  userId: string;
  status: string;
  createdAt: number;
  updatedAt: number;
}

export function useCreateAssetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateAssetParams): Promise<Asset> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/assets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(params),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create asset");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}
