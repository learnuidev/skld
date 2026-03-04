"use client";

import Link from "next/link";
import { useGetCoursesQuery } from "@/modules/course/use-get-courses-query";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <Link href={`/studio/${course.id}`} key={course.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group bg-white dark:bg-[rgb(10,11,12)] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-slate-600 dark:text-slate-400"
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
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon-sm">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </Button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 line-clamp-1">
                {course.title}
              </h3>

              {course.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                  {course.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  {course.domains && course.domains.length > 0 && (
                    <>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {course.domains.length} domain
                        {course.domains.length > 1 ? "s" : ""}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">
                        •
                      </span>
                    </>
                  )}
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <svg
                  className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
