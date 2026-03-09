"use client";

import { CourseCard, CourseCardContainer } from "@/components/course-card";
import { Button } from "@/components/ui/button";
import { useGetCoursesQuery } from "@/modules/course/use-get-courses-query";
import Link from "next/link";

export function CreatorStudio() {
  const { data: courses, isLoading } = useGetCoursesQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-600 dark:text-slate-400">
          Loading your courses...
        </div>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-white dark:bg-[rgb(10,11,12)] rounded-2xl border border-slate-200 dark:border-slate-800 p-12">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
          No courses yet
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-center max-w-md mb-8">
          Start your creator journey by creating your first course. Share your
          knowledge with students worldwide.
        </p>
        <Link href="/courses/add">
          <Button size="lg" className="rounded-xl">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create Your First Course
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-muted-foreground mt-1">
            {courses.length} {courses.length === 1 ? "course" : "courses"}{" "}
            created
          </p>
        </div>
        <Link href="/courses/add">
          <Button size="lg" className="rounded-xl">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            New Course
          </Button>
        </Link>
      </div>

      <CourseCardContainer>
        {courses.map((course, index) => (
          <CourseCard
            course={course}
            href={`/studio/${course.id}`}
            key={course.id}
            index={index}
          />
        ))}
      </CourseCardContainer>
    </div>
  );
}
