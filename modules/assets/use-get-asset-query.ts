"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";

interface Asset {
  id: string;
  fileName: string;
  contentType: string;
  s3Key: string;
  userId: string;
  status: string;
  createdAt: number;
  updatedAt: number;
  downloadUrl: string;
}

export const getAssetUrlApi = async (assetId: string): Promise<Asset> => {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) {
    throw new Error("No authentication token");
  }

  console.log("ASSET", appConfig);

  const response = await fetch(
    `${appConfig.NEXT_PUBLIC_API_BASE_URL}/assets/${assetId}`,
    {
      method: "GET",
      headers: {
        Authorization: token,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get asset");
  }

  return response.json();
};

export function useGetAssetQuery(assetId: string, enabled = true) {
  return useQuery({
    queryKey: ["asset", assetId],
    queryFn: async (): Promise<Asset> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      console.log("ASSET", appConfig);

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/assets/${assetId}`,
        {
          method: "GET",
          headers: {
            Authorization: token,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get asset");
      }

      return response.json();
    },
    enabled: enabled && !!assetId,
    staleTime: 1000 * 60 * 5,
  });
}
