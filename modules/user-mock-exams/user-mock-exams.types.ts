export type ExamType = "timed" | "untimed";

export type MockExamStatus = "in_progress" | "completed" | "abandoned";

export interface MockExam {
  id: string;
  userId: string;
  courseId: string;
  examType: ExamType;
  selectedDomains: string[];
  currentQuestionIndex: number;
  answers: Record<string, unknown>;
  timeSpent: number;
  timeRemaining: number | null;
  status: MockExamStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateMockExamParams {
  courseId: string;
  examType: ExamType;
  selectedDomains: string[];
  totalTimeSeconds: number;
}

export interface UpdateMockExamParams {
  currentQuestionIndex?: number;
  answers?: Record<string, unknown>;
  timeSpent?: number;
  timeRemaining?: number;
  status?: MockExamStatus;
}
