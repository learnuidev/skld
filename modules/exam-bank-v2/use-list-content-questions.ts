import { useMemo } from "react";
import { QuestionV2 } from "../exam-bank/exam-bank.types";
import { useListQuestionsQuery } from "./use-list-questions-query";

export const useListContentQuestions = (contentId: string) => {
  const {
    data: questions,
    isLoading,
    isError,
  } = useListQuestionsQuery({ contentId });

  const contentQuestions: QuestionV2[] = useMemo(() => {
    return questions?.items || [];
  }, [questions?.items]);

  return {
    data: contentQuestions,
    isLoading,
    isError,
  };
};
