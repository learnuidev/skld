"use client";

import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import type { Question } from "@/modules/exam-bank/exam-bank.types";
import { useGetExamBankQuery } from "@/modules/exam-bank/use-get-exam-bank-query";
import { useGetMockExamQuery } from "@/modules/user-mock-exams/use-get-mock-exam-query";
import { useSubmitContentQuizMutation } from "@/modules/content-quiz/use-submit-content-quiz-mutation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MockExam } from "@/modules/user-mock-exams/user-mock-exams.types";
import { Course } from "@/modules/course/course.types";

function ContentQuizPageInner({
  mockExam,
}: {
  mockExam: MockExam;
  course?: Course;
}) {
  const params = useParams<{
    courseId: string;
    contentId: string;
    mockExamId: string;
  }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [selectedMultipleAnswers, setSelectedMultipleAnswers] = useState<
    Set<number>
  >(new Set());
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{
    isCorrect: boolean;
    correctAnswer: unknown;
    feedback: string;
  } | null>(null);
  const [feedbackCache, setFeedbackCache] = useState<
    Record<
      string,
      { isCorrect: boolean; correctAnswer: unknown; feedback: string }
    >
  >({});

  const submitContentQuizMutation = useSubmitContentQuizMutation();

  const { data: examBank } = useGetExamBankQuery(
    mockExam?.courseId || "",
    mockExam?.examBankIds?.[0] || ""
  );

  const selectedContentId = mockExam?.selectedContentIds?.[0];

  const allQuestions: Question[] = useMemo(() => {
    if (!examBank?.questions) {
      return [];
    }

    return examBank?.questions?.filter((question) => {
      return question.contentId === selectedContentId;
    });
  }, [examBank, selectedContentId]);

  const questionId =
    searchParams.get("questionId") || mockExam?.currentQuestionId;

  const totalQuestions = allQuestions?.length || 0;

  const currentQuestion = useMemo(() => {
    if (!questionId || allQuestions.length === 0) {
      return allQuestions[0];
    }
    return allQuestions.find((q) => q.id === questionId);
  }, [questionId, allQuestions, mockExam?.currentQuestionId]);

  const currentIndex = useMemo(() => {
    if (!currentQuestion) return 0;
    return allQuestions.findIndex((q) => q.id === currentQuestion.id);
  }, [currentQuestion, allQuestions]);

  const currentQuestionNumber = currentIndex + 1;

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mockExam?.status === "completed" && !showFeedback) {
      router.push(
        `/courses/${params.courseId}/contents/${params.contentId}/mock-exam/${params.mockExamId}/results`
      );
    }
  }, [mockExam?.status, showFeedback]);

  useEffect(() => {
    if (allQuestions.length > 0 && !questionId) {
      const firstQuestion = allQuestions[0];
      if (firstQuestion?.id) {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set("questionId", firstQuestion.id);
        router.replace(
          `${window.location.pathname}?${newSearchParams.toString()}`
        );
      }
    }
  }, [allQuestions, questionId, searchParams, router]);

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

  const restoreQuestionState = useCallback(() => {
    const questionId = currentQuestion?.id || "";
    const existingAnswer = mockExam.answers[questionId];
    const cachedFeedback = feedbackCache[questionId];

    if (!existingAnswer) {
      setSelectedAnswer(null);
      setSelectedMultipleAnswers(new Set());
      setTrueFalseAnswer(null);
      setFeedbackData(null);
      setShowFeedback(false);
      setElapsedTime(0);
      return;
    }

    if (currentQuestion?.type === "SINGLE_SELECT_MULTIPLE_CHOICE") {
      setSelectedAnswer(existingAnswer.answer as number);
    } else if (currentQuestion?.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
      setSelectedMultipleAnswers(new Set(existingAnswer.answers as number[]));
    } else if (currentQuestion?.type === "TRUE_FALSE") {
      setTrueFalseAnswer(existingAnswer.answer as boolean);
    }

    if (cachedFeedback) {
      setFeedbackData(cachedFeedback);
      setShowFeedback(true);
    } else {
      setFeedbackData(null);
      setShowFeedback(false);
    }

    setElapsedTime(0);
  }, [currentQuestion, mockExam.answers, feedbackCache]);

  useEffect(() => {
    restoreQuestionState();
  }, [currentQuestion, restoreQuestionState]);

  const checkAnswer = async () => {
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

    const result = await submitContentQuizMutation.mutateAsync({
      courseId: params.courseId,
      contentId: params.contentId,
      mockExamId: params.mockExamId,
      answers: newAnswers,
    });

    const feedback = {
      isCorrect: result.isCorrect,
      correctAnswer: result.correctAnswer,
      feedback: result.questionFeedback,
    };

    setFeedbackData(feedback);
    setFeedbackCache((prev) => ({
      ...prev,
      [questionId]: feedback,
    }));
    setShowFeedback(true);

    setTotalTimeSpent(newTotalTimeSpent);
    setElapsedTime(0);
  };

  const handleContinue = () => {
    setShowFeedback(false);

    const nextIndex = currentIndex + 1;

    if (nextIndex >= totalQuestions) {
      router.push(
        `/courses/${params.courseId}/contents/${params.contentId}/mock-exam/${params.mockExamId}/results`
      );
    } else {
      const nextQuestion = allQuestions[nextIndex];
      if (nextQuestion) {
        const nextQuestionId = nextQuestion.id || "";
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set("questionId", nextQuestionId);
        router.push(
          `${window.location.pathname}?${newSearchParams.toString()}`
        );
      }
    }
  };

  const handleQuit = () => {
    router.push(`/courses/${params.courseId}/contents/${params.contentId}`);
  };

  const handlePrevious = () => {
    const prevIndex = currentIndex - 1;

    if (prevIndex >= 0) {
      const prevQuestion = allQuestions[prevIndex];
      if (prevQuestion) {
        const prevQuestionId = prevQuestion.id || "";
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set("questionId", prevQuestionId);
        router.push(
          `${window.location.pathname}?${newSearchParams.toString()}`
        );
      }
    }
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
      <div className="mx-auto w-full py-12 flex-1 pb-32">
        <header className="mb-12">
          <div className="flex items-baseline gap-4 justify-between mb-4">
            <Link
              href={`/courses/${params.courseId}/contents/${params.contentId}`}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Content
            </Link>

            <span className="text-muted-foreground text-lg">
              {currentQuestionNumber}{" "}
              <span className="text-sm">/ {totalQuestions}</span>
            </span>
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

        <>
          <div className="mb-8">
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
        </>

        {showFeedback && feedbackData && (
          <div className="space-y-6">
            <div
              className={`p-6 rounded-lg border-2 ${
                feedbackData.isCorrect
                  ? "border-green-500 bg-green-500/10"
                  : "border-red-500 bg-red-500/10"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                {feedbackData.isCorrect ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <span className="text-red-500 font-medium">✗</span>
                )}
                <span
                  className={`font-medium ${
                    feedbackData.isCorrect ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {feedbackData.isCorrect ? "Correct!" : "Incorrect"}
                </span>
              </div>

              {!feedbackData.isCorrect && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Correct Answer:
                  </p>
                  <p className="text-foreground font-medium">
                    {Array.isArray(feedbackData.correctAnswer)
                      ? feedbackData.correctAnswer
                          .map((i: number) =>
                            String.fromCharCode(65 + (i as number))
                          )
                          .join(", ")
                      : String.fromCharCode(
                          65 + (feedbackData.correctAnswer as number)
                        )}
                  </p>
                </div>
              )}

              {feedbackData.feedback && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Explanation:
                  </p>
                  <p className="text-foreground">{feedbackData.feedback}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-4 left-0 right-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3">
          {showFeedback && feedbackData ? (
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleQuit}
                className="flex items-center gap-2 px-6 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Quit
              </button>

              <button
                onClick={handleContinue}
                disabled={submitContentQuizMutation.isPending}
                className="flex items-center gap-2 px-8 py-3 bg-foreground text-background rounded-lg font-medium text-sm hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentIndex <= 0}
                className="flex items-center gap-2 px-6 py-3 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const existingAnswer =
                      mockExam.answers[currentQuestion?.id];
                    if (existingAnswer) {
                      handleContinue();
                    } else {
                      checkAnswer();
                    }
                  }}
                  disabled={!canGoNext() || submitContentQuizMutation.isPending}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                    mockExam.answers[currentQuestion?.id]
                      ? "text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                      : "bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                >
                  {submitContentQuizMutation.isPending
                    ? "Checking..."
                    : mockExam.answers[currentQuestion?.id]
                      ? "Next"
                      : "Check"}
                  {!mockExam.answers[currentQuestion?.id] && (
                    <Check className="w-4 h-4" />
                  )}
                  {mockExam.answers[currentQuestion?.id] && (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ContentQuizPage() {
  const params = useParams<{
    courseId: string;
    contentId: string;
    mockExamId: string;
  }>();
  const router = useRouter();
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
        <div className="text-destructive">Quiz not found</div>
      </div>
    );
  }

  return <ContentQuizPageInner mockExam={mockExam} course={course} />;
}
