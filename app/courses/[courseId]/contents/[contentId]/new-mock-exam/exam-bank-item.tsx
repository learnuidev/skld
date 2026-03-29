"use client";

import type { ExamBankV2 } from "@/modules/exam-bank-v2/exam-bank-v2.types";
import { useListQuestionsQuery } from "@/modules/exam-bank-v2/use-list-questions-query";
import { ChevronRight, Clock } from "lucide-react";

interface ExamBankItemProps {
  examBank: ExamBankV2;
  isSelected: boolean;
  onToggle: (examBankId: string) => void;
  selectedQuestionIds: string[];
  onToggleQuestion: (questionId: string) => void;
}

export function ExamBankItem({
  examBank,
  isSelected,
  onToggle,
  selectedQuestionIds,
  onToggleQuestion,
}: ExamBankItemProps) {
  const { data: examBankQuestionsData } = useListQuestionsQuery({
    examBankId: examBank.id,
  });
  const examBankQuestions = examBankQuestionsData?.items || [];

  const isAllSelected = selectedQuestionIds.length === 0;

  return (
    <div>
      <button
        onClick={() => onToggle(examBank.id)}
        className={`w-full flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all ${
          isSelected
            ? "border-foreground/60 bg-foreground/5"
            : "border-border hover:border-foreground/30"
        }`}
      >
        <div
          className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
            isSelected ? "border-background bg-background" : "border-foreground"
          }`}
        >
          {isSelected && <ChevronRight className="w-4 h-4" />}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-medium mb-1">{examBank.title}</h3>
          {examBank.description && (
            <p className="text-sm opacity-90 mb-2">{examBank.description}</p>
          )}
          <div className="flex items-center gap-2 text-sm opacity-75">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{examBank.totalQuestions} questions</span>
            </span>
          </div>
        </div>
      </button>

      {isSelected && examBankQuestions.length > 0 && (
        <div className="mt-3 ml-10 space-y-3">
          {examBankQuestions.map((question) => {
            const isSelected = selectedQuestionIds.includes(question.id);
            return (
              <button
                key={question.id}
                onClick={() => onToggleQuestion(question.id)}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected || isAllSelected
                    ? "border-foreground/60 bg-foreground/5"
                    : "border-border hover:border-foreground/30"
                }`}
              >
                <div
                  className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                    isSelected || isAllSelected
                      ? "border-background bg-background"
                      : "border-foreground"
                  }`}
                >
                  {(isSelected || isAllSelected) && (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm leading-relaxed">
                    {question.question.slice(0, 120)}
                    {question.question.length > 120 && "..."}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
