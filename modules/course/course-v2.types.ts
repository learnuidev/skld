import { LanguageCode, SupportedLanguage } from "@/constants/languages";
import { CourseType } from "./course.types";
import { QuestionType } from "../exam-bank/exam-bank.types";
import { CourseContentVariants } from "../course-content/course-content.types";

export interface CourseV2 {
  id: string;
  userId: string;
  defaultLanguage: LanguageCode;
  supportedLanguages: LanguageCode[];
  title: string;
  description?: string;
  courseType: CourseType;
  hasCertification?: boolean;
  createdAt: number;
  updatedAt: number;

  averageRating: number;
  totalTimesRated: number;
  totalTimesEnrolled: number;
}

export interface CourseTranslationV2 {
  pk: string;
  sk: string;
  courseId: string;
  languageCode: LanguageCode;
  title: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DomainV2 {
  id: string;
  courseId: string;
  title: string;
}

export interface DomainTranslationV2 {
  pk: string;
  sk: string;
  domainId: string;
  languageCode: LanguageCode;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface ChapterV2 {
  id: string;
  domainId: string;
  title: string;
}

export interface ChapterTranslationV2 {
  pk: string;
  sk: string;
  chapterId: string;
  languageCode: LanguageCode;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface ExamV2 {
  courseId: string;
  defaultLanguage: LanguageCode;
  title: string;
  totalQuestions: number;
  totalTimeMinutes?: number;
  domainWeights: Record<string, number>;
  allowSkipQuestions: boolean;
  questionTypes?: QuestionType[];
  createdAt: number;
  updatedAt: number;
}

export interface ExamTranslationV2 {
  pk: string;
  sk: string;
  examId: string;
  languageCode: LanguageCode;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface ContentV2 {
  id: string;
  courseId: string;
  chapterId?: string;
  defaultLanguage: LanguageCode;
  contentVariants?: CourseContentVariants[];
  userId: string;
  title: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: string | any;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface ContentTranslationV2 {
  pk: string;
  sk: string;
  contentId: string;
  languageCode: LanguageCode;
  title: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: string | any;
  createdAt: number;
  updatedAt: number;
}

export interface ListContent {
  id: string;
  sk: string;
  contentId: string;
  order: number;
}

export const DynamoDBKeys = {
  COURSE: (id: string) => `COURSE#${id}`,
  COURSE_TRANSLATION: (courseId: string, languageCode: LanguageCode) =>
    `COURSE#${courseId}#TRANSLATION#${languageCode}`,
  DOMAIN: (id: string) => `DOMAIN#${id}`,
  DOMAIN_TRANSLATION: (domainId: string, languageCode: LanguageCode) =>
    `DOMAIN#${domainId}#TRANSLATION#${languageCode}`,
  CHAPTER: (id: string) => `CHAPTER#${id}`,
  CHAPTER_TRANSLATION: (chapterId: string, languageCode: LanguageCode) =>
    `CHAPTER#${chapterId}#TRANSLATION#${languageCode}`,
  EXAM: (courseId: string) => `EXAM#${courseId}`,
  EXAM_TRANSLATION: (examId: string, languageCode: LanguageCode) =>
    `EXAM#${examId}#TRANSLATION#${languageCode}`,
  CONTENT: (id: string) => `CONTENT#${id}`,
  CONTENT_TRANSLATION: (contentId: string, languageCode: LanguageCode) =>
    `CONTENT#${contentId}#TRANSLATION#${languageCode}`,
} as const;

export type EntityType = "COURSE" | "DOMAIN" | "CHAPTER" | "EXAM" | "CONTENT";

export interface LanguageQueryParams {
  entityType: EntityType;
  entityId: string;
  languageCode?: LanguageCode;
}
