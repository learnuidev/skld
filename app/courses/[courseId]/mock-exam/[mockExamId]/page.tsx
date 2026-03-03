"use client";

import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import type { Question } from "@/modules/exam-bank/exam-bank.types";
import {
  useGetExamBankQuery,
  useGetExamBanksQuery,
} from "@/modules/exam-bank/use-get-exam-bank-query";
import { useGetMockExamQuery } from "@/modules/user-mock-exams/use-get-mock-exam-query";
import { useUpdateMockExamMutation } from "@/modules/user-mock-exams/use-update-mock-exam-mutation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { MockExamCompleted } from "../components/mock-exam-completed";
import { MockExam } from "@/modules/user-mock-exams/user-mock-exams.types";
import { Course } from "@/modules/course/course.types";

function MockExamPageInner({
  mockExam,
  course,
}: {
  mockExam: MockExam;
  course: Course;
}) {
  const params = useParams<{ courseId: string; mockExamId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [selectedMultipleAnswers, setSelectedMultipleAnswers] = useState<
    Set<number>
  >(new Set());
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [initialTimeRemaining, setInitialTimeRemaining] = useState<
    number | null
  >(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  const updateMockExamMutation = useUpdateMockExamMutation(params.mockExamId);

  const allowSkip = course?.exam?.allowSkipQuestions ?? false;
  const isTimed = mockExam?.examType === "timed";

  const allQuestionsRef = useRef<Question[] | null>(null);

  const { data: examBank } = useGetExamBankQuery(
    mockExam?.courseId || "",
    mockExam?.examBankIds?.[0] || ""
  );

  const allQuestions: Question[] = useMemo(() => {
    if (!examBank?.questions) {
      return [];
    }

    return examBank?.questions?.filter((question) => {
      return mockExam?.selectedDomains?.includes(question?.domainId);
    });
  }, [examBank, mockExam?.selectedDomains]);

  const currentIndex = mockExam?.currentQuestionIndex ?? 0;

  const totalQuestions = allQuestions?.length || 0;

  const totalTimeInMilliSeconds = course?.exam?.totalTimeMinutes
    ? course.exam.totalTimeMinutes * 60 * 1000
    : null;

  const elapsedTimeInMilliSeconds = Date.now() - (mockExam?.createdAt || 0);

  const timeRemainingInMilliseconds =
    totalTimeInMilliSeconds !== null
      ? Math.max(totalTimeInMilliSeconds - elapsedTimeInMilliSeconds, 0)
      : null;
  const timeRemaining =
    totalTimeInMilliSeconds !== null
      ? Math.max(totalTimeInMilliSeconds - elapsedTimeInMilliSeconds, 0) / 1000
      : null;

  useEffect(() => {
    if (isTimed && mockExam?.timeRemaining !== undefined) {
      setInitialTimeRemaining(mockExam.timeRemaining);
      setRemainingTime(timeRemaining);
      setTotalTimeSpent(mockExam.timeSpent || 0);
    } else {
      setInitialTimeRemaining(null);
      setRemainingTime(null);
      setTotalTimeSpent(mockExam?.timeSpent || 0);
    }
  }, [mockExam?.timeRemaining, mockExam?.timeSpent, isTimed]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
      if (initialTimeRemaining !== null) {
        setRemainingTime((prev) => {
          if (prev === null) return null;
          const newRemaining = prev - 1;
          return newRemaining > 0 ? newRemaining : 0;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [initialTimeRemaining]);

  const answeredQuestions = allQuestions?.filter(
    (question) => !mockExam?.answers?.[question?.id]
  );

  const currentQuestion = allQuestions[currentIndex];
  const currentQuestionNumber = currentIndex + 1;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs.toFixed(0)}`;
  };

  if (!currentQuestion || totalQuestions === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-destructive">No questions available</div>
      </div>
    );
  }

  const handleAnswerChange = (answerIndex: number) => {
    if (currentQuestion?.type === "SINGLE_SELECT_MULTIPLE_CHOICE") {
      setSelectedAnswer(answerIndex);
    } else if (currentQuestion?.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
      const newSelected = new Set(selectedMultipleAnswers);
      if (newSelected.has(answerIndex)) {
        newSelected.delete(answerIndex);
      } else {
        newSelected.add(answerIndex);
      }
      setSelectedMultipleAnswers(newSelected);
    } else if (currentQuestion?.type === "TRUE_FALSE") {
      setTrueFalseAnswer(answerIndex === 0);
    }
  };

  const handleNext = async () => {
    const newAnswers = { ...mockExam.answers };
    const questionId = currentQuestion.id || "";

    if (currentQuestion?.type === "SINGLE_SELECT_MULTIPLE_CHOICE") {
      newAnswers[questionId] = {
        questionId,
        answer: selectedAnswer,
        timeSpent: elapsedTime,
        answeredAt: Date.now(),
      };
    } else if (currentQuestion?.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
      newAnswers[questionId] = {
        questionId,
        answers: Array.from(selectedMultipleAnswers),
        timeSpent: elapsedTime,
        answeredAt: Date.now(),
      };
    } else if (currentQuestion?.type === "TRUE_FALSE") {
      newAnswers[questionId] = {
        questionId,
        answer: trueFalseAnswer,
        timeSpent: elapsedTime,
        answeredAt: Date.now(),
      };
    }

    const newTotalTimeSpent = totalTimeSpent + elapsedTime;
    const newTimeRemaining =
      isTimed && remainingTime !== null ? remainingTime : undefined;

    await updateMockExamMutation.mutateAsync({
      currentQuestionIndex: currentIndex + 1,
      answers: newAnswers,
      timeSpent: newTotalTimeSpent,
      timeRemaining: newTimeRemaining,
    });

    await queryClient.invalidateQueries({
      queryKey: ["mockExam", params.mockExamId],
    });

    setTotalTimeSpent(newTotalTimeSpent);
    setSelectedAnswer(null);
    setSelectedMultipleAnswers(new Set());
    setTrueFalseAnswer(null);
    setElapsedTime(0);
  };

  const handleSkip = async () => {
    if (!allowSkip) return;

    const newTotalTimeSpent = totalTimeSpent + elapsedTime;
    const newTimeRemaining =
      isTimed && remainingTime !== null ? remainingTime : undefined;

    await updateMockExamMutation.mutateAsync({
      currentQuestionIndex: currentIndex + 1,
      timeSpent: newTotalTimeSpent,
      timeRemaining: newTimeRemaining,
    });

    await queryClient.invalidateQueries({
      queryKey: ["mockExam", params.mockExamId],
    });

    setTotalTimeSpent(newTotalTimeSpent);
    setSelectedAnswer(null);
    setSelectedMultipleAnswers(new Set());
    setTrueFalseAnswer(null);
    setElapsedTime(0);
  };

  const handlePrevious = () => {
    setSelectedAnswer(null);
    setSelectedMultipleAnswers(new Set());
    setTrueFalseAnswer(null);
    setElapsedTime(0);
  };

  const handleSubmit = async () => {
    const newAnswers = { ...mockExam.answers };
    const questionId = currentQuestion.id;

    if (currentQuestion?.type === "SINGLE_SELECT_MULTIPLE_CHOICE") {
      newAnswers[questionId] = {
        questionId,
        answer: selectedAnswer,
        timeSpent: elapsedTime,
        answeredAt: Date.now(),
      };
    } else if (currentQuestion?.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
      newAnswers[questionId] = {
        questionId,
        answers: Array.from(selectedMultipleAnswers),
        timeSpent: elapsedTime,
        answeredAt: Date.now(),
      };
    } else if (currentQuestion?.type === "TRUE_FALSE") {
      newAnswers[questionId] = {
        questionId,
        answer: trueFalseAnswer,
        timeSpent: elapsedTime,
        answeredAt: Date.now(),
      };
    }

    const newTotalTimeSpent = totalTimeSpent + elapsedTime;

    await updateMockExamMutation
      .mutateAsync({
        answers: newAnswers,
        timeSpent: newTotalTimeSpent,
        status: "completed",
      })
      .then(() => {
        queryClient.refetchQueries({ queryKey: ["mockExam", mockExam.id] });
      });

    router.push(`/courses/${params.courseId}`);
  };

  const canGoNext = () => {
    if (currentQuestion?.type === "SINGLE_SELECT_MULTIPLE_CHOICE") {
      return selectedAnswer !== null;
    } else if (currentQuestion?.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
      return selectedMultipleAnswers.size > 0;
    } else if (currentQuestion?.type === "TRUE_FALSE") {
      return trueFalseAnswer !== null;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-3xl mx-auto">
      <div className="mx-auto w-full py-12 flex-1">
        <header className="mb-12">
          <div className="flex items-baseline gap-4 justify-between mb-4">
            <Link
              href={`/courses/${params.courseId}`}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Link>

            <span className="text-muted-foreground text-lg">
              {currentQuestionNumber}{" "}
              <span className="text-sm">/ {totalQuestions}</span>
            </span>

            {isTimed && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="font-medium w-8">
                  {formatTime(remainingTime || 0)}
                </span>
              </div>
            )}
          </div>
        </header>

        <div className="mb-20">
          <div className="h-px w-full bg-border" />
          <div
            className="h-px bg-foreground transition-all duration-300"
            style={{
              width: `${(currentQuestionNumber / totalQuestions) * 100}%`,
            }}
          />
        </div>

        <div className="mb-16">
          <p className="text-xl text-foreground leading-relaxed mb-16">
            {currentQuestion.question}
          </p>

          <div className="space-y-4">
            {currentQuestion.options.map((option: string, index: number) => {
              const isSelected =
                currentQuestion.type === "SINGLE_SELECT_MULTIPLE_CHOICE"
                  ? selectedAnswer === index
                  : currentQuestion.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE"
                    ? selectedMultipleAnswers.has(index)
                    : currentQuestion.type === "TRUE_FALSE"
                      ? (index === 0 && trueFalseAnswer === true) ||
                        (index === 1 && trueFalseAnswer === false)
                      : false;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerChange(index)}
                  className={`w-full text-left p-6 rounded-lg border-2 transition-all text-base ${
                    isSelected
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground/20"
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-6 h-6 rounded bg-secondary/50 text-xs font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between mt-12">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-6 py-3 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-3">
            {allowSkip && (
              <button
                onClick={handleSkip}
                disabled={updateMockExamMutation.isPending}
                className="flex items-center gap-2 px-6 py-3 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Skip
              </button>
            )}

            {currentQuestionNumber === totalQuestions ? (
              <button
                onClick={handleSubmit}
                disabled={!canGoNext() || updateMockExamMutation.isPending}
                className="flex items-center gap-2 px-8 py-3 bg-foreground text-background rounded-lg font-medium text-sm hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Check className="w-4 h-4" />
                Submit
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canGoNext() || updateMockExamMutation.isPending}
                className="flex items-center gap-2 px-8 py-3 bg-foreground text-background rounded-lg font-medium text-sm hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MockExamPage() {
  const params = useParams<{ courseId: string; mockExamId: string }>();
  const { data: course } = useGetCourseQuery(params.courseId);
  const { data: mockExam, isLoading: mockExamLoading } = useGetMockExamQuery(
    params.mockExamId
  );

  const { data: examBank, isLoading: isExamBankLoading } = useGetExamBankQuery(
    mockExam?.courseId || "",
    mockExam?.examBankIds?.[0] || ""
  );

  const isLoading = mockExamLoading || isExamBankLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!mockExam || !course || !examBank) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-destructive">Exam not found</div>
      </div>
    );
  }

  if (mockExam.status !== "in_progress") {
    if (mockExam.status === "completed" && examBank) {
      return <MockExamCompleted mockExam={mockExam} examBank={examBank} />;
    }

    return (
      <div className="min-h-screen flex justify-center bg-background lg:mt-32">
        <div className="text-muted-foreground">
          This exam has been abondoned
        </div>
      </div>
    );
  }

  return <MockExamPageInner mockExam={mockExam} course={course} />;
}
