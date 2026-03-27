import { LanguageCode, SupportedLanguage } from "@/constants/languages";
import { CourseType } from "./course.types";
import { QuestionType } from "../exam-bank/exam-bank.types";
import { CourseContentVariants } from "../course-content/course-content.types";

export interface CourseV2 {
  /** Unique identifier for the course */
  id: string;
  /** ID of the user who created the course */
  userId: string;
  /** Default language of the course content */
  defaultLanguage: LanguageCode;
  /** List of languages supported by this course */
  supportedLanguages: LanguageCode[];
  /** Title of the course */
  title: string;
  /** Detailed description of the course */
  description?: string;
  /** Type/category of the course */
  courseType: CourseType;
  /** Whether the course offers certification upon completion */
  hasCertification?: boolean;
  /** Timestamp when the course was created (Unix epoch in seconds) */
  createdAt: number;
  /** Timestamp when the course was last updated (Unix epoch in seconds) */
  updatedAt: number;

  /** Average rating of the course (0-5 scale) */
  averageRating: number;
  /** Total number of times the course has been rated */
  totalTimesRated: number;
  /** Total number of enrollments for the course */
  totalTimesEnrolled: number;
}

export interface CourseTranslationV2 {
  /** Primary key for DynamoDB */
  pk: string;
  /** Sort key for DynamoDB */
  sk: string;
  /** Reference to the parent course ID */
  courseId: string;
  /** Language code for this translation */
  languageCode: LanguageCode;
  /** Translated title of the course */
  title: string;
  /** Translated description of the course */
  description?: string;
  /** Timestamp when the translation was created (Unix epoch in seconds) */
  createdAt: number;
  /** Timestamp when the translation was last updated (Unix epoch in seconds) */
  updatedAt: number;
}

export interface DomainV2 {
  /** Unique identifier for the domain */
  id: string;
  /** Reference to the parent course ID */
  courseId: string;
  /** Title of the domain */
  title: string;
}

export interface DomainTranslationV2 {
  /** Primary key for DynamoDB */
  pk: string;
  /** Sort key for DynamoDB */
  sk: string;
  /** Reference to the parent domain ID */
  domainId: string;
  /** Language code for this translation */
  languageCode: LanguageCode;
  /** Translated title of the domain */
  title: string;
  /** Timestamp when the translation was created (Unix epoch in seconds) */
  createdAt: number;
  /** Timestamp when the translation was last updated (Unix epoch in seconds) */
  updatedAt: number;
}

export interface ChapterV2 {
  /** Unique identifier for the chapter */
  id: string;
  /** Reference to the parent domain ID */
  domainId: string;
  /** Title of the chapter */
  title: string;
}

export interface ChapterTranslationV2 {
  /** Primary key for DynamoDB */
  pk: string;
  /** Sort key for DynamoDB */
  sk: string;
  /** Reference to the parent chapter ID */
  chapterId: string;
  /** Language code for this translation */
  languageCode: LanguageCode;
  /** Translated title of the chapter */
  title: string;
  /** Timestamp when the translation was created (Unix epoch in seconds) */
  createdAt: number;
  /** Timestamp when the translation was last updated (Unix epoch in seconds) */
  updatedAt: number;
}

export interface ExamV2 {
  /** Reference to the parent course ID */
  courseId: string;
  /** Default language for the exam content */
  defaultLanguage: LanguageCode;
  /** Title of the exam */
  title: string;
  /** Total number of questions in the exam */
  totalQuestions: number;
  /** Time limit for the exam in minutes */
  totalTimeMinutes?: number;
  /** Mapping of domain IDs to their weight in the exam */
  domainWeights: Record<string, number>;
  /** Whether students are allowed to skip questions during the exam */
  allowSkipQuestions: boolean;
  /** Types of questions included in the exam */
  questionTypes?: QuestionType[];
  /** Timestamp when the exam was created (Unix epoch in seconds) */
  createdAt: number;
  /** Timestamp when the exam was last updated (Unix epoch in seconds) */
  updatedAt: number;
}

export interface ExamTranslationV2 {
  /** Primary key for DynamoDB */
  pk: string;
  /** Sort key for DynamoDB */
  sk: string;
  /** Reference to the parent exam ID */
  examId: string;
  /** Language code for this translation */
  languageCode: LanguageCode;
  /** Translated title of the exam */
  title: string;
  /** Timestamp when the translation was created (Unix epoch in seconds) */
  createdAt: number;
  /** Timestamp when the translation was last updated (Unix epoch in seconds) */
  updatedAt: number;
}

