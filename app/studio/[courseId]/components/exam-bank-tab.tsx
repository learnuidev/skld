"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetExamBanksQuery } from "@/modules/exam-bank/use-get-exam-bank-query";
import { useDeleteExamBankMutation } from "@/modules/exam-bank/use-exam-bank-mutations";
import { ExamBank } from "@/modules/exam-bank/exam-bank.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ExamBankTabProps {
  courseId: string;
}

export function ExamBankTab({ courseId }: ExamBankTabProps) {
  const queryClient = useQueryClient();
  const { data: examBanks, isLoading } = useGetExamBanksQuery(courseId);
  const deleteExamBankMutation = useDeleteExamBankMutation(courseId);
  const [selectedExamBank, setSelectedExamBank] = useState<ExamBank | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [examBankToDelete, setExamBankToDelete] = useState<ExamBank | null>(
    null
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-slate-600 dark:text-slate-400">
          Loading exam banks...
        </div>
      </div>
    );
  }

  function DeleteExamBankDialog({
    open,
    onOpenChange,
    examBankTitle,
    onConfirm,
    isPending,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    examBankTitle: string;
    onConfirm: () => void;
    isPending: boolean;
  }) {
    const [deleteConfirm, setDeleteConfirm] = useState("");

    const handleConfirm = () => {
      if (deleteConfirm === examBankTitle) {
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
              <DialogTitle className="text-xl">Delete Exam Bank</DialogTitle>
            </div>
            <DialogDescription className="text-base pt-4">
              This action cannot be undone. This will permanently delete the
              exam bank &quot;{examBankTitle}&quot; and all of its questions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4">
              <p className="text-sm font-medium text-destructive">
                Warning: All questions in this exam bank will be permanently
                deleted
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Type the exam bank name{" "}
                <span className="font-bold">&quot;{examBankTitle}&quot;</span>{" "}
                to confirm
              </label>
              <Input
                placeholder={`Enter "${examBankTitle}"`}
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
              disabled={deleteConfirm !== examBankTitle || isPending}
              className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Deleting..." : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const handleDelete = (examBank: ExamBank) => {
    setExamBankToDelete(examBank);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (examBankToDelete) {
      try {
        await deleteExamBankMutation.mutateAsync(examBankToDelete.id);
        setDeleteDialogOpen(false);
        setExamBankToDelete(null);
        await queryClient.invalidateQueries({
          queryKey: ["examBanks", courseId],
        });
      } catch (error) {
        console.error("Failed to delete exam bank:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Exam Banks
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {examBanks?.length || 0} exam bank
            {examBanks?.length !== 1 ? "s" : ""} available
          </p>
        </div>
        <Link href={`/studio/${courseId}/exam-banks/add`}>
          <Button className="rounded-xl">Add Exam Bank</Button>
        </Link>
      </div>

      {!examBanks || examBanks.length === 0 ? (
        <EmptyState courseId={courseId} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examBanks.map((examBank) => (
            <ExamBankCard
              key={examBank.id}
              examBank={examBank}
              onView={() => setSelectedExamBank(examBank)}
              onDelete={() => handleDelete(examBank)}
            />
          ))}
        </div>
      )}

      {selectedExamBank && (
        <ViewExamBankDialog
          examBank={selectedExamBank}
          open={!!selectedExamBank}
          onOpenChange={(open) => !open && setSelectedExamBank(null)}
        />
      )}

      {examBankToDelete && (
        <DeleteExamBankDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          examBankTitle={examBankToDelete.title}
          onConfirm={handleConfirmDelete}
          isPending={deleteExamBankMutation.isPending}
        />
      )}
    </div>
  );
}

function EmptyState({ courseId }: { courseId: string }) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-16">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <svg
            className="w-10 h-10 text-slate-400"
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
        <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
          No Exam Banks Yet
        </h3>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6 text-lg">
          Create your first exam bank to start building your question database.
        </p>
        <Link href={`/studio/${courseId}/exam-banks/add`}>
          <Button className="rounded-xl">Create Exam Bank</Button>
        </Link>
      </div>
    </div>
  );
}

function ExamBankCard({
  examBank,
  onView,
  onDelete,
}: {
  examBank: ExamBank;
  onView: () => void;
  onDelete: () => void;
}) {
  const questionCount = examBank.questions?.length || 0;

  return (
    <div
      onClick={onView}
      className="bg-white dark:bg-[rgb(10,11,12)] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl flex items-center justify-center">
          <svg
            className="w-6 h-6 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </Button>
      </div>

      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 line-clamp-1">
        {examBank.title}
      </h3>

      {examBank.description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
          {examBank.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {questionCount} question{questionCount !== 1 ? "s" : ""}
        </span>
        <svg
          className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  );
}

function ViewExamBankDialog({
  examBank,
  open,
  onOpenChange,
}: {
  examBank: ExamBank;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{examBank.title}</DialogTitle>
          {examBank.description && (
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              {examBank.description}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Questions ({examBank.questions?.length || 0})
            </h3>
          </div>

          {examBank.questions?.map((question, index) => (
            <QuestionCard key={index} question={question} index={index + 1} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function QuestionCard({ question, index }: { question: any; index: number }) {
  const isOptionCorrect = (optionIndex: number) => {
    if (
      question.type === "SINGLE_SELECT_MULTIPLE_CHOICE" ||
      question.type === "TRUE_FALSE"
    ) {
      return question.correctOptionIndex === optionIndex;
    } else if (question.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
      return question.correctOptionIndexes?.includes(optionIndex) || false;
    }
    return false;
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Question {index}
        </span>
        <div className="flex gap-2">
          {question.difficulty && (
            <span className="px-2 py-1 text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full">
              {question.difficulty}
            </span>
          )}
          {question.questionType && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full">
              {question.questionType}
            </span>
          )}
        </div>
      </div>

      <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
        {question.question}
      </h4>

      {question.options && question.options.length > 0 && (
        <div className="space-y-2 mb-4">
          {question.options.map((option: string, i: number) => (
            <div
              key={i}
              className={`px-4 py-3 rounded-lg border text-sm ${
                isOptionCorrect(i)
                  ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-800 dark:text-green-400"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-500 dark:text-slate-400 mr-2">
                  {String.fromCharCode(65 + i)}.
                </span>
                <span className="flex-1">{option}</span>
                {isOptionCorrect(i) && (
                  <svg
                    className="w-4 h-4 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 text-xs">
        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-full">
          {question.type}
        </span>
        <span className="text-slate-500 dark:text-slate-400">
          Domain ID: {question.domainId}
        </span>
      </div>

      {question.feedback && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-300">
            <span className="font-semibold">Feedback:</span> {question.feedback}
          </p>
        </div>
      )}
    </div>
  );
}
