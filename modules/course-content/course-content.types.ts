export type CourseContentType =
  | "text"
  | "video"
  | "document"
  | "quiz"
  | "assignment";

export interface CourseContent {
  id: string;
  courseId: string;
  userId: string;
  title: string;
  description?: string;
  content?: string;
  contentType?: CourseContentType;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateCourseContentParams {
  courseId: string;
  title: string;
  description?: string;
  content?: string;
  contentType?: CourseContentType;
  order?: number;
}

export interface UpdateCourseContentParams {
  title?: string;
  description?: string;
  content?: string;
  contentType?: CourseContentType;
  order?: number;
}
