export type CourseContentVariants = "text" | "video" | "audio" | "interactive";

export interface CourseContent {
  id: string;
  courseId: string;
  contentVaraints?: CourseContentVariants[];
  userId: string;
  chapterId?: string;
  title: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: string | any;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateCourseContentParams {
  courseId: string;
  title: string;
  contentVaraints?: CourseContentVariants[];
  description?: string;
  content?: string;
  chapterId?: string;
  order?: number;
}

export interface BulkCreateCourseContentsParams {
  courseId: string;
  contents: CreateCourseContentParams[];
}

export interface UpdateCourseContentParams {
  title?: string;
  description?: string;
  content?: string;
  order?: number;
  contentVaraints?: CourseContentVariants[];
  chapterId?: string;
}
