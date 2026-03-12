"use client";

import { appConfig } from "@/lib/app-config";
import { fetchAuthSession } from "@aws-amplify/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateKnowledgeGraphParams,
  KnowledgeGraph,
} from "./knowledge-graph.types";

export function useCreateKnowledgeGraphMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      params: CreateKnowledgeGraphParams,
    ): Promise<KnowledgeGraph> => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_API_BASE_URL}/knowledge-graphs`,
        {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courseId: params.courseId,
            chapterId: params.chapterId,
            contentId: params.contentId,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create knowledge graph");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      const sk = variables.chapterId
        ? `CHAPTER#${variables.chapterId}`
        : `CONTENT#${variables.contentId}`;
      queryClient.invalidateQueries({
        queryKey: ["knowledgeGraph", sk],
      });
    },
  });
}
