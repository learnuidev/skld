"use client";

import { appConfig } from "@/lib/app-config";
import { fetchAuthSession } from "@aws-amplify/auth";
import { useMutation } from "@tanstack/react-query";

interface GenerateLinkRelationshipsParams {
  sourceNode: {
    id: string;
    label: string;
    type: string;
    group: string;
    description: string;
    examples: string[];
  };
  targetNode: {
    id: string;
    label: string;
    type: string;
    group: string;
    description: string;
    examples: string[];
  };
}

interface LinkRelationship {
  value: number;
  description: string;
  realExample: string;
  strength: "high" | "medium" | "low";
}

type GenerateLinkRelationshipsResponse = LinkRelationship[];

export function useGenerateLinkRelationshipsMutation() {
  return useMutation({
    mutationFn: async (
      params: GenerateLinkRelationshipsParams
    ): Promise<GenerateLinkRelationshipsResponse> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/knowledge-graphs/gen-link-relationships`,
        {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sourceNode: params.sourceNode,
            targetNode: params.targetNode,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate link relationships");
      }

      return response.json();
    },
  });
}

export type { GenerateLinkRelationshipsResponse, LinkRelationship };
