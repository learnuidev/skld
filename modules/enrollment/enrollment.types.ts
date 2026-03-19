import { UserContentStat } from "../skld/skld.types";

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: number;
}

export interface CreateEnrollmentParams {
  courseId: string;
}

export interface EnrollmentWithCourse extends Enrollment {
  course?: {
    id: string;
    title: string;
    description?: string;
    courseType?: string;
    hasCertification?: boolean;
  };
}

export interface EnrollmentStatsResponse {
  enrollmentStats: UserContentStat[];
}
