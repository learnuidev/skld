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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [examBankToDelete, setExamBankToDelete] = useState<ExamBank | null>(
    null
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-slate-400 dark:text-slate-600">
          Loading...
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
        <DialogContent className="sm:max-w-md border-slate-100 dark:border-slate-800">
          <DialogHeader>
            <div className="flex items-center gap-3 pb-6 border-b border-slate-100 dark:border-slate-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <AlertTriangle className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              </div>
              <DialogTitle className="text-lg font-light text-slate-900 dark:text-white">
                Delete Exam Bank
              </DialogTitle>
            </div>
            <DialogDescription className="text-base text-slate-500 dark:text-slate-400 pb-6">
              This will permanently delete &quot;{examBankTitle}&quot; and all of its questions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Type &quot;{examBankTitle}&quot; to confirm
              </label>
              <Input
                placeholder={`Enter "${examBankTitle}"`}
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="border-slate-200 dark:border-slate-800 focus:border-slate-400 dark:focus:border-slate-600"
              />
            </div>
          </div>
          <DialogFooter className="gap-3 pt-6 border-t border-slate-100 dark:border-slate-900">
            <button
              onClick={() => {
                onOpenChange(false);
                setDeleteConfirm("");
              }}
              disabled={isPending}
              className="px-6 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={deleteConfirm !== examBankTitle || isPending}
              className="px-6 py-2 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 disabled:opacity-50"
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-slate-900 dark:text-white">
            Exam Banks
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-600 mt-1">
            {examBanks?.length || 0} exam bank
            {examBanks?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href={`/studio/${courseId}/exam-banks/add`}>
          <Button variant="outline" className="rounded-full border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900">
            Add Exam Bank
          </Button>
        </Link>
      </div>

      {!examBanks || examBanks.length === 0 ? (
        <EmptyState courseId={courseId} />
      ) : (
        <div className="space-y-1">
          {examBanks.map((examBank) => (
            <ExamBankCard
              key={examBank.id}
              examBank={examBank}
              onDelete={() => handleDelete(examBank)}
            />
          ))}
        </div>
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
    <div className="border-b border-slate-100 dark:border-slate-900 pb-16 pt-12">
      <div className="flex flex-col items-center justify-center text-center">
        <h3 className="text-lg font-light text-slate-900 dark:text-white mb-3">
          No exam banks yet
        </h3>
        <p className="text-slate-400 dark:text-slate-600 max-w-md mb-8">
          Create your first exam bank to start building your question database.
        </p>
        <Link href={`/studio/${courseId}/exam-banks/add`}>
          <Button variant="outline" className="rounded-full border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900">
            Create Exam Bank
          </Button>
        </Link>
      </div>
    </div>
  );
}

function ExamBankCard({
  examBank,
  onDelete,
}: {
  examBank: ExamBank;
  onDelete: () => void;
}) {
  const questionCount = examBank.questions?.length || 0;

  return (
    <Link
      href={`/studio/${examBank.courseId}/exam-banks/${examBank.id}`}
      className="bg-white dark:bg-black border-b border-slate-100 dark:border-slate-900 py-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer group block"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-light text-slate-900 dark:text-white mb-1 whitespace-normal break-words">
            {examBank.title}
          </h3>

          <p className="text-sm text-slate-400 dark:text-slate-600 line-clamp-2">
            {examBank.description || "No description"}
          </p>

          <div className="mt-3">
            <span className="text-xs text-slate-400 dark:text-slate-600">
              {questionCount} question{questionCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg"
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
              strokeWidth={1.5}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </Button>
      </div>
    </Link>
  );
}
