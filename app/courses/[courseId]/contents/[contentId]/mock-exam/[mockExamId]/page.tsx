"use client";

import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import type { Question } from "@/modules/exam-bank/exam-bank.types";
import { useGetExamBankQuery } from "@/modules/exam-bank/use-get-exam-bank-query";
import { useGetMockExamQuery } from "@/modules/user-mock-exams/use-get-mock-exam-query";
import { useSubmitContentQuizMutation } from "@/modules/content-quiz/use-submit-content-quiz-mutation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  const queryClient = useQueryClient();

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [selectedMultipleAnswers, setSelectedMultipleAnswers] = useState<
    Set<number>
  >(new Set());
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);

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

  const currentIndex = mockExam?.currentQuestionIndex ?? 0;

  const totalQuestions = allQuestions?.length || 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const currentQuestion = allQuestions[currentIndex];
  const currentQuestionNumber = currentIndex + 1;

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

    await submitContentQuizMutation.mutateAsync({
      courseId: params.courseId,
      contentId: params.contentId,
      mockExamId: params.mockExamId,
      answers: newAnswers,
    });

    await queryClient.invalidateQueries({
      queryKey: ["mockExam", params.mockExamId],
    });

    setTotalTimeSpent(newTotalTimeSpent);
    setSelectedAnswer(null);
    setSelectedMultipleAnswers(new Set());
    setTrueFalseAnswer(null);
    setElapsedTime(0);

    if (currentQuestionNumber === totalQuestions) {
      await queryClient.refetchQueries({ queryKey: ["mockExam", mockExam.id] });
      router.push(`/courses/${params.courseId}/contents/${params.contentId}`);
    }
  };

  const handlePrevious = () => {
    setSelectedAnswer(null);
    setSelectedMultipleAnswers(new Set());
    setTrueFalseAnswer(null);
    setElapsedTime(0);
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
            {currentQuestionNumber === totalQuestions ? (
              <button
                onClick={handleNext}
                disabled={!canGoNext() || submitContentQuizMutation.isPending}
                className="flex items-center gap-2 px-8 py-3 bg-foreground text-background rounded-lg font-medium text-sm hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Check className="w-4 h-4" />
                Submit
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canGoNext() || submitContentQuizMutation.isPending}
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

export default function ContentQuizPage() {
  const params = useParams<{
    courseId: string;
    contentId: string;
    mockExamId: string;
  }>();
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

  if (mockExam.status !== "in_progress") {
    return (
      <div className="min-h-screen flex justify-center bg-background lg:mt-32">
        <div className="text-muted-foreground">
          This quiz has been completed
        </div>
      </div>
    );
  }

  return <ContentQuizPageInner mockExam={mockExam} course={course} />;
}
