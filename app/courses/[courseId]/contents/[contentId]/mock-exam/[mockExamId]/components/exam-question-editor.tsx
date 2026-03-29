"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  QuestionOption,
  QuestionType,
} from "@/modules/exam-bank/exam-bank.types";
import { Check, Trash2 } from "lucide-react";
import { useRef, useEffect } from "react";

interface ExamQuestionEditorProps {
  editQuestionText: string;
  editFeedbackText: string;
  editOptions: QuestionOption[];
  questionType: QuestionType;
  correctOptionId?: string;
  correctOptionIds?: string[];
  onQuestionTextChange: (value: string) => void;
  onFeedbackTextChange: (value: string) => void;
  onOptionChange: (index: number, value: string) => void;
  onToggleCorrectAnswer: (index: number) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
}

export function ExamQuestionEditor({
  editQuestionText,
  editFeedbackText,
  editOptions,
  questionType,
  correctOptionId,
  correctOptionIds,
  onQuestionTextChange,
  onFeedbackTextChange,
  onOptionChange,
  onToggleCorrectAnswer,
  onAddOption,
  onRemoveOption,
}: ExamQuestionEditorProps) {
  const isSingleSelect = questionType === "SINGLE_SELECT_MULTIPLE_CHOICE";
  const isMultiSelect = questionType === "MULTIPLE_SELECT_MULTIPLE_CHOICE";

  const isOptionCorrect = (optionId: string): boolean => {
    if (isSingleSelect) {
      return correctOptionId === optionId;
    } else if (isMultiSelect) {
      return correctOptionIds?.includes(optionId) || false;
    }
    return false;
  };

  return (
    <div className="mb-8">
      <Textarea
        contentEditable
        suppressHydrationWarning
        value={editQuestionText}
        onChange={(e) => onQuestionTextChange(e.target.value)}
        className="text-xl text-foreground leading-relaxed min-h-[120px] mb-16 whitespace-pre-wrap border-none bg-transparent outline-none focus:border-transparent focus:ring-0 resize-none focus:border-none focus:outline-none focus-visible:ring-0"
      />

      <div className="space-y-4 mb-8">
        <label className="block text-sm text-muted-foreground mb-2">
          Options
        </label>
        {editOptions.map((option, index) => {
          const optionId = option.id;
          const isCorrect = isOptionCorrect(optionId);

          return (
            <div key={optionId || index} className="space-y-2">
              <div
                className={`w-full text-left p-6 rounded-lg border-2 transition-all text-base relative ${
                  isCorrect
                    ? "border-rose-500 bg-rose-500/10"
                    : "border-border hover:border-foreground/20"
                }`}
              >
                <span className="flex items-center gap-4">
                  {(isSingleSelect || isMultiSelect) && (
                    <Button
                      onClick={() => onToggleCorrectAnswer(index)}
                      title={
                        isCorrect ? "Mark as incorrect" : "Mark as correct"
                      }
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                        isCorrect
                          ? "bg-rose-500 hover:bg-rose-500/80 text-white"
                          : "text-gray-400 hover:text-foreground"
                      }`}
                      variant="ghost"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}

                  <Input
                    value={option.text}
                    onChange={(e) => onOptionChange(index, e.target.value)}
                    className="flex-1 min-h-[30px] text-base py-2 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                    placeholder={`Option ${String.fromCharCode(65 + index)} text`}
                  />

                  <Button
                    onClick={() => onRemoveOption(index)}
                    title="Remove option"
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 text-red-400 hover:text-red-500"
                    variant="ghost"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </span>
              </div>
            </div>
          );
        })}

        <Button
          onClick={onAddOption}
          className="w-full py-6 border-2 border-dashed border-border hover:border-foreground/20 text-muted-foreground hover:text-foreground transition-all"
          variant="ghost"
        >
          Add Option
        </Button>
      </div>

      <div>
        <label className="block text-sm text-muted-foreground mb-2">
          Feedback/Explanation
        </label>
        <Textarea
          value={editFeedbackText}
          onChange={(e) => onFeedbackTextChange(e.target.value)}
          className="text-xl h-40 text-foreground leading-relaxed mb-16 whitespace-pre-wrap border-none bg-transparent outline-none focus:border-transparent focus:ring-0 resize-none focus:border-none focus:outline-none focus-visible:ring-0"
          placeholder="Add explanation or feedback..."
        />
      </div>
    </div>
  );
}
