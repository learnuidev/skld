import { LanguageCode, SupportedLanguage } from "@/constants/languages";
import { CourseType } from "./course.types";
import { QuestionType } from "../exam-bank/exam-bank.types";
import { CourseContentVariants } from "../course-content/course-content.types";

export interface CourseV2 {
  id: string;
  userId: string;
  title: string;
  description?: string;
  courseType: CourseType;
  hasCertification?: boolean;
  supportedLanguages?: SupportedLanguage[];
  createdAt: number;
  updatedAt: number;

  averageRating: number;
  totalTimesRated: number;
  totalTimesEnrolled: number;
}

export interface DomainV2 {
  id: string;
  courseId: string;
  title: string;
}

export interface ChapterV2 {
  id: string;
  domainId: string;
  title: string;
}

export interface ExamV2 {
  courseId: string;
  title: string;
  totalQuestions: number;
  totalTimeMinutes?: number;
  domainWeights: Record<string, number>;
  allowSkipQuestions: boolean;
  questionTypes?: QuestionType[];
}

export interface ContentV2 {
  id: string;
  title: string;
  contentVaraints?: CourseContentVariants[];
  userId: string;

  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: string | any;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface ListContent {
  id: string;
  sk: string;
  contentId: string;
  order: number;
}
