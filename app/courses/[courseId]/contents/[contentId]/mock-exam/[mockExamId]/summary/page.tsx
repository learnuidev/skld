"use client";

import type { Question } from "@/modules/exam-bank/exam-bank.types";
import { useGetMockExamQuery } from "@/modules/user-mock-exams/use-get-mock-exam-query";
import { useCreateContentQuizMutation } from "@/modules/content-quiz/use-create-content-quiz-mutation";
import { Check, Clock, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { useListExamBanksQuery } from "@/modules/exam-bank/use-list-exam-banks-query";

type AnswerItem = number | string | boolean | null;

type AnswerValue = {
  questionId: string;
  answer?: AnswerItem;
  answers?: AnswerItem[];
  timeSpent: number;
  answeredAt: number;
};

export default function ContentQuizSummaryPage() {
  const params = useParams<{
    courseId: string;
    contentId: string;
    mockExamId: string;
  }>();
  const router = useRouter();

  const { data: mockExam, isLoading: mockExamLoading } = useGetMockExamQuery(
    params.mockExamId
  );

  const { data: examBanks, isLoading: isExamBanksLoading } =
    useListExamBanksQuery(params.courseId);

  const createContentQuizMutation = useCreateContentQuizMutation();

  const selectedContentId = params.contentId;

  const contentQuestions = useMemo(() => {
    return (
      examBanks
        ?.map((exam) =>
          exam?.questions.map((question) => {
            return {
              ...question,
              examBankId: exam.id,
            };
          })
        )
        ?.flat()
        ?.filter((question) => question?.contentId === selectedContentId) || []
    );
  }, [examBanks, selectedContentId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getFaileIds = useMemo(() => {
    const failedIds: string[] = [];
    const failedExamBankIds: string[] = [];

    contentQuestions.forEach((question) => {
      const answer = (mockExam?.answers || {})[question.id];
      if (!answer) return;

      let isCorrect = false;

      if (question.type === "SINGLE_SELECT_MULTIPLE_CHOICE") {
        isCorrect = answer.answer === question.correctOptionId;
      } else if (question.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
        const userAnswers = answer.answers || [];
        const correctAnswers = question.correctOptionIds || [];
        if (
          userAnswers.length === correctAnswers.length &&
          userAnswers.every(
            (ans: AnswerItem) =>
              typeof ans === "string" && correctAnswers.includes(ans)
          )
        ) {
          isCorrect = true;
        }
      } else if (question.type === "TRUE_FALSE") {
        isCorrect = answer.answer === question.correctOptionId;
      }

      if (!isCorrect) {
        failedExamBankIds.push(question.examBankId);
        failedIds.push(question.id);
      }
    });

    return { failedIds, failedExamBankIds };
  }, [contentQuestions, mockExam?.answers]);

  const failedQuestionIds = getFaileIds.failedIds;
  const failedExamBankIds = [...new Set(getFaileIds.failedExamBankIds)];

  const stats = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let total = 0;

    contentQuestions.forEach((question) => {
      const answer = (mockExam?.answers || {})[question.id];
      if (!answer) return;

      total++;

      let isCorrect = false;

      if (question.type === "SINGLE_SELECT_MULTIPLE_CHOICE") {
        isCorrect = answer.answer === question.correctOptionId;
      } else if (question.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
        const userAnswers = answer.answers || [];
        const correctAnswers = question.correctOptionIds || [];
        if (
          userAnswers.length === correctAnswers.length &&
          userAnswers.every(
            (ans: AnswerItem) =>
              typeof ans === "string" && correctAnswers.includes(ans)
          )
        ) {
          isCorrect = true;
        }
      } else if (question.type === "TRUE_FALSE") {
        isCorrect = answer.answer === question.correctOptionId;
      }

      if (isCorrect) {
        correct++;
      } else {
        incorrect++;
      }
    });

    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const totalTimeSpent = Object.values(mockExam?.answers || {}).reduce(
      (sum: number, ans: AnswerValue) => sum + (ans?.timeSpent || 0),
      0
    );

    return { correct, incorrect, total, accuracy, totalTimeSpent };
  }, [contentQuestions, mockExam?.answers]);

  const handleRetryFailed = async () => {
    if (failedQuestionIds.length === 0) return;

    const result = await createContentQuizMutation.mutateAsync({
      courseId: params.courseId,
      contentId: params.contentId,

      examBankIds: failedExamBankIds || [],
      questionIds: failedQuestionIds,
      examType: "untimed",
      examVariant: "failed",
    });

    router.push(
      `/courses/${params.courseId}/contents/${params.contentId}/mock-exam/${result.id}`
    );
  };

  const isLoading = mockExamLoading || isExamBanksLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!mockExam || !examBanks) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-destructive">Quiz not found</div>
      </div>
    );
  }

  if (mockExam.status !== "completed") {
    return (
      <div className="min-h-screen flex justify-center bg-background py-12">
        <div className="text-muted-foreground">
          Quiz has not been completed yet
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-2xl space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-foreground/5 mb-4">
            <span className="text-4xl font-light text-foreground">
              {stats.accuracy}%
            </span>
          </div>
          <h1 className="text-3xl font-light text-foreground tracking-tight">
            Quiz Complete
          </h1>
          <p className="text-muted-foreground text-lg font-light">
            {stats.correct} correct, {stats.incorrect} incorrect
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8 py-8">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-emerald-600">
              <Check className="w-5 h-5" />
              <span className="text-2xl font-light">{stats.correct}</span>
            </div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Correct
            </div>
          </div>
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-rose-500">
              <XCircle className="w-5 h-5" />
              <span className="text-2xl font-light">{stats.incorrect}</span>
            </div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Incorrect
            </div>
          </div>
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-foreground">
              <Clock className="w-5 h-5" />
              <span className="text-2xl font-light">
                {formatTime(stats.totalTimeSpent)}
              </span>
            </div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Time
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-8">
          <Link
            href={`/courses/${params.courseId}/contents/${params.contentId}/history`}
            className="group w-full flex items-center justify-between px-8 py-6 rounded-lg border border-border hover:border-foreground/30 transition-all duration-300"
          >
            <span className="text-foreground font-light">Content History</span>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
          <Link
            href={`/courses/${params.courseId}/contents/${params.contentId}`}
            className="group w-full flex items-center justify-between px-8 py-6 rounded-lg border border-border hover:border-foreground/30 transition-all duration-300"
          >
            <span className="text-foreground font-light">Back to Content</span>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>

          {failedQuestionIds.length > 0 && (
            <button
              onClick={handleRetryFailed}
              disabled={createContentQuizMutation.isPending}
              className="group w-full flex items-center justify-between px-8 py-6 rounded-lg border border-border hover:border-foreground/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-foreground font-light">
                Retry {failedQuestionIds.length} Failed Question
                {failedQuestionIds.length !== 1 ? "s" : ""}
              </span>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          )}

          <Link
            href={`/courses/${params.courseId}/contents/${params.contentId}/mock-exam/${params.mockExamId}/results`}
            className="group w-full flex items-center justify-between px-8 py-6 rounded-lg border border-border hover:border-foreground/30 transition-all duration-300"
          >
            <span className="text-foreground font-light">
              View Detailed Results
            </span>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
