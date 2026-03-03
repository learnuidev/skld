"use client";

import { useState } from "react";
import { useGetEnrollmentsQuery } from "@/modules/enrollment/use-get-enrollment-query";
import { useGetCoursesQuery } from "@/modules/course/use-get-courses-query";
import { useCreateEnrollmentMutation } from "@/modules/enrollment/use-create-enrollment-mutation";
import { useDeleteEnrollmentMutation } from "@/modules/enrollment/use-delete-enrollment-mutation";
import {
  Search,
  X,
  Clock,
  GraduationCap,
  BookOpen,
  Check,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: enrollments, isLoading, error } = useGetEnrollmentsQuery();
  const { data: allCourses } = useGetCoursesQuery();
  const createEnrollmentMutation = useCreateEnrollmentMutation();
  const deleteEnrollmentMutation = useDeleteEnrollmentMutation();

  const enrolledCourseIds = enrollments?.map((e) => e.courseId) || [];
  const availableCourses =
    allCourses?.filter((c) => !enrolledCourseIds.includes(c.id)) || [];

  const filteredCourses = availableCourses.filter((course) => {
    const query = searchQuery.toLowerCase();
    return (
      course.title.toLowerCase().includes(query) ||
      course.description?.toLowerCase().includes(query)
    );
  });

  const handleEnroll = async (courseId: string) => {
    await createEnrollmentMutation.mutateAsync({ courseId });
  };

  const handleUnenroll = async (courseId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to unenroll from this course?")) {
      await deleteEnrollmentMutation.mutateAsync(courseId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-destructive">Error loading courses</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pb-16 lg:pb-24 pt-12 max-w-3xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-semibold tracking-tight mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            {enrollments && enrollments.length > 0
              ? `You have ${enrollments.length} enrollment${enrollments.length === 1 ? "" : "s"}`
              : "Start your learning journey"}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-secondary/50 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent transition-all placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Enrolled Courses */}
        {enrollments && enrollments.length > 0 && (
          <div className="mb-16">
            <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-6">
              My Enrollments
            </h2>
            <div className="space-y-4">
              {enrollments.map((enrollment) => {
                const course = allCourses?.find(
                  (c) => c.id === enrollment.courseId
                );
                if (!course) return null;

                return (
                  <Link
                    key={enrollment.id}
                    href={`/courses/${enrollment.courseId}`}
                    className="group flex items-start gap-6 p-6 rounded-xl border border-border hover:border-foreground/20 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-foreground mb-1">
                        {course.title}
                      </h3>
                      {course.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {course.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {course.courseType && (
                          <span className="flex items-center gap-1.5">
                            <GraduationCap className="w-4 h-4" />
                            <span className="capitalize">
                              {course.courseType}
                            </span>
                          </span>
                        )}
                        {course.domains && course.domains.length > 0 && (
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4" />
                            <span>{course.domains.length} domains</span>
                          </span>
                        )}
                        {course.exam && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>{course.exam.totalQuestions} questions</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs">
                            Enrolled{" "}
                            {formatDistanceToNow(
                              new Date(enrollment.enrolledAt),
                              {
                                addSuffix: true,
                              }
                            )}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleUnenroll(enrollment.courseId, e)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-colors"
                        disabled={deleteEnrollmentMutation.isPending}
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Courses */}
        {filteredCourses.length > 0 && (
          <div>
            <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-6">
              Enroll in the following courses
            </h2>
            <div className="space-y-4">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="group flex items-start gap-6 p-6 rounded-xl border border-border hover:border-foreground/20 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-foreground mb-1">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {course.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {course.courseType && (
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4" />
                          <span className="capitalize">
                            {course.courseType}
                          </span>
                        </span>
                      )}
                      {course.domains && course.domains.length > 0 && (
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4" />
                          <span>{course.domains.length} domains</span>
                        </span>
                      )}
                      {course.exam && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{course.exam.totalQuestions} questions</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleEnroll(course.id)}
                    disabled={createEnrollmentMutation.isPending}
                    className="shrink-0 px-5 py-2.5 bg-foreground text-background rounded-lg font-medium text-sm hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {createEnrollmentMutation.isPending ? (
                      "Enrolling..."
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Enroll
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredCourses.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No courses found matching &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
