"use client";

import { appConfig } from "@/lib/app-config";
import { fetchAuthSession } from "@aws-amplify/auth";
import { useQuery } from "@tanstack/react-query";
import { KnowledgeGraph } from "./knowledge-graph.types";

export function useGetKnowledgeGraphQuery(chapterId: string) {
  return useQuery({
    queryKey: ["knowledgeGraph", chapterId],
    queryFn: async (): Promise<KnowledgeGraph | null> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/knowledge-graphs/${chapterId}`,
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
        throw new Error(error.error || "Failed to get knowledge graph");
      }

      return response.json();
    },
    enabled: !!chapterId,
  });
}
