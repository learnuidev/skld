"use client";

import { Button } from "@/components/ui/button";
import { Domain } from "@/modules/course/course.types";
import { Question, QuestionV2 } from "@/modules/exam-bank/exam-bank.types";

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
    const optionId =
      typeof question.options[optionIndex] === "string"
        ? undefined
        : question.options[optionIndex].id;

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
    const optionId =
      typeof question.options[optionIndex] === "string"
        ? undefined
        : question.options[optionIndex].id;

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

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl flex items-center justify-center">
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {index + 1}
              </span>
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-1">
                {question.question || "(No question text)"}
              </h3>
              <div className="flex items-center gap-3 text-sm">
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-full">
                  {question.type}
                </span>
                {question.difficulty && (
                  <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full">
                    {question.difficulty}
                  </span>
                )}
                {question.questionType && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full">
                    {question.questionType}
                  </span>
                )}
                <span className="text-slate-500 dark:text-slate-400">
                  {question.options.length} option
                  {question.options.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggle}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <svg
                className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
            >
              <svg
                className="w-5 h-5"
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
        </div>

        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Domain
                </label>
                <select
                  value={question.domainId}
                  onChange={(e) => onUpdate("domainId", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400"
                  required
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
                    <option value={question.domainId}>{getDomainName()}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Question Type
                </label>
                <select
                  value={question.type}
                  onChange={(e) => onUpdate("type", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400"
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

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Question Text
              </label>
              <textarea
                value={question.question}
                onChange={(e) => onUpdate("question", e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 resize-none"
                placeholder="Enter your question here..."
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Answer Options
              </label>
              <div className="space-y-3">
                {question.options.map((option, oi) => (
                  <div key={option.id || oi} className="flex gap-3 items-start">
                    <div className="pt-3 flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        {question.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE" ? (
                          <input
                            type="checkbox"
                            checked={isOptionCorrect(oi)}
                            onChange={() => handleCorrectOptionChange(oi)}
                            className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 bg-transparent checked:bg-emerald-500 checked:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                          />
                        ) : (
                          <input
                            type="radio"
                            name={`correct-option-${index}`}
                            checked={isOptionCorrect(oi)}
                            onChange={() => handleCorrectOptionChange(oi)}
                            className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 bg-transparent checked:bg-emerald-500 checked:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                          />
                        )}
                      </label>
                    </div>
                    <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                        {String.fromCharCode(65 + oi)}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={typeof option === "string" ? option : option.text}
                      onChange={(e) => onOptionUpdate(oi, e.target.value)}
                      className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400"
                      placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveOption(oi)}
                      disabled={question.options.length <= 1}
                      className="rounded-lg"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={onAddOption}
                  className="w-full h-12 text-base border-dashed rounded-xl"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Option
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Feedback / Explanation
              </label>
              <textarea
                value={question.feedback}
                onChange={(e) => onUpdate("feedback", e.target.value)}
                rows={2}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 resize-none"
                placeholder="Explain why this answer is correct..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Difficulty Level
                </label>
                <select
                  value={question.difficulty || ""}
                  onChange={(e) =>
                    onUpdate("difficulty", e.target.value || undefined)
                  }
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400"
                >
                  <option value="">Select difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Question Category
                </label>
                <select
                  value={question.questionType || ""}
                  onChange={(e) =>
                    onUpdate("questionType", e.target.value || undefined)
                  }
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400"
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
        )}
      </div>
    </div>
  );
}
