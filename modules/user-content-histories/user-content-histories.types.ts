export type QuestionResult = {
  questionId: string;
  isCorrect: boolean;
  userAnswer: number | boolean | number[] | null;
  correctAnswer: number | boolean | number[];
  timeSpent: number;
};

export type QuizData = {
  totalQuestions: number;
  mockExamId: string;
  questionId: string;
  totalIncorrect: number;
  timeSpent: number;
  totalCorrect: number;
  userAnswer: number | boolean | number[] | null;
  answeredQuestions: number;
  questionResult: QuestionResult;
  correctAnswer: number | boolean | number[];
  submittedAt: number;
  overallAccuracy: number;
  isCorrect: boolean;
  eliminatedAnswerIds?: string[];
};

interface NodesData {
  nodeId: string;
  totalClicked: number;
}

interface LinksData {
  nodeId: string;
  totalClicked: number;
}

interface GraphData {
  timeSpent: number;
  nodes?: NodesData[];
  links?: LinksData[];
}

export type UserContentHistory = {
  id: string;
  createdAt: number;
  updatedAt?: number;
  sk: string;
  contentId: string;
  enrollmentId: string;
  userId: string;
  totalTimeSpent?: number;
  quizData?: QuizData;

  graphData?: GraphData;
};

export type UserContentHistoriesResponse = {
  userContentHistories: UserContentHistory[];
};

const sampleResponse = {
  userContentHistories: [
    {
      id: "01KM0T2YY6Y7RBDCXQX67JA683",
      createdAt: 1773848853447,
      sk: "01KK7VDNBFFHZQBP6NMCNZFB6V_01KK7SK68VKK0F4VXB59PCAM1F",
      totalTimeSpent: 568,
      enrollmentId: "01KK7VDNBFFHZQBP6NMCNZFB6V",
      userId: "c0b1e635-cb39-5fbb-9eb5-8519324b49bd",
      contentId: "01KK7SK68VKK0F4VXB59PCAM1F",
    },
    {
      createdAt: 1773848931785,
      sk: "01KK7VDNBFFHZQBP6NMCNZFB6V_01KK7SK68VKK0F4VXB59PCAM1F",
      updatedAt: 1773848931785,
      enrollmentId: "01KK7VDNBFFHZQBP6NMCNZFB6V",
      userId: "c0b1e635-cb39-5fbb-9eb5-8519324b49bd",
      contentId: "01KK7SK68VKK0F4VXB59PCAM1F",
      quizData: {
        totalQuestions: 4,
        mockExamId: "mock_1773848915028_32pw82mjq",
        questionId: "question-3",
        totalIncorrect: 0,
        timeSpent: 8,
        totalCorrect: 1,
        userAnswer: 2,
        answeredQuestions: 1,
        questionResult: {
          questionId: "question-3",
          userAnswer: 2,
          correctAnswer: 2,
          timeSpent: 8,
          isCorrect: true,
        },
        correctAnswer: 2,
        submittedAt: 1773848931785,
        overallAccuracy: 100,
        isCorrect: true,
      },
      id: "01KM0T5BE9J9S3G7T6SGJ5XQ3R",
    },
    {
      id: "01KM0T6C9HPQWMBVJJGQV88Q8T",
      updatedAt: 1773848965426,
      sk: "01KK7VDNBFFHZQBP6NMCNZFB6V_01KK7SK68VKK0F4VXB59PCAM1F",
      createdAt: 1773848965426,
      enrollmentId: "01KK7VDNBFFHZQBP6NMCNZFB6V",
      userId: "c0b1e635-cb39-5fbb-9eb5-8519324b49bd",
      contentId: "01KK7SK68VKK0F4VXB59PCAM1F",
      quizData: {
        totalQuestions: 4,
        mockExamId: "mock_1773848915028_32pw82mjq",
        questionId: "question-7",
        totalIncorrect: 1,
        timeSpent: 17,
        totalCorrect: 1,
        userAnswer: [0, 3],
        answeredQuestions: 2,
        questionResult: {
          questionId: "question-7",
          userAnswer: [0, 3],
          correctAnswer: [3, 4],
          timeSpent: 17,
          isCorrect: false,
        },
        correctAnswer: [3, 4],
        submittedAt: 1773848965426,
        overallAccuracy: 50,
        isCorrect: false,
      },
    },
    {
      createdAt: 1773849021594,
      sk: "01KK7VDNBFFHZQBP6NMCNZFB6V_01KK7SK68VKK0F4VXB59PCAM1F",
      quizData: {
        totalQuestions: 4,
        mockExamId: "mock_1773848915028_32pw82mjq",
        questionId: "question-9",
        totalIncorrect: 1,
        timeSpent: 20,
        totalCorrect: 2,
        userAnswer: 1,
        answeredQuestions: 3,
        questionResult: {
          questionId: "question-9",
          userAnswer: 1,
          correctAnswer: 1,
          timeSpent: 20,
          isCorrect: true,
        },
        correctAnswer: 1,
        submittedAt: 1773849021594,
        overallAccuracy: 66.66666666666666,
        isCorrect: true,
      },
      updatedAt: 1773849021594,
      enrollmentId: "01KK7VDNBFFHZQBP6NMCNZFB6V",
      userId: "c0b1e635-cb39-5fbb-9eb5-8519324b49bd",
      id: "01KM0T834SF9JW8QNTP06ZZ829",
      contentId: "01KK7SK68VKK0F4VXB59PCAM1F",
    },
    {
      createdAt: 1773849036889,
      sk: "01KK7VDNBFFHZQBP6NMCNZFB6V_01KK7SK68VKK0F4VXB59PCAM1F",
      id: "01KM0T8J2SQ737RK15ZG7R8913",
      enrollmentId: "01KK7VDNBFFHZQBP6NMCNZFB6V",
      userId: "c0b1e635-cb39-5fbb-9eb5-8519324b49bd",
      contentId: "01KK7SK68VKK0F4VXB59PCAM1F",
      quizData: {
        totalQuestions: 4,
        mockExamId: "mock_1773848915028_32pw82mjq",
        questionId: "question-10",
        totalIncorrect: 1,
        timeSpent: 12,
        totalCorrect: 3,
        userAnswer: 1,
        answeredQuestions: 4,
        questionResult: {
          questionId: "question-10",
          userAnswer: 1,
          correctAnswer: 1,
          timeSpent: 12,
          isCorrect: true,
        },
        correctAnswer: 1,
        submittedAt: 1773849036889,
        overallAccuracy: 75,
        isCorrect: true,
      },
      updatedAt: 1773849036889,
    },
  ],
};
