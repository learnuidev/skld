"use client";

import { useGetCourseContentQuery } from "@/modules/course-content/use-get-course-content-query";
import { BookOpen, ExternalLink } from "lucide-react";
import Link from "next/link";

interface LinkedContentProps {
  courseId: string;
  contentId: string;
}

export function LinkedContent({ courseId, contentId }: LinkedContentProps) {
  const { data: content, isLoading } = useGetCourseContentQuery(
    courseId,
    contentId,
  );

  if (isLoading || !content) {
    return null;
  }

  return (
    <div className="mt-4">
      <Link
        href={`/courses/${courseId}/contents/${contentId}`}
        className="group inline-flex items-center gap-2 px-4 py-3 bg-foreground/5 hover:bg-foreground/10 rounded-lg border border-border/50 transition-all duration-200"
      >
        <div className="w-8 h-8 rounded-lg bg-foreground/10 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-foreground/70" />
        </div>
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground/80">
            Related Content
          </span>
          <span className="text-sm font-medium text-foreground group-hover:text-foreground/90 transition-colors">
            {content.title}
          </span>
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-foreground/50 transition-colors" />
      </Link>
    </div>
  );
}
