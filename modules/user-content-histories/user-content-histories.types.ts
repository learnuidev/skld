export type UserContentHistory = {
  sk: string;
  userId: string;
  enrollmentId: string;
  contentId: string;
  metadata: {
    timespent: number;
    totalTimeSpent: number;
    timesRead: number;
    lastReviewedAt: number;
    createdAt: number;
    updatedAt: number;
  };
};

export type UserContentHistoriesResponse = {
  userContentHistories: UserContentHistory[];
};
