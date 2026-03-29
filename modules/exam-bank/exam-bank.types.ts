import { ResourceStatus } from "../knowledge-graph/knowledge-graph.types";

export type QuestionType =
  | "SINGLE_SELECT_MULTIPLE_CHOICE"
  | "MULTIPLE_SELECT_MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "ORDERING"
  | "MATCHING";

export const QUESTION_TYPES: { type: QuestionType; title: string }[] = [
  {
    type: "SINGLE_SELECT_MULTIPLE_CHOICE",
    title: "Single Select Multiple Choice",
  },
  {
    type: "MULTIPLE_SELECT_MULTIPLE_CHOICE",
    title: "Multiple Select Multiple Choice",
  },
  { type: "TRUE_FALSE", title: "True/False" },
  { type: "ORDERING", title: "Ordering" },
  { type: "MATCHING", title: "Matching" },
];

export type QuestionDifficulty = "easy" | "medium" | "hard";

export type QuestionTypeCategory =
  | "scenario"
  | "definition"
  | "sequence"
  | "identification";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  domainId: string;
  contentId?: string;
  question: string;
  options: QuestionOption[];
  type: QuestionType;
  feedback: string;
  difficulty?: QuestionDifficulty;
  questionType?: QuestionTypeCategory;

  // Deprecated, Please use correctOptionId
  correctOptionIndex?: number;
  // Deprecated, Please use correctOptionIds
  correctOptionIndexes?: number[];

  correctOptionId?: string;
  correctOptionIds?: string[];
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

  // This is index of the content slide
  slideIndex?: number;

  contentId?: string;
  specification?: {
    type?: string;
    difficulty?: string;
    questionType?: string;
    totalQuestions: number;
    domain?: string;
    title?: string;
    description?: string;
  };
  filterQuestions?: Array<{ question: string }>;

  status?: ResourceStatus;
  error?: string;
}
export interface ExamBankV2 {
  id: string;
  courseId: string;
  userId: string;
  title: string;
  description?: string;
  createdAt: number;
  updatedAt: number;

  // This is index of the content slide
  slideIndex?: number;

  contentId?: string;
  specification?: {
    type?: string;
    difficulty?: string;
    questionType?: string;
    totalQuestions: number;
    domain?: string;
    title?: string;
    description?: string;
  };
  filterQuestions?: Array<{ question: string }>;

  status?: ResourceStatus;
  error?: string;
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
