/* eslint-disable @typescript-eslint/no-explicit-any */
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

      // const sampLink = {
      //   source: "nation_state",
      //   target: "apt",
      //   value: 3,
      //   description:
      //     "Nation states deploy APTs as sophisticated cyber weapons for long-term operations",
      //   realExample:
      //     "Russia's GRU deployed APT28 (Fancy Bear) to target the DNC during 2016 US elections. China's PLA deployed APT1 to steal intellectual property from US defense contractors.",
      //   strength: "high",
      //   color: NODE_COLORS.mutedMauve,
      // };

      console.log("RESP", resp);

      return resp;

      return {
        ...resp,
        knowledgeGraphData: {
          ...resp?.knowledgeGraphData,
          links: resp?.knowledgeGraphData?.links?.map((link: any) => {
            return {
              ...link,
              source:
                link?.source?.id || resp?.knowledgeGraphData?.nodes?.[0]?.id,
              target:
                link?.target?.id || resp?.knowledgeGraphData?.nodes?.[1]?.id,
            };
          }),
        },
      };
    },
    enabled: !!chapterId,
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
