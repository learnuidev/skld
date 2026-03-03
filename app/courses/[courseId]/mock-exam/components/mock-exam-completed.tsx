"use client";

import type { ExamBank } from "@/modules/exam-bank/exam-bank.types";
import { MockExam } from "@/modules/user-mock-exams/user-mock-exams.types";
import { ArrowLeft, Check, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import * as React from "react";

export function MockExamCompleted({
  mockExam,
  examBank,
}: {
  mockExam: MockExam;
  examBank: ExamBank;
}) {
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

          const allQuestions = examBank.questions;

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

      const allQuestions = examBank.questions;

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

    const allQuestions = examBank.questions;

    const questionsAnswered = Object.keys(mockExam.answers || {}).length;
    const totalTimeSpent = mockExam.timeSpent || 0;

    return (
      <div className="min-h-screen flex justify-center bg-background py-12">
        <div className="w-full max-w-5xl mx-auto px-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border shadow-lg p-8">
            <div className="mb-8">
              <Link
                href={`/courses/${examBank.courseId}`}
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
                {mockExam.examType === "timed" ? "Timed Exam" : "Untimed Exam"}
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
                  <div className="text-sm text-muted-foreground">Accuracy</div>
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
                    const allQuestions = examBank.questions;
                    const question = allQuestions[parseInt(questionIndex) - 1];
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
}
