export type UserContentHistory = {
  contentId: string;
  createdAt: number;
  enrollmentId: string;
  id: string;
  sk: string;
  totalTimeSpent: number;
  userId: string;
};

export type UserContentHistoriesResponse = {
  userContentHistories: UserContentHistory[];
};
