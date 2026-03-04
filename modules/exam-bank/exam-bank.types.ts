export type QuestionType =
  | "SINGLE_SELECT_MULTIPLE_CHOICE"
  | "MULTIPLE_SELECT_MULTIPLE_CHOICE"
  | "TRUE_FALSE";

export type QuestionDifficulty = "easy" | "medium" | "hard";

export type QuestionTypeCategory =
  | "scenario"
  | "definition"
  | "sequence"
  | "identification";

export interface Question {
  id: string;
  domainId: string;
  contentId?: string;
  question: string;
  options: string[];
  type: QuestionType;
  feedback: string;
  difficulty?: QuestionDifficulty;
  questionType?: QuestionTypeCategory;
  correctOptionIndex?: number;
  correctOptionIndexes?: number[];
}

export interface ExamBank {
  id: string;
  courseId: string;
  userId: string;
  title: string;
  description?: string;
  questions: Question[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateExamBankParams {
  courseId: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface UpdateExamBankParams {
  title?: string;
  description?: string;
  questions?: Question[];
}
