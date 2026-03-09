"use client";

import { ContentTab } from "@/app/studio/[courseId]/components/content-tab";
import { CourseBackLink } from "@/components/course/course-back-link";
import { CourseContainer } from "@/components/course/course-container";
import { CourseGeneralInfo } from "@/components/course/course-general-info";
import { CourseHeader } from "@/components/course/course-header";
import { LoadingCourse } from "@/components/course/loading-course";
import { LoadingCourseFailed } from "@/components/course/loading-course-failed";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import { useGetExamBanksQuery } from "@/modules/exam-bank/use-get-exam-bank-query";
import { useGetEnrollmentQuery } from "@/modules/enrollment/use-get-enrollment-query";
import { useCreateEnrollmentMutation } from "@/modules/enrollment/use-create-enrollment-mutation";
import { useDeleteMockExamMutation } from "@/modules/user-mock-exams/use-delete-mock-exam-mutation";
import { useGetMockExamsQuery } from "@/modules/user-mock-exams/use-get-mock-exams-query";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Clock,
  Play,
  Trash2,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

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
  const { data: enrollment } = useGetEnrollmentQuery(courseId);
  const { mutateAsync: createEnrollment } = useCreateEnrollmentMutation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const deleteMockExamMutation = useDeleteMockExamMutation();
  const [filter, setFilter] = useState<"all" | "in_progress" | "completed">(
    "all",
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

  const handleEnroll = async () => {
    try {
      await createEnrollment({ courseId });
      await queryClient.invalidateQueries({
        queryKey: ["enrollment", courseId],
      });
    } catch (error) {
      console.error("Failed to enroll:", error);
    }
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
          {enrollment
            ? "Start practicing by launching your first mock exam."
            : "Enroll in this course to start practicing."}
        </p>
        {enrollment ? (
          <button
            onClick={() => router.push(`/courses/${courseId}/exam-launcher`)}
            className="px-6 py-2 bg-foreground text-background rounded-xl font-medium text-base hover:bg-foreground/90 transition-colors flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Launch Exam
          </button>
        ) : (
          <button
            onClick={handleEnroll}
            className="px-6 py-2 bg-foreground text-background rounded-xl font-medium text-base hover:bg-foreground/90 transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Enroll
          </button>
        )}
      </div>
    );
  }

  const filteredExams =
    filter === "all"
      ? mockExams
      : mockExams.filter((exam) => exam.status === filter);

  const inProgressExams = filteredExams.filter(
    (exam) => exam.status === "in_progress",
  );
  const completedExams = filteredExams.filter(
    (exam) => exam.status === "completed",
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
                      course?.domains || [],
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
                          correctAnswers.includes(ans),
                        )
                      ) {
                        correct++;
                      }
                    } else if (question.type === "TRUE_FALSE") {
                      if (answer.answer === question.correctOptionIndex) {
                        correct++;
                      }
                    }
                  },
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
            mockExams?.find((e) => e.id === examToDelete),
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
          (timeRemainingInMilliseconds / totalTimeInMilliSeconds) * 100,
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
  const { data: enrollment } = useGetEnrollmentQuery(params.courseId);
  const { data: mockExams } = useGetMockExamsQuery(params.courseId);
  const createEnrollmentMutation = useCreateEnrollmentMutation();

  const handleLaunchExam = () => {
    router.push(`/courses/${params.courseId}/exam-launcher`);
  };

  const handleEnroll = async () => {
    try {
      await createEnrollmentMutation.mutateAsync({ courseId: params.courseId });
      await queryClient.invalidateQueries({
        queryKey: ["enrollment", params.courseId],
      });
    } catch (error) {
      console.error("Failed to enroll:", error);
    }
  };

  const inProgressExam = mockExams?.find(
    (exam) => exam.status === "in_progress",
  );

  const handleResumeExam = () => {
    if (inProgressExam) {
      router.push(`/courses/${params.courseId}/mock-exam/${inProgressExam.id}`);
    }
  };

  if (isLoading) {
    return <LoadingCourse />;
  }

  if (error || !course) {
    return <LoadingCourseFailed />;
  }

  return (
    <CourseContainer>
      <CourseBackLink href="/courses" title={"Back to Courses"} />

      <CourseHeader course={course}>
        {course.exam && (
          <>
            {enrollment ? (
              <button
                onClick={handleLaunchExam}
                className="w-full sm:w-auto px-8 py-2 bg-foreground text-background rounded-xl font-medium text-lg hover:bg-foreground/90 transition-colors flex items-center justify-center gap-3"
              >
                <Play className="w-5 h-5" />
                Launch Exam
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={createEnrollmentMutation.isPending}
                className="w-full sm:w-auto px-8 py-2 bg-foreground text-background rounded-xl font-medium text-lg hover:bg-foreground/90 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-5 h-5" />
                {createEnrollmentMutation.isPending ? "Enrolling..." : "Enroll"}
              </button>
            )}
          </>
        )}
      </CourseHeader>

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
        {["General Info", "Content", "My Mock Exams"].map((tab) => (
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
      {activeTab === "General Info" && <CourseGeneralInfo course={course} />}

      {activeTab === "Content" && (
        <div className="mt-12">
          <ContentTab
            courseId={course.id}
            chapters={
              course.domains?.flatMap((d) =>
                d.chapters.map((c) => ({ ...c })),
              ) || []
            }
          />
        </div>
      )}

      {activeTab === "My Mock Exams" && (
        <div className="mt-12">
          <MyMockExamsTab courseId={course.id} course={course} />
        </div>
      )}
    </CourseContainer>
  );
}
