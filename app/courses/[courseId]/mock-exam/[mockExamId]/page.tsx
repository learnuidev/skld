"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import { useGetMockExamQuery } from "@/modules/user-mock-exams/use-get-mock-exam-query";
import { useUpdateMockExamMutation } from "@/modules/user-mock-exams/use-update-mock-exam-mutation";
import {
  useGetExamBankQuery,
  useGetExamBanksQuery,
} from "@/modules/exam-bank/use-get-exam-bank-query";
import type { Question } from "@/modules/exam-bank/exam-bank.types";
import {
  Check,
  Clock,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  XCircle,
} from "lucide-react";
import * as React from "react";
import Link from "next/link";

export default function MockExamPage() {
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

  const { data: course } = useGetCourseQuery(params.courseId);
  const { data: mockExam, isLoading: mockExamLoading } = useGetMockExamQuery(
    params.mockExamId
  );
  const updateMockExamMutation = useUpdateMockExamMutation(params.mockExamId);
  const { data: examBanks } = useGetExamBanksQuery(params.courseId);

  const isLoading = mockExamLoading;

  const allowSkip = course?.exam?.allowSkipQuestions ?? false;
  const isTimed = mockExam?.examType === "timed";

  const allQuestionsRef = useRef<Question[] | null>(null);

  const allQuestions: Question[] = useMemo(() => {
    if (!examBanks || !mockExam) return [];

    let questions = examBanks.flatMap((bank) => bank.questions);

    if (mockExam.selectedDomains && mockExam.selectedDomains.length > 0) {
      questions = questions.filter((question) =>
        mockExam.selectedDomains.includes(question.domainId)
      );
    }

    if (!allQuestionsRef.current) {
      const shuffled = [...questions];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      allQuestionsRef.current = shuffled;
      return shuffled;
    }

    return allQuestionsRef.current;
  }, [examBanks, mockExam?.selectedDomains]);

  const currentIndex = mockExam?.currentQuestionIndex ?? 0;

  const { data: examBank } = useGetExamBankQuery(
    mockExam?.courseId || "",
    mockExam?.examBankIds?.[0] || ""
  );

  const questionsCompleted = Object.keys(mockExam?.answers || {}).length;

  const totalQuestions = examBank?.questions?.length || 0;

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

  const currentQuestion = answeredQuestions[currentIndex];
  const currentQuestionNumber = currentIndex + 1;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs.toFixed(0)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!mockExam || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-destructive">Exam not found</div>
      </div>
    );
  }

  if (mockExam.status !== "in_progress") {
    if (mockExam.status === "completed") {
      const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
      };

      const calculateOverallAccuracy = () => {
        let correct = 0;
        let total = 0;

        Object.entries(mockExam.answers || {}).forEach(
          ([questionIndex, answer]: [string, any]) => {
            if (!answer) return;

            const allQuestions = examBanks
              ? examBanks.flatMap((bank) => bank.questions)
              : [];

            const question = allQuestions[parseInt(questionIndex) - 1];
            if (!question) return;

            total++;

            if (question.type === "SINGLE_SELECT_MULTIPLE_CHOICE") {
              if (answer.answer === question.correctOptionIndex) {
                correct++;
              }
            } else if (question.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
              const userAnswers = answer.answers || [];
              const correctAnswers = question.correctOptionIndexes || [];
              if (
                userAnswers.length === correctAnswers.length &&
                userAnswers.every((ans: number) => correctAnswers.includes(ans))
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

      const overallAccuracy = calculateOverallAccuracy();

      const getQuestionStatus = (questionIndex: string, answer: any) => {
        if (!answer) return { status: "skipped", icon: null };

        const allQuestions = examBanks
          ? examBanks.flatMap((bank) => bank.questions)
          : [];
        const question = allQuestions[parseInt(questionIndex) - 1];
        if (!question) return { status: "unknown", icon: null };

        let isCorrect = false;

        if (question.type === "SINGLE_SELECT_MULTIPLE_CHOICE") {
          isCorrect = answer.answer === question.correctOptionIndex;
        } else if (question.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
          const userAnswers = answer.answers || [];
          const correctAnswers = question.correctOptionIndexes || [];
          if (
            userAnswers.length === correctAnswers.length &&
            userAnswers.every((ans: number) => correctAnswers.includes(ans))
          ) {
            isCorrect = true;
          }
        } else if (question.type === "TRUE_FALSE") {
          isCorrect = answer.answer === question.correctOptionIndex;
        }

        return isCorrect
          ? { status: "correct", icon: Check }
          : { status: "incorrect", icon: XCircle };
      };

      const allQuestions = examBanks
        ? examBanks.flatMap((bank) => bank.questions)
        : [];
      const questionsAnswered = Object.keys(mockExam.answers || {}).length;
      const totalTimeSpent = mockExam.timeSpent || 0;

      return (
        <div className="min-h-screen flex justify-center bg-background py-12">
          <div className="w-full max-w-5xl mx-auto px-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border shadow-lg p-8">
              <div className="mb-8">
                <Link
                  href={`/courses/${params.courseId}`}
                  className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Course
                </Link>
              </div>

              <div className="mb-12">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Exam Results
                </h1>
                <p className="text-muted-foreground text-lg">
                  {mockExam.examType === "timed"
                    ? "Timed Exam"
                    : "Untimed Exam"}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-8 mb-12">
                <div className="flex flex-col gap-2">
                  <div className="text-sm text-muted-foreground">
                    Questions Answered
                  </div>
                  <div className="text-3xl font-bold text-foreground">
                    {questionsAnswered}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-sm text-muted-foreground">
                    Total Time Spent
                  </div>
                  <div className="text-3xl font-bold text-foreground">
                    {formatTime(totalTimeSpent)}
                  </div>
                </div>
                {overallAccuracy !== null && (
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-muted-foreground">
                      Accuracy
                    </div>
                    <div className="text-3xl font-bold text-foreground">
                      {overallAccuracy}%
                    </div>
                  </div>
                )}
              </div>

              <div className="h-px w-full bg-border mb-8" />

              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Question Breakdown
                </h2>

                <div className="space-y-3">
                  {Object.entries(mockExam.answers || {}).map(
                    ([questionIndex, answer]: [string, any], index) => {
                      const allQuestions = examBanks
                        ? examBanks.flatMap((bank) => bank.questions)
                        : [];
                      const question =
                        allQuestions[parseInt(questionIndex) - 1];
                      if (!question) return null;

                      const status = getQuestionStatus(questionIndex, answer);
                      const timeSpent = answer?.timeSpent || 0;

                      return (
                        <div
                          key={questionIndex}
                          className="flex items-start justify-between gap-4 p-6 rounded-lg border border-border"
                        >
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-8 h-8 bg-secondary/50 rounded-lg flex items-center justify-center flex-shrink-0">
                                {status.icon &&
                                  React.createElement(status.icon, {
                                    className: `w-5 h-5 ${
                                      status.status === "correct"
                                        ? "text-green-600"
                                        : status.status === "incorrect"
                                          ? "text-red-500"
                                          : "text-muted-foreground"
                                    }`,
                                  })}
                              </div>
                              <div className="flex-1">
                                <p className="text-base text-foreground font-medium mb-2 leading-relaxed">
                                  {question.question}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatTime(timeSpent)}
                                  </span>
                                  <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground">
                                    {status.status === "correct"
                                      ? "Correct"
                                      : status.status === "incorrect"
                                        ? "Incorrect"
                                        : status.status === "skipped"
                                          ? "Skipped"
                                          : "Unknown"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-sm font-medium text-foreground">
                            Q{parseInt(questionIndex)}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex justify-center bg-background lg:mt-32">
        <div className="text-muted-foreground">
          This exam has been abondoned
        </div>
      </div>
    );
  }

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
      };
    } else if (currentQuestion?.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
      newAnswers[questionId] = {
        questionId,
        answers: Array.from(selectedMultipleAnswers),
        timeSpent: elapsedTime,
      };
    } else if (currentQuestion?.type === "TRUE_FALSE") {
      newAnswers[questionId] = {
        questionId,
        answer: trueFalseAnswer,
        timeSpent: elapsedTime,
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
    const questionId = currentQuestion?.question;

    if (currentQuestion?.type === "SINGLE_SELECT_MULTIPLE_CHOICE") {
      newAnswers[currentQuestionNumber] = {
        questionId,
        answer: selectedAnswer,
        timeSpent: elapsedTime,
      };
    } else if (currentQuestion?.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
      newAnswers[currentQuestionNumber] = {
        questionId,
        answers: Array.from(selectedMultipleAnswers),
        timeSpent: elapsedTime,
      };
    } else if (currentQuestion?.type === "TRUE_FALSE") {
      newAnswers[currentQuestionNumber] = {
        questionId,
        answer: trueFalseAnswer,
        timeSpent: elapsedTime,
      };
    }

    const newTotalTimeSpent = totalTimeSpent + elapsedTime;

    await updateMockExamMutation.mutateAsync({
      answers: newAnswers,
      timeSpent: newTotalTimeSpent,
      status: "completed",
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
