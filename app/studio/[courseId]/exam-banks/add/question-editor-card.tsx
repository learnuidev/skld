"use client";

import { Button } from "@/components/ui/button";
import { Domain } from "@/modules/course/course.types";
import { Question, QuestionV2 } from "@/modules/exam-bank/exam-bank.types";
import { useAutoSizeTextarea } from "@/hooks/ui/use-auto-size-textarea";

export function QuestionEditorCard({
  index,
  question,
  onUpdate,
  onOptionUpdate,
  onAddOption,
  onRemoveOption,
  onRemove,
  isExpanded,
  onToggle,
  domains,
}: {
  index: number;
  question: Question;
  onUpdate: (field: keyof Question, value: any) => void;
  onOptionUpdate: (optionIndex: number, value: string) => void;
  onAddOption: () => void;
  onRemoveOption: (optionIndex: number) => void;
  onRemove: () => void;
  isExpanded: boolean;
  onToggle: () => void;
  domains?: Domain[];
}) {
  const handleCorrectOptionChange = (optionIndex: number) => {
    const optionId = question.options[optionIndex]?.id;

    if (!optionId) return;

    if (question.type === "SINGLE_SELECT_MULTIPLE_CHOICE") {
      onUpdate("correctOptionId", optionId);
      onUpdate("correctOptionIds", undefined);
    } else if (question.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
      const current = question.correctOptionIds || [];
      const exists = current.includes(optionId);
      const newIds = exists
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      onUpdate("correctOptionIds", newIds.length > 0 ? newIds : undefined);
      onUpdate("correctOptionId", undefined);
    } else if (question.type === "TRUE_FALSE") {
      onUpdate("correctOptionId", optionId);
      onUpdate("correctOptionIds", undefined);
    }
  };

  const isOptionCorrect = (optionIndex: number) => {
    const optionId = question.options[optionIndex]?.id;

    if (!optionId) return false;

    if (
      question.type === "SINGLE_SELECT_MULTIPLE_CHOICE" ||
      question.type === "TRUE_FALSE"
    ) {
      return question.correctOptionId === optionId;
    } else if (question.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
      return question.correctOptionIds?.includes(optionId) || false;
    }
    return false;
  };

  const getDomainName = () => {
    if (!question.domainId || !domains) return question.domainId;
    const domain = domains.find((d) => d.id === question.domainId);
    return domain?.name || question.domainId;
  };

  const questionTextAreaRef = useAutoSizeTextarea(question.question);
  const feedbackTextAreaRef = useAutoSizeTextarea(question.feedback);

  return (
    <div className="bg-gray-50 dark:bg-[rgb(10,11,12)] border-b border-slate-100 dark:border-slate-900 px-2">
      <div className="py-6">
        <div className="flex items-start justify-between gap-8">
          <div className="flex items-center gap-6 flex-1">
            <span className="text-sm text-slate-300 dark:text-slate-700 w-6">
              {index + 1}.
            </span>
            <div className="flex-1 min-w-0">
              <textarea
                ref={questionTextAreaRef}
                value={question.question}
                onChange={(e) => onUpdate("question", e.target.value)}
                placeholder="Enter your question here..."
                className="text-lg font-light text-slate-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0 w-full whitespace-normal placeholder-slate-300 dark:placeholder-slate-700"
              />
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-slate-400 dark:text-slate-600 whitespace-nowrap">
                  {question.type}
                </span>
                {question.difficulty && (
                  <span className="text-xs text-slate-400 dark:text-slate-600 whitespace-nowrap">
                    {question.difficulty}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggle}
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors text-slate-400 dark:text-slate-600"
            >
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <button
              onClick={onRemove}
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors text-slate-400 dark:text-slate-600"
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
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="px-12">
            <div className="space-y-6 pt-6 mt-6 border-t border-slate-100 dark:border-slate-900">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    Domain
                  </label>
                  <select
                    value={question.domainId}
                    onChange={(e) => onUpdate("domainId", e.target.value)}
                    className="w-full px-3 py-2 bg-transparent border-b border-slate-200 dark:border-slate-800 text-base focus:outline-none focus:ring-0 focus:border-slate-400 dark:focus:border-slate-600"
                  >
                    {domains && domains.length > 0 ? (
                      <>
                        <option value="">Select domain</option>
                        {domains.map((domain) => (
                          <option key={domain.id} value={domain.id}>
                            {domain.name}
                          </option>
                        ))}
                      </>
                    ) : (
                      <option value={question.domainId}>
                        {getDomainName()}
                      </option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    Question Type
                  </label>
                  <select
                    value={question.type}
                    onChange={(e) => onUpdate("type", e.target.value)}
                    className="w-full px-3 py-2 bg-transparent border-b border-slate-200 dark:border-slate-800 text-base focus:outline-none focus:ring-0 focus:border-slate-400 dark:focus:border-slate-600"
                  >
                    <option value="SINGLE_SELECT_MULTIPLE_CHOICE">
                      Single Select Multiple Choice
                    </option>
                    <option value="MULTIPLE_SELECT_MULTIPLE_CHOICE">
                      Multiple Select Multiple Choice
                    </option>
                    <option value="TRUE_FALSE">True/False</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
                  Answer Options
                </label>
                <div className="space-y-3">
                  {question.options.map((option, oi) => (
                    <div
                      key={option.id || oi}
                      className="flex gap-4 items-center"
                    >
                      <div className="pt-2">
                        {question.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE" ? (
                          <input
                            type="checkbox"
                            checked={isOptionCorrect(oi)}
                            onChange={() => handleCorrectOptionChange(oi)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-0 focus:ring-offset-0"
                          />
                        ) : (
                          <input
                            type="radio"
                            name={`correct-option-${index}`}
                            checked={isOptionCorrect(oi)}
                            onChange={() => handleCorrectOptionChange(oi)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-0 focus:ring-offset-0"
                          />
                        )}
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-600 w-4">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <input
                        type="text"
                        value={
                          typeof option === "string" ? option : option.text
                        }
                        onChange={(e) => onOptionUpdate(oi, e.target.value)}
                        className="flex-1 px-3 py-2 bg-transparent border-b border-slate-200 dark:border-slate-800 text-base focus:outline-none focus:ring-0 focus:border-slate-400 dark:focus:border-slate-600 whitespace-normal break-words"
                        placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                      />
                      <button
                        onClick={() => onRemoveOption(oi)}
                        disabled={question.options.length <= 1}
                        className="p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors text-slate-400 dark:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={onAddOption}
                    className="w-full py-3 border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 text-slate-400 dark:text-slate-600 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-600 dark:hover:text-slate-400 transition-all"
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <span className="font-light">Add Option</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  Feedback / Explanation
                </label>
                <textarea
                  ref={feedbackTextAreaRef}
                  value={question.feedback}
                  onChange={(e) => onUpdate("feedback", e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border-b border-slate-200 dark:border-slate-800 text-base focus:outline-none focus:ring-0 focus:border-slate-400 dark:focus:border-slate-600 whitespace-normal"
                  placeholder="Explain why this answer is correct..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={question.difficulty || ""}
                    onChange={(e) =>
                      onUpdate("difficulty", e.target.value || undefined)
                    }
                    className="w-full px-3 py-2 bg-transparent border-b border-slate-200 dark:border-slate-800 text-base focus:outline-none focus:ring-0 focus:border-slate-400 dark:focus:border-slate-600"
                  >
                    <option value="">Select difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    Question Category
                  </label>
                  <select
                    value={question.questionType || ""}
                    onChange={(e) =>
                      onUpdate("questionType", e.target.value || undefined)
                    }
                    className="w-full px-3 py-2 bg-transparent border-b border-slate-200 dark:border-slate-800 text-base focus:outline-none focus:ring-0 focus:border-slate-400 dark:focus:border-slate-600"
                  >
                    <option value="">Select category</option>
                    <option value="scenario">Scenario</option>
                    <option value="definition">Definition</option>
                    <option value="sequence">Sequence</option>
                    <option value="identification">Identification</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
