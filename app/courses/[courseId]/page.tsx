"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import { useGetMockExamsQuery } from "@/modules/user-mock-exams/use-get-mock-exams-query";
import { useGetExamBanksQuery } from "@/modules/exam-bank/use-get-exam-bank-query";
import { useDeleteMockExamMutation } from "@/modules/user-mock-exams/use-delete-mock-exam-mutation";
import { useParams, useRouter } from "next/navigation";
import {
  Play,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  Trash2,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
                    (d: any) => d.id === domainId
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
                }
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
                index === 0 && "border-t"
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
                    isOpen && "rotate-180"
                  )}
                />
              </button>

              <div
                className={cn(
                  "grid transition-all duration-200 ease-in-out",
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
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

function DeleteDialog({
  open,
  onOpenChange,
  mockExamTitle,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mockExamTitle: string;
  onConfirm: () => void;
  isPending: boolean;
}) {
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const handleConfirm = () => {
    if (deleteConfirm === "delete") {
      onConfirm();
      setDeleteConfirm("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle className="text-xl">Delete Mock Exam</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-4">
            This action cannot be undone. This will permanently delete mock exam
            &quot;{mockExamTitle}&quot; and all your answers.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4">
            <p className="text-sm font-medium text-destructive">
              Warning: All progress and answers will be permanently deleted
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Type <span className="font-bold">&quot;delete&quot;</span> to
              confirm
            </label>
            <Input
              placeholder="Enter 'delete'"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter className="gap-3 sm:gap-3">
          <button
            onClick={() => {
              onOpenChange(false);
              setDeleteConfirm("");
            }}
            disabled={isPending}
            className="px-4 py-2 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleteConfirm !== "delete" || isPending}
            className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MyMockExamsTab({
  courseId,
  course,
}: {
  courseId: string;
  course: any;
}) {
  const { data: mockExams, isLoading } = useGetMockExamsQuery(courseId);
  const { data: examBanks } = useGetExamBanksQuery(courseId);
  const router = useRouter();
  const queryClient = useQueryClient();
  const deleteMockExamMutation = useDeleteMockExamMutation();
  const [filter, setFilter] = useState<"all" | "in_progress" | "completed">(
    "all"
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<string | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDomainNames = (domainIds: string[]) => {
    if (!course.domains) return [];
    return domainIds
      .map((id) => course.domains.find((d: any) => d.id === id)?.name)
      .filter(Boolean);
  };

  const handleDeleteExam = async (examId: string) => {
    await deleteMockExamMutation.mutateAsync(examId);
    setDeleteDialogOpen(false);
    setExamToDelete(null);
    await queryClient.invalidateQueries({
      queryKey: ["mockExams", courseId],
    });
  };

  const getExamTitle = (exam: any) => {
    return exam?.examType === "timed" ? "Timed Exam" : "Untimed Exam";
  };

  const getExamQuestions = (exam: any, examBanks: any[], domains: any[]) => {
    if (!domains) return [];

    const allQuestions: any[] = [];
    domains.forEach((domain: any) => {
      examBanks.forEach((bank: any) => {
        bank.questions.forEach((q: any) => {
          if (q.domainId === domain.id) {
            allQuestions.push(q);
          }
        });
      });
    });

    return allQuestions;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">Loading mock exams...</div>
      </div>
    );
  }

  if (!mockExams || mockExams.length === 0) {
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
          No Mock Exams Yet
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Start practicing by launching your first mock exam.
        </p>
        <button
          onClick={() => router.push(`/courses/${courseId}/exam-launcher`)}
          className="px-6 py-2 bg-foreground text-background rounded-xl font-medium text-base hover:bg-foreground/90 transition-colors flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Launch Exam
        </button>
      </div>
    );
  }

  const filteredExams =
    filter === "all"
      ? mockExams
      : mockExams.filter((exam) => exam.status === filter);

  const inProgressExams = filteredExams.filter(
    (exam) => exam.status === "in_progress"
  );
  const completedExams = filteredExams.filter(
    (exam) => exam.status === "completed"
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Filter */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-foreground">Filter:</span>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filter === "all"}
              onChange={() => setFilter("all")}
              className="w-4 h-4 rounded border-border"
            />
            <span className="text-sm text-muted-foreground">All</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filter === "in_progress"}
              onChange={() => setFilter("in_progress")}
              className="w-4 h-4 rounded border-border"
            />
            <span className="text-sm text-muted-foreground">In Progress</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filter === "completed"}
              onChange={() => setFilter("completed")}
              className="w-4 h-4 rounded border-border"
            />
            <span className="text-sm text-muted-foreground">Completed</span>
          </label>
        </div>
      </div>

      {inProgressExams.length > 0 && (
        <div>
          <h3 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-6">
            In Progress ({inProgressExams.length})
          </h3>
          <div className="space-y-3">
            {inProgressExams.map((exam) => {
              const domainNames = getDomainNames(exam.selectedDomains);
              return (
                <div
                  key={exam.id}
                  className="p-6 rounded-lg border border-border hover:border-foreground/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <Link
                      href={`/courses/${courseId}/mock-exam/${exam.id}`}
                      className="flex-1"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-amber-600" />
                        </div>
                        <h4 className="text-base font-semibold text-foreground">
                          {exam.examType === "timed"
                            ? "Timed Exam"
                            : "Untimed Exam"}
                        </h4>
                      </div>
                      {domainNames.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {domainNames.map((name) => (
                            <span
                              key={name}
                              className="inline-flex rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Started {formatDate(exam.createdAt)}</span>
                        {exam.timeRemaining !== null && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(exam.timeRemaining)} remaining
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-sm font-medium text-foreground mb-1">
                        Question {exam.currentQuestionIndex + 1}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Object.keys(exam.answers).length} answered
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setExamToDelete(exam.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {completedExams.length > 0 && (
        <div>
          <h3 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-6">
            Completed ({completedExams.length})
          </h3>
          <div className="space-y-3">
            {completedExams.map((exam) => {
              const domainNames = getDomainNames(exam.selectedDomains);
              const questionsAnswered = Object.keys(exam.answers || {}).length;

              const calculateAccuracy = () => {
                let correct = 0;
                let total = 0;

                Object.entries(exam.answers || {}).forEach(
                  ([questionIndex, answer]: [string, any]) => {
                    if (!answer) return;

                    const allQuestions = getExamQuestions(
                      exam,
                      examBanks || [],
                      course?.domains || []
                    );
                    const question = allQuestions[parseInt(questionIndex) - 1];
                    if (!question) return;

                    total++;

                    if (question.type === "SINGLE_SELECT_MULTIPLE_CHOICE") {
                      if (answer.answer === question.correctOptionIndex) {
                        correct++;
                      }
                    } else if (
                      question.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE"
                    ) {
                      const userAnswers = answer.answers || [];
                      const correctAnswers =
                        question.correctOptionIndexes || [];
                      if (
                        userAnswers.length === correctAnswers.length &&
                        userAnswers.every((ans: number) =>
                          correctAnswers.includes(ans)
                        )
                      ) {
                        correct++;
                      }
                    } else if (question.type === "TRUE_FALSE") {
                      if (answer.answer === question.correctOptionIndex) {
                        correct++;
                      }
                    }
                  }
                );

                if (total === 0) return null;
                return Math.round((correct / total) * 100);
              };

              const accuracy = calculateAccuracy();

              return (
                <div
                  key={exam.id}
                  className="p-6 rounded-lg border border-border hover:border-foreground/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <Link
                      href={`/courses/${courseId}/mock-exam/${exam.id}`}
                      className="flex-1"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <h4 className="text-base font-semibold text-foreground">
                          {exam.examType === "timed"
                            ? "Timed Exam"
                            : "Untimed Exam"}
                        </h4>
                      </div>
                      {domainNames.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {domainNames.map((name) => (
                            <span
                              key={name}
                              className="inline-flex rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setExamToDelete(exam.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Completed {formatDate(exam.updatedAt)}</span>
                    {exam.timeSpent && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(exam.timeSpent)} total
                      </span>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-semibold tabular-nums text-foreground">
                            {questionsAnswered}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            questions answered
                          </div>
                        </div>
                        {accuracy !== null && (
                          <div className="text-center">
                            <div className="text-2xl font-semibold tabular-nums text-foreground">
                              {accuracy}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              accuracy
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filteredExams.length === 0 && filter !== "all" && (
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
            No Mock Exams Found
          </h3>
          <p className="text-sm text-muted-foreground">
            No {filter.replace("_", " ")} mock exams yet.
          </p>
        </div>
      )}

      {examToDelete && (
        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          mockExamTitle={getExamTitle(
            mockExams?.find((e) => e.id === examToDelete)
          )}
          onConfirm={() => {
            if (examToDelete) {
              handleDeleteExam(examToDelete);
            }
          }}
          isPending={deleteMockExamMutation.isPending}
        />
      )}
    </div>
  );
}

function InProgressExamBanner({
  exam,
  onClick,
  course,
}: {
  exam: any;
  onClick: () => void;
  course: any;
}) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const questionsCompleted = Object.keys(exam.answers || {}).length;
  const totalQuestions = exam.currentQuestionIndex + 1;

  const totalTimeInMilliSeconds = course?.exam?.totalTimeMinutes
    ? course.exam.totalTimeMinutes * 60 * 1000
    : null;

  const elapsedTimeInMilliSeconds = Date.now() - exam.createdAt;

  const timeRemainingInMilliseconds =
    totalTimeInMilliSeconds !== null
      ? Math.max(totalTimeInMilliSeconds - elapsedTimeInMilliSeconds, 0)
      : null;
  const timeRemaining =
    totalTimeInMilliSeconds !== null
      ? Math.max(totalTimeInMilliSeconds - elapsedTimeInMilliSeconds, 0) / 1000
      : null;

  const percentageRemaining =
    totalTimeInMilliSeconds !== null && timeRemainingInMilliseconds !== null
      ? Math.round(
          (timeRemainingInMilliseconds / totalTimeInMilliSeconds) * 100
        )
      : null;

  return (
    <button
      onClick={onClick}
      className="w-full my-4 px-6 py-4 bg-foreground/5 hover:bg-foreground/10 border border-foreground/20 rounded-xl transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-background" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-foreground">
              Exam in Progress
            </span>
            <span className="text-xs text-muted-foreground">
              Question {totalQuestions}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {questionsCompleted} completed
            </div>
            <div className="h-4 w-px bg-border" />
          </div>

          {timeRemaining !== null && (
            <>
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">
                  {formatTime(timeRemaining!)} remaining
                </div>
                <div className="h-4 w-px bg-border" />
              </div>

              <div className="text-sm text-muted-foreground">
                {percentageRemaining !== null
                  ? `(${percentageRemaining}%)`
                  : ""}
              </div>
            </>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </button>
  );
}

export default function CoursePage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("General Info");
  const queryClient = useQueryClient();

  const { data: course, isLoading, error } = useGetCourseQuery(params.courseId);
  const { data: mockExams } = useGetMockExamsQuery(params.courseId);

  const handleLaunchExam = () => {
    router.push(`/courses/${params.courseId}/exam-launcher`);
  };

  const inProgressExam = mockExams?.find(
    (exam) => exam.status === "in_progress"
  );

  const handleResumeExam = () => {
    if (inProgressExam) {
      router.push(`/courses/${params.courseId}/mock-exam/${inProgressExam.id}`);
    }
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

        {/* In Progress Exam Banner */}
        {inProgressExam && (
          <InProgressExamBanner
            exam={inProgressExam}
            onClick={handleResumeExam}
            course={course}
          />
        )}

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
                  : "text-muted-foreground hover:text-foreground"
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
            <MyMockExamsTab courseId={course.id} course={course} />
          </div>
        )}
      </div>
    </div>
  );
}
