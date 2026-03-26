import { QuestionType } from "@/modules/exam-bank/exam-bank.types";
import { SupportedLanguage } from "@/constants/languages";

export type CourseType =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "professional";

export interface Course {
  id: string;
  userId: string;
  title: string;
  description?: string;
  courseType?: CourseType;
  hasCertification?: boolean;
  supportedLanguages?: SupportedLanguage[];
  createdAt: number;
  updatedAt: number;
  domains?: Domain[];
  exam?: ExamInfo;

  // stats
  // Update these two when the user rates a course
  averageRating: number;
  totalTimesRated: number;
  // Update this when the user first enrolls in a course
  totalTimesEnrolled: number;
}

export interface CreateCourseParams {
  title: string;
  description?: string;
  courseType?: CourseType;
  hasCertification?: boolean;
  supportedLanguages?: SupportedLanguage[];
  domains?: Domain[];
  exam?: ExamInfo;
}

export interface UpdateCourseParams {
  title?: string;
  description?: string;
  courseType?: CourseType;
  hasCertification?: boolean;
  supportedLanguages?: SupportedLanguage[];
  domains?: Domain[];
  exam?: ExamInfo;
}

export interface Domain {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  name: string;
}

export interface ExamInfo {
  totalQuestions: number;
  totalTimeMinutes?: number;
  domainWeights: Record<string, number>;
  allowSkipQuestions: boolean;
  questionTypes?: QuestionType[];
}

export interface CourseFormData {
  title: string;
  description: string;
  courseType: CourseType;
  hasCertification: boolean;
  supportedLanguages: SupportedLanguage[];
  domains: Array<{
    id: string;
    name: string;
    chapters: Array<{
      id: string;
      name: string;
    }>;
  }>;
  exam: {
    totalQuestions: number;
    totalTimeMinutes: number;
    domainWeights: Record<string, number>;
    allowSkipQuestions: boolean;
    questionTypes: QuestionType[];
  };
}
