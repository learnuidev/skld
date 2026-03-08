"use client";

import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import { useGetCourseContentQuery } from "@/modules/course-content/use-get-course-content-query";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

export default function ContentPage() {
  const params = useParams<{ courseId: string; contentId: string }>();
  const { data: course, isLoading: courseLoading } = useGetCourseQuery(
    params.courseId,
  );
  const { data: content, isLoading: contentLoading } = useGetCourseContentQuery(
    params.courseId,
    params.contentId,
  );

  const isLoading = courseLoading || contentLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!content || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-destructive">Content not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-16 lg:py-24">
        <div className="mb-16">
          <Link
            href={`/courses/${params.courseId}`}
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Link>
        </div>

        <div className="space-y-16">
          <header className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-foreground/60" />
              </div>
              <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
                Course Content
              </p>
            </div>

            <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight text-foreground text-balance leading-[1.15]">
              {content.title}
            </h1>

            {content.description && (
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                {content.description}
              </p>
            )}
          </header>

          {content.content && (
            <div className="space-y-12">
              <div className="h-px bg-border/60" />

              <article className="prose prose-slate max-w-none">
                <div className="text-base leading-[1.75] text-foreground space-y-6">
                  {content.content.split("\n\n").map((paragraph, index) => (
                    <p
                      key={index}
                      className="text-[15px] lg:text-base leading-[1.8] text-muted-foreground"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
            </div>
          )}

          <div className="pt-12">
            <div className="h-px bg-border/60" />
          </div>

          <footer className="space-y-4">
            <p className="text-sm text-muted-foreground">{course.title}</p>
            <p className="text-xs text-muted-foreground/60">
              Last updated{" "}
              {new Date(content.updatedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
