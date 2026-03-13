"use client";

import { appConfig } from "@/lib/app-config";
import { fetchAuthSession } from "@aws-amplify/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { KnowledgeGraph } from "./knowledge-graph.types";
import { GraphData } from "@/components/knowledge-graph/knowledge-graph.types";

export interface UpdateKnowledgeGraphParams {
  sk: string;
  nodes: GraphData["nodes"];
  links: GraphData["links"];
}

export function useUpdateKnowledgeGraphMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      params: UpdateKnowledgeGraphParams,
    ): Promise<KnowledgeGraph> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/v2/knowledge-graphs/${params.sk}`,
        {
          method: "PATCH",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nodes: params.nodes,
            links: params.links,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update knowledge graph");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.refetchQueries({
        queryKey: ["knowledgeGraph", variables.sk],
      });
    },
  });
}
