"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export function CourseHeader({
  course,
  children,
}: {
  course: any;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const DESCRIPTION_LIMIT = 160;

  const truncated =
    course.description && course.description.length > DESCRIPTION_LIMIT
      ? course.description.slice(0, DESCRIPTION_LIMIT) + "..."
      : course.description;

  return (
    <header className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
            Certification Course
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground text-balance lg:text-4xl">
            {course.title}
          </h1>
        </div>
        {children}
      </div>

      {course.description && (
        <div className="max-w-2xl my-4">
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            {expanded ? course.description : truncated}
          </p>
          {course.description.length > DESCRIPTION_LIMIT && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
            >
              {expanded ? "Show less" : "Read more"}
              {expanded ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
