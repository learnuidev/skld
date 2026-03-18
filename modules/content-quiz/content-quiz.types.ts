import { MockExam } from "../user-mock-exams/user-mock-exams.types";
import { UserContentStat } from "../skld/skld.types";

export type { MockExam };
export type { UserContentStat };

export interface CreateContentQuizParams {
  courseId: string;
  contentId: string;
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
  userContentStat: UserContentStat;
  questionResults: QuestionResult[];
  overallAccuracy: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalTimeTaken: number;
}
