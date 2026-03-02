export type CourseType = "basic" | "intermediate" | "advanced" | "professional";

export interface Course {
  id: string;
  userId: string;
  title: string;
  description?: string;
  courseType?: CourseType;
  hasCertification?: boolean;
  createdAt: number;
  updatedAt: number;
  domains?: Domain[];
  exam?: ExamInfo;
}

export interface CreateCourseParams {
  title: string;
  description?: string;
  courseType?: CourseType;
  hasCertification?: boolean;
  domains?: Domain[];
  exam?: ExamInfo;
}

export interface UpdateCourseParams {
  title?: string;
  description?: string;
  courseType?: CourseType;
  hasCertification?: boolean;
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
}

export interface CourseFormData {
  title: string;
  description: string;
  courseType: CourseType;
  hasCertification: boolean;
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
  };
}
