import { LanguageCode } from "@/constants/languages";
import { CourseContentVariants } from "../course-content/course-content.types";
import { QuestionType } from "../exam-bank/exam-bank.types";
import { CourseLevel } from "./course.types";

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
  /** Level of the course */
  courseLevel: CourseLevel;
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
  /** Primary key for DynamoDB. Example: "COURSE_course123_TRANSLATION_en" */
  courseIdAndLang: string;
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
  /** Primary key for DynamoDB. Example: "DOMAIN_domain456" */
  id: string;
  /** Sort key for DynamoDB. Example: "DOMAIN_domain456_TRANSLATION_en" */
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
  /** Primary key for DynamoDB. Example: "CHAPTER_chapter789" */
  id: string;
  /** Sort key for DynamoDB. Example: "CHAPTER_chapter789_TRANSLATION_en" */
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
  /** Primary key for DynamoDB. Example: "EXAM_exam101" */
  id: string;
  /** Sort key for DynamoDB. Example: "EXAM_exam101_TRANSLATION_en" */
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
  /** Primary key for DynamoDB. Example: "CONTENT_content202" */
  id: string;
  /** Sort key for DynamoDB. Example: "CONTENT_content202_TRANSLATION_en" */
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

export interface ChapterContent {
  /** Unique identifier for the list entry */
  id: string;
  /** Sort key for DynamoDB. Example: "CONTENT_content202_LIST_list303" */
  chapterId: string;
  /** Reference to the parent content ID */
  contentId: string;
  /** Order/sequence of this content in the list */
  order: number;
}

export const DynamoDBKeys = {
  /** Generates DynamoDB primary key for a course. Example: COURSE("course123") => "COURSE_course123" */
  COURSE: (id: string) => `COURSE_${id}`,
  /** Generates DynamoDB sort key for a course translation. Example: COURSE_TRANSLATION("course123", "en") => "COURSE_course123_TRANSLATION_en" */
  COURSE_TRANSLATION: (courseId: string, languageCode: LanguageCode) =>
    `COURSE_${courseId}_TRANSLATION_${languageCode}`,
  /** Generates DynamoDB primary key for a domain. Example: DOMAIN("domain456") => "DOMAIN_domain456" */
  DOMAIN: (id: string) => `DOMAIN_${id}`,
  /** Generates DynamoDB sort key for a domain translation. Example: DOMAIN_TRANSLATION("domain456", "en") => "DOMAIN_domain456_TRANSLATION_en" */
  DOMAIN_TRANSLATION: (domainId: string, languageCode: LanguageCode) =>
    `DOMAIN_${domainId}_TRANSLATION_${languageCode}`,
  /** Generates DynamoDB primary key for a chapter. Example: CHAPTER("chapter789") => "CHAPTER_chapter789" */
  CHAPTER: (id: string) => `CHAPTER_${id}`,
  /** Generates DynamoDB sort key for a chapter translation. Example: CHAPTER_TRANSLATION("chapter789", "en") => "CHAPTER_chapter789_TRANSLATION_en" */
  CHAPTER_TRANSLATION: (chapterId: string, languageCode: LanguageCode) =>
    `CHAPTER_${chapterId}_TRANSLATION_${languageCode}`,
  /** Generates DynamoDB primary key for an exam. Example: EXAM("exam101") => "EXAM_exam101" */
  EXAM: (courseId: string) => `EXAM_${courseId}`,
  /** Generates DynamoDB sort key for an exam translation. Example: EXAM_TRANSLATION("exam101", "en") => "EXAM_exam101_TRANSLATION_en" */
  EXAM_TRANSLATION: (examId: string, languageCode: LanguageCode) =>
    `EXAM_${examId}_TRANSLATION_${languageCode}`,
  /** Generates DynamoDB primary key for content. Example: CONTENT("content202") => "CONTENT_content202" */
  CONTENT: (id: string) => `CONTENT_${id}`,
  /** Generates DynamoDB sort key for a content translation. Example: CONTENT_TRANSLATION("content202", "en") => "CONTENT_content202_TRANSLATION_en" */
  CONTENT_TRANSLATION: (contentId: string, languageCode: LanguageCode) =>
    `CONTENT_${contentId}_TRANSLATION_${languageCode}`,
  /** Generates DynamoDB primary key for content details. Example: CONTENT_DETAILS("details303") => "CONTENT_DETAILS_details303" */
  CONTENT_DETAILS: (id: string) => `CONTENT_DETAILS_${id}`,
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
