"use client";

import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import { useParams, useRouter } from "next/navigation";
import {
  Clock,
  GraduationCap,
  BookOpen,
  Play,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CoursePage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const DESCRIPTION_LIMIT = 200;

  const { data: course, isLoading, error } = useGetCourseQuery(params.courseId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-destructive">Course not found</div>
      </div>
    );
  }

  const truncated =
    course.description && course.description.length > DESCRIPTION_LIMIT
      ? course.description.slice(0, DESCRIPTION_LIMIT) + "..."
      : course.description;

  return (
    <div className="min-h-screen bg-background">
      <div className="pb-16 lg:pb-24 pt-12">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-4xl font-semibold tracking-tight">
              {course.title}
            </h1>

            {/* Launch Exam Button */}
            {course.exam && (
              <button
                onClick={() =>
                  router.push(`/courses/${course.id}/exam-launcher`)
                }
                className="w-full sm:w-auto px-8 py-2 bg-foreground text-background rounded-xl font-medium text-lg hover:bg-foreground/90 transition-colors flex items-center justify-center gap-3"
              >
                <Play className="w-6 h-6" />
                Launch Exam
              </button>
            )}
          </div>

          {course.description && (
            <div className="max-w-2xl">
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                {expanded ? course.description : truncated}
              </p>
              {course.description.length > DESCRIPTION_LIMIT && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="mt-2 text-sm text-foreground hover:text-muted-foreground transition-colors"
                >
                  {expanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          )}
        </header>

        {/* Course Details */}
        <div className="mb-12 space-y-8">
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            {course.courseType && (
              <span className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                <span className="capitalize">{course.courseType}</span>
              </span>
            )}
            {course.domains && course.domains.length > 0 && (
              <span className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>{course.domains.length} domains</span>
              </span>
            )}
            {course.exam && (
              <>
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{course.exam.totalQuestions} questions</span>
                </span>
                {course.exam.totalTimeMinutes && (
                  <span className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{course.exam.totalTimeMinutes} minutes</span>
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Domains */}
        {course.domains && course.domains.length > 0 && (
          <div className="mb-12">
            <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-6">
              Domains
            </h2>
            <div className="space-y-3 max-w-4xl">
              {course.domains.map((domain) => (
                <div
                  key={domain.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border"
                >
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-foreground mb-1">
                      {domain.name}
                    </h3>
                    {domain.chapters && domain.chapters.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="w-4 h-4" />
                        <span>{domain.chapters.length} chapters</span>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
