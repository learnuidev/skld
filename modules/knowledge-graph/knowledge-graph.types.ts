export interface KnowledgeGraph {
  id: string;
  courseId: string;
  chapterId: string;
  userId: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  knowledgeGraphData?: any;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateKnowledgeGraphParams {
  courseId: string;
  chapterId: string;
}
