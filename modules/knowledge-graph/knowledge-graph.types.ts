import { GraphData } from "@/components/knowledge-graph/knowledge-graph.types";

export interface KnowledgeGraph {
  id: string;
  courseId: string;
  chapterId: string;
  userId: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "processing";
  knowledgeGraphData?: GraphData;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateKnowledgeGraphParams {
  courseId: string;
  chapterId: string;
}
