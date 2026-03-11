"use client";

import { graphData } from "@/components/knowledge-graph/graph-data";
import { KnowledgeGraph } from "@/components/knowledge-graph/knowledge-graph";

export default function KnowledgeGraphPage() {
  return <KnowledgeGraph graphData={graphData} />;
}
