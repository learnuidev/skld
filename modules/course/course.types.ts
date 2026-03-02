export interface Course {
  id: string;
  userId: string;
  title: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  domains?: Domain[];
  exam?: ExamInfo;
}

export interface CreateCourseParams {
  title: string;
  description?: string;
  domains?: Domain[];
  exam?: ExamInfo;
}

export interface UpdateCourseParams {
  title?: string;
  description?: string;
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
  learningObjectives: string[];
}

export interface ExamInfo {
  totalQuestions: number;
  domainWeights: Record<string, number>;
  allowSkipQuestions: boolean;
}
