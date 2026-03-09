"use client";

import { useMutation } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";

interface GenerateUploadUrlParams {
  fileName: string;
  contentType: string;
}

interface GenerateUploadUrlResponse {
  uploadUrl: string;
  s3Key: string;
  id: string;
}

export function useGenerateUploadUrlMutation() {
  return useMutation({
    mutationFn: async ({
      fileName,
      contentType,
    }: GenerateUploadUrlParams): Promise<GenerateUploadUrlResponse> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/assets/upload-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ fileName, contentType }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate upload URL");
      }

      return response.json();
    },
  });
}
