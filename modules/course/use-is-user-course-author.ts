import { useGetProfileQuery } from "../user/use-get-profile-query";
import { useGetCourseQuery } from "./use-get-course-query";

export const useIsUserCourseAuthor = (courseId: string) => {
  const { data: course } = useGetCourseQuery(courseId);

  const { data: user } = useGetProfileQuery();

  const currentUserId = user?.id;

  const isAuthor = currentUserId === course?.userId;

  return isAuthor;
};