export interface ContentDetails {
  /** Unique identifier for the content */
  id: string;
  /** Reference to the parent content ID from ContentV2 */
  contentId: string;
  /** Language code for this content */
  languageCode: LanguageCode;
  /** The actual content data (can be text string or any structured data) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: string | any;
  /** Timestamp when the content details were created (Unix epoch in seconds) */
  createdAt: number;
  /** Timestamp when the content details were last updated (Unix epoch in seconds) */
  updatedAt: number;
}

export interface ContentV2 {
  /** Unique identifier for the content */
  id: string;
  /** Reference to the parent course ID */
  courseId: string;
  /** Reference to the parent chapter ID (optional for course-level content) */
  chapterId?: string;
  /** Default language for the content */
  defaultLanguage: LanguageCode;
  /** List of content variants in different formats/languages */
  contentVariants?: CourseContentVariants[];
  /** ID of the user who created the content */
  userId: string;
  /** Title of the content */
  title: string;
  /** Description of the content */
  description?: string;
  /** Order/sequence of this content within the chapter/course */
  order: number;
  /** Timestamp when the content was created (Unix epoch in seconds) */
  createdAt: number;
  /** Timestamp when the content was last updated (Unix epoch in seconds) */
  updatedAt: number;
}

export interface ContentTranslationV2 {
  /** Primary key for DynamoDB */
  pk: string;
  /** Sort key for DynamoDB */
  sk: string;
  /** Reference to the parent content ID */
  contentId: string;
  /** Language code for this translation */
  languageCode: LanguageCode;
  /** Translated title of the content */
  title: string;
  /** Translated description of the content */
  description?: string;
  /** Timestamp when the translation was created (Unix epoch in seconds) */
  createdAt: number;
  /** Timestamp when the translation was last updated (Unix epoch in seconds) */
  updatedAt: number;
}

export interface ListContent {
  /** Unique identifier for the list entry */
  id: string;
  /** Sort key for DynamoDB */
  sk: string;
  /** Reference to the parent content ID */
  contentId: string;
  /** Order/sequence of this content in the list */
  order: number;
}

export const DynamoDBKeys = {
  /** Generates DynamoDB key for a course */
  COURSE: (id: string) => `COURSE#${id}`,
  /** Generates DynamoDB key for a course translation */
  COURSE_TRANSLATION: (courseId: string, languageCode: LanguageCode) =>
    `COURSE#${courseId}#TRANSLATION#${languageCode}`,
  /** Generates DynamoDB key for a domain */
  DOMAIN: (id: string) => `DOMAIN#${id}`,
  /** Generates DynamoDB key for a domain translation */
  DOMAIN_TRANSLATION: (domainId: string, languageCode: LanguageCode) =>
    `DOMAIN#${domainId}#TRANSLATION#${languageCode}`,
  /** Generates DynamoDB key for a chapter */
  CHAPTER: (id: string) => `CHAPTER#${id}`,
  /** Generates DynamoDB key for a chapter translation */
  CHAPTER_TRANSLATION: (chapterId: string, languageCode: LanguageCode) =>
    `CHAPTER#${chapterId}#TRANSLATION#${languageCode}`,
  /** Generates DynamoDB key for an exam */
  EXAM: (courseId: string) => `EXAM#${courseId}`,
  /** Generates DynamoDB key for an exam translation */
  EXAM_TRANSLATION: (examId: string, languageCode: LanguageCode) =>
    `EXAM#${examId}#TRANSLATION#${languageCode}`,
  /** Generates DynamoDB key for content */
  CONTENT: (id: string) => `CONTENT#${id}`,
  /** Generates DynamoDB key for a content translation */
  CONTENT_TRANSLATION: (contentId: string, languageCode: LanguageCode) =>
    `CONTENT#${contentId}#TRANSLATION#${languageCode}`,
  /** Generates DynamoDB key for content details */
  CONTENT_DETAILS: (id: string) => `CONTENT_DETAILS#${id}`,
} as const;

export type EntityType = "COURSE" | "DOMAIN" | "CHAPTER" | "EXAM" | "CONTENT";

export interface LanguageQueryParams {
  /** Type of entity to query (course, domain, chapter, exam, or content) */
  entityType: EntityType;
  /** Unique identifier of the entity */
  entityId: string;
  /** Optional language code to filter translations */
  languageCode?: LanguageCode;
}
