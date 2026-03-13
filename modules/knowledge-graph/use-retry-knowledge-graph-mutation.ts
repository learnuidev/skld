"use client";

import { appConfig } from "@/lib/app-config";
import { fetchAuthSession } from "@aws-amplify/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { KnowledgeGraph } from "./knowledge-graph.types";

export function useRetryKnowledgeGraphMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sk: string): Promise<KnowledgeGraph> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/v2/knowledge-graphs/${sk}/retry`,
        {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Failed to retry knowledge graph generation",
        );
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.refetchQueries({
        queryKey: ["knowledgeGraph", data.sk],
      });
    },
  });
}
