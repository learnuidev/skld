export type ExamType = "timed" | "untimed" | "failed";

export type MockExamStatus = "in_progress" | "completed" | "abandoned";

type AnswerItem = number | string | boolean | null;

export interface Answer {
  questionId: string;
  answer?: AnswerItem;
  answers?: AnswerItem[];
  timeSpent: number;
  answeredAt: number;
}
export interface MockExam {
  id: string;
  userId: string;
  courseId: string;
  examBankIds: string[];
  questionIds?: string[];
  examType: ExamType;
  selectedContentIds?: string[];
  selectedDomains: string[];
  currentQuestionId: string;
  answers: Record<string, Answer>;
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
  examBankIds: string[];
}

export interface UpdateMockExamParams {
  currentQuestionId?: string;
  answers?: Record<string, unknown>;
  timeSpent?: number;
  timeRemaining?: number;
  status?: MockExamStatus;
}
