import { ExamType, MockExam } from "../user-mock-exams/user-mock-exams.types";
import { UserContentStat } from "../skld/skld.types";

export type { MockExam };
export type { UserContentStat };

export interface CreateContentQuizParams {
  courseId: string;
  contentId: string;
  examBankIds: string[];
  questionIds?: string[];
  examType?: ExamType | null;
}

export interface SubmitContentQuizParams {
  courseId: string;
  contentId: string;
  mockExamId: string;
  answers: Record<string, unknown>;
}

export interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
  userAnswer: unknown;
  correctAnswer: unknown;
  timeSpent: number;
}

export interface SubmitContentQuizResponse {
  mockExam: MockExam;
  questionResult: QuestionResult;
  questionFeedback: string;
  currentQuestion: {
    id: string;
    question: string;
    options: string[];
    type: string;
  };
  isCorrect: boolean;
  correctAnswer: unknown;
  userAnswer: unknown;
  isLastQuestion: boolean;
  overallAccuracy: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalQuestions: number;
  answeredQuestions: number;
  userContentStat: UserContentStat;
}
