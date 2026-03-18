export interface SkldMetadata {
  timespent: number;
  [key: string]: string | number | boolean;
}

export interface UserContentStat {
  id: string;
  userId: string;
  enrollmentId: string;
  variant: "content" | "question";
  sk: string;
  contentId: string;
  metadata: {
    timespent: number;
    totalTimeSpent: number;
    timesRead: number;
    lastReviewedAt: number;
    createdAt: number;
    updatedAt: number;
  };
}

export interface ContentRecommendation {
  contentId: string;
  title?: string;
  description?: string;
  chapterId?: string;
  timesRead: number;
  totalTimeSpent: number;
  contentLastReviewed: number;
  contentPerformance: number;
  isRecommended: boolean;
}

export interface SkldRequest {
  contentId: string;
  courseId: string;
  metadata: SkldMetadata;
}

export interface SkldResponse {
  userContentStat: UserContentStat;
  recommendations: ContentRecommendation[];
}
