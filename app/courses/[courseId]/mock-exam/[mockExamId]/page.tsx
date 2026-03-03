"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import { useGetMockExamQuery } from "@/modules/user-mock-exams/use-get-mock-exam-query";
import { useUpdateMockExamMutation } from "@/modules/user-mock-exams/use-update-mock-exam-mutation";
import { useGetExamBanksQuery } from "@/modules/exam-bank/use-get-exam-bank-query";
import {
  Check,
  Clock,
  ArrowLeft,
  SkipForward,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function MockExamPage() {
  const params = useParams<{ courseId: string; mockExamId: string }>();
  const router = useRouter();

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [selectedMultipleAnswers, setSelectedMultipleAnswers] = useState<
    Set<number>
  >(new Set());
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean | null>(null);

  const { data: course, isLoading: courseLoading } = useGetCourseQuery(
    params.courseId,
  );
  const { data: mockExam, isLoading: mockExamLoading } = useGetMockExamQuery(
    params.mockExamId,
  );
  const updateMockExamMutation = useUpdateMockExamMutation(params.mockExamId);
  const { data: examBanks } = useGetExamBanksQuery(params.courseId);

  const isLoading = courseLoading || mockExamLoading;

  const allowSkip = course?.exam?.allowSkipQuestions ?? false;
  const isTimed = mockExam?.examType === "timed";
  const timeRemaining = mockExam?.timeRemaining ?? 0;

  useEffect(() => {
    if (!isTimed || !mockExam || mockExam.status !== "in_progress") return;

    const interval = setInterval(() => {
      if (timeRemaining > 0) {
        updateMockExamMutation.mutate({
          timeRemaining: timeRemaining - 1,
        });
      } else {
        clearInterval(interval);
        updateMockExamMutation.mutate({
          status: "completed",
        });
        router.push(`/courses/${params.courseId}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isTimed,
    mockExam,
    timeRemaining,
    params.courseId,
    router,
    updateMockExamMutation,
  ]);

  useEffect(() => {
    if (!mockExam || mockExam.status !== "in_progress") return;

    const interval = setInterval(() => {
      updateMockExamMutation.mutate({
        timeSpent: (mockExam.timeSpent || 0) + 1,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mockExam, updateMockExamMutation]);

  const getAllQuestions = useCallback(() => {
    if (!examBanks || !mockExam) return [];

    let allQuestions = examBanks.flatMap((bank) => bank.questions);

    if (mockExam.selectedDomains && mockExam.selectedDomains.length > 0) {
      allQuestions = allQuestions.filter((question) =>
        mockExam.selectedDomains.includes(question.domainId),
      );
    }

    return allQuestions;
  }, [examBanks, mockExam]);

  const allQuestions = getAllQuestions();
  const currentQuestion = allQuestions[mockExam?.currentQuestionIndex ?? 0];
  const currentQuestionNumber = (mockExam?.currentQuestionIndex ?? 0) + 1;
  const totalQuestions = allQuestions.length;

  const handleAnswerChange = (answerIndex: number, questionType: string) => {
    if (questionType === "SINGLE_SELECT_MULTIPLE_CHOICE") {
      setSelectedAnswer(answerIndex);
    } else if (questionType === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
      const newSelected = new Set(selectedMultipleAnswers);
      if (newSelected.has(answerIndex)) {
        newSelected.delete(answerIndex);
      } else {
        newSelected.add(answerIndex);
      }
      setSelectedMultipleAnswers(newSelected);
    } else if (questionType === "TRUE_FALSE") {
      setTrueFalseAnswer(answerIndex === 0);
    }
  };

  const handleNext = () => {
    if (!mockExam) return;

    const newAnswers = { ...mockExam.answers };
    if (currentQuestion?.type === "SINGLE_SELECT_MULTIPLE_CHOICE") {
      newAnswers[currentQuestionNumber] = { answer: selectedAnswer };
    } else if (currentQuestion?.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
      newAnswers[currentQuestionNumber] = {
        answers: Array.from(selectedMultipleAnswers),
      };
    } else if (currentQuestion?.type === "TRUE_FALSE") {
      newAnswers[currentQuestionNumber] = { answer: trueFalseAnswer };
    }

    updateMockExamMutation.mutate({
      answers: newAnswers,
      currentQuestionIndex: mockExam.currentQuestionIndex + 1,
    });

    setSelectedAnswer(null);
    setSelectedMultipleAnswers(new Set());
    setTrueFalseAnswer(null);
  };

  const handleSkip = () => {
    if (!mockExam || !allowSkip) return;

    updateMockExamMutation.mutate({
      currentQuestionIndex: mockExam.currentQuestionIndex + 1,
    });

    setSelectedAnswer(null);
    setSelectedMultipleAnswers(new Set());
    setTrueFalseAnswer(null);
  };

  const handlePrevious = () => {
    if (!mockExam || mockExam.currentQuestionIndex === 0) return;
    updateMockExamMutation.mutate({
      currentQuestionIndex: mockExam.currentQuestionIndex - 1,
    });

    setSelectedAnswer(null);
    setSelectedMultipleAnswers(new Set());
    setTrueFalseAnswer(null);
  };

  const handleSubmit = () => {
    if (!mockExam) return;

    const newAnswers = { ...mockExam.answers };
    if (currentQuestion?.type === "SINGLE_SELECT_MULTIPLE_CHOICE") {
      newAnswers[currentQuestionNumber] = { answer: selectedAnswer };
    } else if (currentQuestion?.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
      newAnswers[currentQuestionNumber] = {
        answers: Array.from(selectedMultipleAnswers),
      };
    } else if (currentQuestion?.type === "TRUE_FALSE") {
      newAnswers[currentQuestionNumber] = { answer: trueFalseAnswer };
    }

    updateMockExamMutation.mutate({
      answers: newAnswers,
      status: "completed",
    });

    router.push(`/courses/${params.courseId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading exam...</div>
      </div>
    );
  }

  if (!mockExam || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-destructive">Exam not found</div>
      </div>
    );
  }

  if (mockExam.status !== "in_progress") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">
          This exam has been{" "}
          {mockExam.status === "completed" ? "completed" : "abandoned"}
        </div>
      </div>
    );
  }

  if (!currentQuestion || totalQuestions === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-destructive">No questions available</div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <Link
            href={`/courses/${params.courseId}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit Exam
          </Link>
          <div className="flex items-center gap-6">
            {isTimed && (
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="w-4 h-4" />
                <span className={timeRemaining < 60 ? "text-destructive" : ""}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              Question {currentQuestionNumber} of {totalQuestions}
            </div>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground transition-all duration-300"
              style={{
                width: `${(currentQuestionNumber / totalQuestions) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-2xl font-medium mb-8">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="space-y-4 max-w-2xl">
            {currentQuestion.options.map((option, index) => {
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
                  onClick={() =>
                    handleAnswerChange(index, currentQuestion.type)
                  }
                  className={`w-full text-left p-6 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  <span className="flex items-start gap-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary/50 text-sm font-medium shrink-0">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={mockExam.currentQuestionIndex === 0}
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
                <SkipForward className="w-4 h-4" />
                Skip
              </button>
            )}

            {currentQuestionNumber === totalQuestions ? (
              <button
                onClick={handleSubmit}
                disabled={updateMockExamMutation.isPending}
                className="flex items-center gap-2 px-8 py-3 bg-foreground text-background rounded-xl font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Check className="w-4 h-4" />
                Submit Exam
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={
                  currentQuestion.type === "SINGLE_SELECT_MULTIPLE_CHOICE" &&
                  selectedAnswer === null
                    ? true
                    : currentQuestion.type === "TRUE_FALSE" &&
                        trueFalseAnswer === null
                      ? true
                      : false
                }
                className="flex items-center gap-2 px-8 py-3 bg-foreground text-background rounded-xl font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
