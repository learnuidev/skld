"use client";

import { useState } from "react";
import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import { useParams, useRouter } from "next/navigation";
import { Play, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function CourseHeader({
  course,
  onLaunchExam,
}: {
  course: any;
  onLaunchExam: () => void;
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
        {course.exam && (
          <button
            onClick={onLaunchExam}
            className="w-full sm:w-auto px-8 py-2 bg-foreground text-background rounded-xl font-medium text-lg hover:bg-foreground/90 transition-colors flex items-center justify-center gap-3"
          >
            <Play className="w-5 h-5" />
            Launch Exam
          </button>
        )}
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

function CourseDetails({ course }: { course: any }) {
  const details = [
    { label: "Course Type", value: course.courseType || "Not Specified" },
    {
      label: "Certification",
      value: course.hasCertification ? "Available" : "Not Available",
    },
    {
      label: "Created",
      value: new Date(course.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    },
    {
      label: "Last Updated",
      value: new Date(course.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    },
  ];

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
        Course Details
      </h2>
      <div className="grid grid-cols-2 gap-x-12 gap-y-6">
        {details.map((item) => (
          <div key={item.label} className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">{item.label}</span>
            <span className="text-sm font-medium text-foreground">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExamInfo({ course }: { course: any }) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
        Exam Info
      </h2>

      <div className="flex flex-col gap-6">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-muted-foreground">Total Questions</span>
          <span className="text-2xl font-semibold tabular-nums text-foreground">
            {course.exam?.totalQuestions || 0}
          </span>
        </div>

        {course.exam?.totalTimeMinutes && (
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">Time Limit</span>
            <span className="text-2xl font-semibold tabular-nums text-foreground">
              {course.exam.totalTimeMinutes}m
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Skip Questions</span>
          <div className="px-3 py-1.5 bg-secondary rounded-full text-xs font-medium text-secondary-foreground">
            {course.exam?.allowSkipQuestions ? "Enabled" : "Disabled"}
          </div>
        </div>
      </div>

      {course.exam?.domainWeights &&
        Object.keys(course.exam.domainWeights).length > 0 && (
          <>
            <div className="h-px bg-border" />
            <div className="flex flex-col gap-5">
              <span className="text-xs text-muted-foreground">
                Domain Weights
              </span>
              {Object.entries(course.exam.domainWeights).map(
                ([domainId, weight]) => {
                  const domain = course.domains?.find(
                    (d: any) => d.id === domainId,
                  );
                  return (
                    <div key={domainId} className="flex flex-col gap-2">
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="text-sm text-foreground leading-snug">
                          {domain?.name || domainId}
                        </span>
                        <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                          {Number(weight)}%
                        </span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-foreground transition-all duration-500"
                          style={{ width: `${Number(weight)}%` }}
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </>
        )}
    </section>
  );
}

function DomainsList({ course }: { course: any }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!course.domains || course.domains.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-baseline gap-3">
        <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
          Domains
        </h2>
        <span className="text-xs tabular-nums text-muted-foreground">
          {course.domains.length}
        </span>
      </div>

      <div className="flex flex-col">
        {course.domains.map((domain: any, index: number) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={domain.id}
              className={cn(
                "border-b border-border",
                index === 0 && "border-t",
              )}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-muted-foreground"
              >
                <span className="text-[15px] font-medium text-foreground leading-snug">
                  {domain.name}
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                />
              </button>

              <div
                className={cn(
                  "grid transition-all duration-200 ease-in-out",
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-wrap gap-2 pb-5">
                    {domain.chapters && domain.chapters.length > 0 ? (
                      domain.chapters.map((chapter: any) => (
                        <span
                          key={chapter.id}
                          className="inline-flex rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
                        >
                          {chapter.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No chapters yet
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MyMockExamsTab({ courseId }: { courseId: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        My Mock Exams
      </h3>
      <p className="text-sm text-muted-foreground">
        View your completed and in-progress mock exams here.
      </p>
      <div className="mt-4 px-4 py-2 bg-muted text-muted-foreground rounded-full text-sm font-medium">
        Coming soon
      </div>
    </div>
  );
}

export default function CoursePage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("General Info");

  const { data: course, isLoading, error } = useGetCourseQuery(params.courseId);

  const handleLaunchExam = () => {
    router.push(`/courses/${params.courseId}/exam-launcher`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl py-12 lg:py-20">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl py-12 lg:py-20">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-destructive">Course not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pb-40 lg:pb-40">
        <div className="mb-20">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <CourseHeader course={course} onLaunchExam={handleLaunchExam} />

        {/* Tabs */}
        <nav className="mt-10 flex gap-1 border-b border-border">
          {["General Info", "My Mock Exams"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative px-4 py-3 text-sm font-medium transition-colors",
                activeTab === tab
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute inset-x-0 -bottom-px h-px bg-foreground" />
              )}
            </button>
          ))}
        </nav>

        {/* Content */}
        {activeTab === "General Info" && (
          <div className="mt-12 flex flex-col gap-16">
            <div className="grid gap-16 lg:grid-cols-2">
              <CourseDetails course={course} />
              <ExamInfo course={course} />
            </div>

            <div className="h-px bg-border" />

            <DomainsList course={course} />
          </div>
        )}

        {activeTab === "My Mock Exams" && (
          <div className="mt-12">
            <MyMockExamsTab courseId={course.id} />
          </div>
        )}
      </div>
    </div>
  );
}
