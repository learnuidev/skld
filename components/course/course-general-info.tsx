"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Course } from "@/modules/course/course.types";
import { QUESTION_TYPES } from "@/modules/exam-bank/exam-bank.types";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

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
            <span className="text-sm font-medium text-foreground capitalize">
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
          <Button
            variant="secondary"
            size="sm"
            className="h-6 rounded-full text-xs font-normal text-muted-foreground pointer-events-none"
          >
            {course.exam?.allowSkipQuestions ? "Enabled" : "Disabled"}
          </Button>
        </div>
      </div>

      {course.exam?.questionTypes && course.exam.questionTypes.length > 0 && (
        <>
          <div className="h-px bg-border" />
          <div className="flex flex-col gap-3">
            <span className="text-xs text-muted-foreground">
              Question Types
            </span>
            <div className="flex flex-wrap gap-2">
              {course.exam.questionTypes.map((questionType: any) => {
                const questionTypeConfig = QUESTION_TYPES.find(
                  (qt) => qt.type === questionType,
                );
                return questionTypeConfig ? (
                  <span
                    key={questionType}
                    className="inline-flex rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
                  >
                    {questionTypeConfig.title}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </>
      )}

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

export const CourseGeneralInfo = ({ course }: { course: Course }) => {
  return (
    <div className="mt-12 flex flex-col gap-16">
      <div className="grid gap-16 lg:grid-cols-2">
        <CourseDetails course={course} />
        <ExamInfo course={course} />
      </div>

      <div className="h-px bg-border" />

      <DomainsList course={course} />
    </div>
  );
};
