export interface UserCourseRating {
  id: string;
  userId: string;
  courseId: string;
  rating: number;
  createdAt: number;
}

export interface CreateUserCourseRatingParams {
  courseId: string;
  rating: number;
}

export interface CourseRatingUpdate {
  averageRating: number;
  totalTimesRated: number;
}
