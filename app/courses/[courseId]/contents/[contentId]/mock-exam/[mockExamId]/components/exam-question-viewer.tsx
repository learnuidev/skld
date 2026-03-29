"use client";

import { Button } from "@/components/ui/button";
import type {
  Question,
  QuestionOption,
} from "@/modules/exam-bank/exam-bank.types";
import { Ban } from "lucide-react";

interface ExamQuestionViewerProps {
  question: Question;
  selectedAnswer: string | null;
  selectedMultipleAnswers: Set<string>;
  trueFalseAnswer: boolean | null;
  eliminatedAnswerIds: Set<string>;
  onAnswerChange: (answerIndex: number) => void;
  onToggleEliminateOption: (e: React.MouseEvent, optionId: string) => void;
}

export function ExamQuestionViewer({
  question,
  selectedAnswer,
  selectedMultipleAnswers,
  trueFalseAnswer,
  eliminatedAnswerIds,
  onAnswerChange,
  onToggleEliminateOption,
}: ExamQuestionViewerProps) {
  return (
    <div className="mb-8">
      <p className="text-xl text-foreground leading-relaxed mb-16">
        {question.question}
      </p>

      <div className="space-y-4">
        {question.options.map((option: QuestionOption, index: number) => {
          const optionId = option.id;
          const isSelected =
            question.type === "SINGLE_SELECT_MULTIPLE_CHOICE"
              ? selectedAnswer === optionId
              : question.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE"
                ? selectedMultipleAnswers.has(optionId)
                : question.type === "TRUE_FALSE"
                  ? (index === 0 && trueFalseAnswer === true) ||
                    (index === 1 && trueFalseAnswer === false)
                  : false;

          const isEliminated = eliminatedAnswerIds.has(optionId);

          return (
            <button
              key={optionId || index}
              onClick={() => !isEliminated && onAnswerChange(index)}
              className={`w-full text-left p-6 rounded-lg border-2 transition-all text-base relative ${
                isSelected
                  ? "border-foreground bg-foreground text-background"
                  : isEliminated
                    ? "border-border/50 opacity-50 hover:border-border/50"
                    : "border-border hover:border-foreground/20"
              }`}
            >
              <span className="flex items-center gap-4">
                <span className="flex items-center justify-center w-6 h-6 rounded bg-secondary/50 text-xs font-medium">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option.text}</span>
                <Button
                  disabled={isSelected}
                  onClick={(e) => onToggleEliminateOption(e, optionId)}
                  title={
                    isEliminated ? "Un-eliminate option" : "Eliminate option"
                  }
                  className={`ml-auto w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 text-gray-400 `}
                  variant="ghost"
                >
                  {isSelected ? null : <Ban className="w-4 h-4" />}
                </Button>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
