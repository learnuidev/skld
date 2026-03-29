import { ExamBankBase } from "../exam-bank/exam-bank.types";

export type ExamBankV2 = ExamBankBase & {
  totalQuestions: number;
};

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
