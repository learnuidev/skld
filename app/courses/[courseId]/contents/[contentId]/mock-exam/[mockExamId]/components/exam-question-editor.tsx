"use client";

import { Textarea } from "@/components/ui/textarea";
import type { QuestionOption } from "@/modules/exam-bank/exam-bank.types";

interface ExamQuestionEditorProps {
  editQuestionText: string;
  editFeedbackText: string;
  editOptions: QuestionOption[];
  onQuestionTextChange: (value: string) => void;
  onFeedbackTextChange: (value: string) => void;
  onOptionChange: (index: number, value: string) => void;
}

export function ExamQuestionEditor({
  editQuestionText,
  editFeedbackText,
  editOptions,
  onQuestionTextChange,
  onFeedbackTextChange,
  onOptionChange,
}: ExamQuestionEditorProps) {
  return (
    <div className="mb-8">
      <Textarea
        value={editQuestionText}
        onChange={(e) => onQuestionTextChange(e.target.value)}
        className="text-xl text-foreground leading-relaxed min-h-[120px] mb-16"
        placeholder="Question text"
      />

      <div className="space-y-4">
        <label className="block text-sm text-muted-foreground mb-2">
          Options
        </label>
        {editOptions.map((option, index) => (
          <div key={option.id || index} className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center justify-center w-6 h-6 rounded bg-secondary/50 text-xs font-medium">
                {String.fromCharCode(65 + index)}
              </span>
              <label className="text-sm text-muted-foreground">
                Option {String.fromCharCode(65 + index)}
              </label>
            </div>
            <Textarea
              value={option.text}
              onChange={(e) => onOptionChange(index, e.target.value)}
              className="min-h-[60px]"
              placeholder={`Option ${String.fromCharCode(65 + index)} text`}
            />
          </div>
        ))}
      </div>

      <div className="mt-8">
        <label className="block text-sm text-muted-foreground mb-2">
          Feedback/Explanation
        </label>
        <Textarea
          value={editFeedbackText}
          onChange={(e) => onFeedbackTextChange(e.target.value)}
          className="min-h-[100px]"
          placeholder="Add explanation or feedback..."
        />
      </div>
    </div>
  );
}
