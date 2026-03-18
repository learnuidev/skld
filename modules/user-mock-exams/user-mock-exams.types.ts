export type ExamType = "timed" | "untimed";

export type MockExamStatus = "in_progress" | "completed" | "abandoned";

type AnswerItem = number | string | boolean | null;

interface Answer {
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
  examType: ExamType;
  selectedContentIds?: string[];
  selectedDomains: string[];
  currentQuestionIndex: number;
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
  currentQuestionIndex?: number;
  answers?: Record<string, unknown>;
  timeSpent?: number;
  timeRemaining?: number;
  status?: MockExamStatus;
}
