"use client";

import { useGetEnrollmentsQuery } from "@/modules/enrollment/use-get-enrollment-query";
import { useGetCoursesQuery } from "@/modules/course/use-get-courses-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Calendar, Clock, GraduationCap, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useDeleteEnrollmentMutation } from "@/modules/enrollment/use-delete-enrollment-mutation";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: enrollments, isLoading, error } = useGetEnrollmentsQuery();
  const { data: allCourses } = useGetCoursesQuery();
  const deleteEnrollmentMutation = useDeleteEnrollmentMutation();
  const router = useRouter();

  const handleDeleteEnrollment = async (courseId: string) => {
    if (window.confirm("Are you sure you want to unenroll from this course?")) {
      await deleteEnrollmentMutation.mutateAsync(courseId);
    }
  };

  const handleNavigateToCourses = () => {
    router.push("/courses");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading your enrollments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-destructive">Error loading enrollments</div>
      </div>
    );
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">No Enrollments Yet</CardTitle>
            <CardDescription className="text-base">
              You haven&apos;t enrolled in any courses yet. Start your learning
              journey by browsing and enrolling in a course.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleNavigateToCourses} size="lg">
              <BookOpen className="w-5 h-5 mr-2" />
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const enrolledCourses = enrollments
    .map((enrollment) => {
      const course = allCourses?.find((c) => c.id === enrollment.courseId);
      return { ...enrollment, course };
    })
    .filter((e) => e.course);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">My Enrollments</h1>
        <p className="text-muted-foreground">
          Manage your enrolled courses and track your progress
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {enrolledCourses.map((enrollment) => (
          <Card key={enrollment.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">
                    {enrollment.course?.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {enrollment.course?.description}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteEnrollment(enrollment.courseId)}
                  className="text-muted-foreground hover:text-destructive"
                  disabled={deleteEnrollmentMutation.isPending}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div className="space-y-3 mb-4">
                {enrollment.course?.courseType && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    <span className="capitalize">
                      {enrollment.course.courseType}
                    </span>
                  </div>
                )}
                {enrollment.course?.domains &&
                  enrollment.course.domains.length > 0 && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <BookOpen className="w-4 h-4 mr-2" />
                      <span>{enrollment.course.domains.length} domains</span>
                    </div>
                  )}
                {enrollment.course?.exam && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>
                      {enrollment.course.exam.totalQuestions} questions
                    </span>
                    {enrollment.course.exam.totalTimeMinutes && (
                      <span className="ml-2">
                        • {enrollment.course.exam.totalTimeMinutes} mins
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center text-sm text-muted-foreground border-t pt-4">
                <Calendar className="w-4 h-4 mr-2" />
                <span>
                  Enrolled{" "}
                  {formatDistanceToNow(new Date(enrollment.enrolledAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
