export interface Course {
  id: string;
  userId: string;
  title: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateCourseParams {
  title: string;
  description?: string;
}

export interface UpdateCourseParams {
  title?: string;
  description?: string;
}
