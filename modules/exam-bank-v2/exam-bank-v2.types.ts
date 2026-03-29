import { ExamBankBase, QuestionV2 } from "../exam-bank/exam-bank.types";

export type ExamBankV2 = ExamBankBase & {
  totalQuestions: number;
  contentId: string;
  courseId: string;
};

export interface ExamBankV2WithQuestions extends ExamBankV2 {
  questions: QuestionV2[];
}

export interface ListExamBanksV2Response {
  items: ExamBankV2[];
  pagination: {
    lastEvaluatedKey?: string;
  };
}

export interface ListExamBanksV2Params {
  courseId: string;
  lastEvaluatedKey?: string;
  limit?: number;
}

export interface GetExamBankV2Params {
  courseId: string;
  examBankId: string;
}
