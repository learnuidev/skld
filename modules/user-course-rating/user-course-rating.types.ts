export interface UserCourseRating {
  id: string;
  userId: string;
  courseId: string;
  rating: number;
  review?: string;
  createdAt: number;
}

export interface CreateUserCourseRatingParams {
  courseId: string;
  rating: number;
  review?: string;
}

export interface CourseRatingUpdate {
  averageRating: number;
  totalTimesRated: number;
}
