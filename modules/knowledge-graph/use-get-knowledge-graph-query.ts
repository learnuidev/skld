/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { appConfig } from "@/lib/app-config";
import { fetchAuthSession } from "@aws-amplify/auth";
import { useQuery } from "@tanstack/react-query";
import { KnowledgeGraph } from "./knowledge-graph.types";

export function useGetKnowledgeGraphQuery(params: {
  contentId?: string;
  chapterId?: string;
}) {
  let sk = "";

  if (params.contentId) {
    sk = `CONTENT_${params.contentId}`;
  }

  if (params.chapterId) {
    sk = `CHAPTER_${params.chapterId}`;
  }

  return useQuery({
    queryKey: ["knowledgeGraph", sk],
    queryFn: async (): Promise<KnowledgeGraph | null> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/v2/knowledge-graphs/${sk}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get knowledge graph");
      }

      const resp = await response.json();

      return resp;
    },
    enabled: !!sk,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      if (data.status === "completed" || data.status === "failed") {
        return false;
      }
      return 5000;
    },
  });
}
