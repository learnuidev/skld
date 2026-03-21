import { Question } from "@/modules/exam-bank/exam-bank.types";
import { Answer } from "@/modules/user-mock-exams/user-mock-exams.types";

export const checkAnswerCorrectness = (
  question: Question,
  userAnswer: Answer
) => {
  if (!userAnswer) {
    return null;
  }
  let isCorrect = false;
  let correctAnswer;
  let userAnswerValue;

  const correctOptionIds = question.correctOptionIds || [];
  const correctOptionId = question.correctOptionId || "";

  if (!userAnswer) {
    isCorrect = false;
    userAnswerValue = null;
    correctAnswer =
      question.correctOptionId !== undefined
        ? question.correctOptionId
        : question.correctOptionIds;
  } else {
    if (question.type === "SINGLE_SELECT_MULTIPLE_CHOICE") {
      isCorrect = userAnswer.answer === question.correctOptionId;
      correctAnswer = question.correctOptionId;
      userAnswerValue = userAnswer.answer;
    } else if (question.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
      if (
        Array.isArray(userAnswer.answers) &&
        Array.isArray(question.correctOptionIds)
      ) {
        isCorrect =
          userAnswer.answers.length === question.correctOptionIds.length &&
          userAnswer.answers.every((ans) =>
            correctOptionIds.includes(ans as string)
          );
      }
      correctAnswer = question.correctOptionIds;
      userAnswerValue = userAnswer.answers;
    } else if (question.type === "TRUE_FALSE") {
      isCorrect = userAnswer.answer === correctOptionId;
      correctAnswer = question.correctOptionId === question.options[0]?.id;
      userAnswerValue = userAnswer.answer;
    }
  }

  return {
    isCorrect,
    userAnswerValue,
    correctAnswer,
    feedback: question.feedback,
  };
};
