"use client";

import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import { useListUserContentHistoriesQuery } from "@/modules/user-content-histories/use-list-user-content-histories-query";
import { UserContentHistory } from "@/modules/user-content-histories/user-content-histories.types";
import { ArrowLeft, BookOpen, CheckCircle, XCircle, Clock, Calendar, Filter, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FilterType = "all" | "content" | "quiz";
type SortType = "date-desc" | "date-asc" | "time-desc" | "time-asc";

export default function ContentHistoryPage() {
  const params = useParams<{ courseId: string; contentId: string }>();
  const { data: course } = useGetCourseQuery(params.courseId);
  const { data: historiesData, isLoading } = useListUserContentHistoriesQuery(
    params.courseId,
    params.contentId,
  );

  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("date-desc");

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isQuiz = (history: UserContentHistory) => {
    return !!history.quizData;
  };

  const stats = useMemo(() => {
    if (!historiesData?.userContentHistories || historiesData.userContentHistories.length === 0) {
      return {
        totalTimeSpent: 0,
        totalViews: 0,
        daysSpent: 0,
        accuracy: 0,
      };
    }

    const histories = historiesData.userContentHistories;
    const contentHistories = histories.filter((h) => !isQuiz(h));
    const quizHistories = histories.filter((h) => isQuiz(h));

    const totalTimeSpent = histories.reduce((sum, h) => {
      return sum + (isQuiz(h) ? h.quizData?.timeSpent || 0 : h.totalTimeSpent || 0);
    }, 0);

    const totalViews = contentHistories.length;
    const daysSpent = Math.ceil(totalTimeSpent / (60 * 60 * 24));

    let totalCorrect = 0;
    let totalIncorrect = 0;
    quizHistories.forEach((h) => {
      if (h.quizData?.isCorrect) {
        totalCorrect++;
      } else {
        totalIncorrect++;
      }
    });

    const totalQuestions = totalCorrect + totalIncorrect;
    const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

    return {
      totalTimeSpent,
      totalViews,
      daysSpent,
      accuracy,
    };
  }, [historiesData]);

  const filteredAndSortedHistories = useMemo(() => {
    if (!historiesData?.userContentHistories) return [];

    let filtered = [...historiesData.userContentHistories];

    if (filter === "content") {
      filtered = filtered.filter((h) => !isQuiz(h));
    } else if (filter === "quiz") {
      filtered = filtered.filter((h) => isQuiz(h));
    }

    filtered.sort((a, b) => {
      switch (sort) {
        case "date-desc":
          return b.createdAt - a.createdAt;
        case "date-asc":
          return a.createdAt - b.createdAt;
        case "time-desc":
          const timeA = isQuiz(a) ? a.quizData?.timeSpent || 0 : a.totalTimeSpent || 0;
          const timeB = isQuiz(b) ? b.quizData?.timeSpent || 0 : b.totalTimeSpent || 0;
          return timeB - timeA;
        case "time-asc":
          const timeA2 = isQuiz(a) ? a.quizData?.timeSpent || 0 : a.totalTimeSpent || 0;
          const timeB2 = isQuiz(b) ? b.quizData?.timeSpent || 0 : b.totalTimeSpent || 0;
          return timeA2 - timeB2;
        default:
          return b.createdAt - a.createdAt;
      }
    });

    return filtered;
  }, [historiesData, filter, sort]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-foreground/10 border-t-foreground rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-destructive">Course not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <Link
          href={`/courses/${params.courseId}/contents/${params.contentId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors gap-2 mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Content
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Activity History
          </h1>
          <p className="text-muted-foreground">
            Track your learning progress and performance
          </p>
        </motion.div>

        {stats.totalTimeSpent > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-16"
          >
            <div className="grid grid-cols-4 gap-8">
              <div className="border-b border-border pb-6">
                <div className="text-4xl font-light text-foreground mb-2">
                  {formatDuration(stats.totalTimeSpent)}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Total Time
                </div>
              </div>

              <div className="border-b border-border pb-6">
                <div className="text-4xl font-light text-foreground mb-2">
                  {stats.totalViews}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Total Views
                </div>
              </div>

              <div className="border-b border-border pb-6">
                <div className="text-4xl font-light text-foreground mb-2">
                  {stats.daysSpent}d
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Days Spent
                </div>
              </div>

              <div className="border-b border-border pb-6">
                <div className="text-4xl font-light text-foreground mb-2">
                  {Math.round(stats.accuracy)}%
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Performance
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1">
              {(["all", "content", "quiz"] as FilterType[]).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-4 py-1.5 text-sm transition-colors ${
                    filter === filterType
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {filterType === "all" ? "All" : filterType === "content" ? "Content" : "Quiz"}
                </button>
              ))}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowUpDown className="w-4 h-4" />
                <span>
                  {sort === "date-desc"
                    ? "Newest First"
                    : sort === "date-asc"
                      ? "Oldest First"
                      : sort === "time-desc"
                        ? "Most Time"
                        : "Least Time"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSort("date-desc")}>
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("date-asc")}>
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("time-desc")}>
                Most Time Spent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("time-asc")}>
                Least Time Spent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {filteredAndSortedHistories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-32"
          >
            <Clock className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
            <p className="text-muted-foreground">
              {filter === "all" ? "No activity yet" : `No ${filter} activity found`}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedHistories.map((history, index) => (
              <motion.div
                key={history.sk}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group border-b border-border/50 pb-6 last:border-0"
              >
                <div className="flex items-start gap-8">
                  <div className="flex-shrink-0 w-24 pt-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      {formatDate(history.createdAt).split(",")[0]}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(history.createdAt).split(",")[1]?.trim()}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {isQuiz(history) ? (
                          <CheckCircle className="w-4 h-4 text-foreground/60" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-foreground/60" />
                        )}
                        <span className="text-sm text-foreground">
                          {isQuiz(history) ? "Quiz Attempt" : "Content View"}
                        </span>
                      </div>

                      {isQuiz(history) && history.quizData && (
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            history.quizData.isCorrect
                              ? "bg-green-500/10 text-green-600"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {history.quizData.isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-8 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {formatDuration(
                            isQuiz(history) ? history.quizData?.timeSpent || 0 : history.totalTimeSpent || 0
                          )}
                        </span>
                      </div>

                      {isQuiz(history) && history.quizData && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground/60">Accuracy:</span>
                            <span className="text-foreground">
                              {Math.round(history.quizData.overallAccuracy)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-green-500/60" />
                            <span>{history.quizData.totalCorrect}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <XCircle className="w-3.5 h-3.5 text-red-500/60" />
                            <span>{history.quizData.totalIncorrect}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {isQuiz(history) && history.quizData && (
                      <div className="mt-4 pt-4 border-t border-border/30">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span>
                            Question {history.quizData.questionId?.split("-")[1]} of {history.quizData.totalQuestions}
                          </span>
                          <span>Progress: {Math.round(history.quizData.overallAccuracy)}%</span>
                        </div>
                        <div className="w-full bg-muted/30 rounded-full h-1">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${history.quizData.overallAccuracy}%` }}
                            transition={{ duration: 0.6, delay: index * 0.05 }}
                            className={`h-full rounded-full ${
                              history.quizData.overallAccuracy >= 80
                                ? "bg-foreground"
                                : history.quizData.overallAccuracy >= 60
                                  ? "bg-foreground/70"
                                  : "bg-foreground/40"
                            }`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {filteredAndSortedHistories.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border text-center text-xs text-muted-foreground">
            Showing {filteredAndSortedHistories.length}{" "}
            {filteredAndSortedHistories.length === 1 ? "entry" : "entries"}
          </div>
        )}
      </div>
    </div>
  );
}

    return `${secs}s`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isQuiz = (history: UserContentHistory) => {
    return !!history.quizData;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return "text-green-500";
    if (accuracy >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getAccuracyBg = (accuracy: number) => {
    if (accuracy >= 80) return "bg-green-500/10 border-green-500/20";
    if (accuracy >= 60) return "bg-yellow-500/10 border-yellow-500/20";
    return "bg-red-500/10 border-red-500/20";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-foreground/10 border-t-foreground rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading history...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-destructive">Course not found</div>
      </div>
    );
  }

  const histories = historiesData?.userContentHistories || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href={`/courses/${params.courseId}/contents/${params.contentId}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-all hover:gap-3 gap-2 mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Content
          </Link>

          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
              Activity History
            </h1>
            <p className="text-muted-foreground text-lg">
              Track your progress and quiz performance
            </p>
          </div>

          <div className="mb-6 flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-secondary/50 border border-border">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>Content View</span>
            </div>
            <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-secondary/50 border border-border">
              <CheckCircle className="w-4 h-4 text-purple-500" />
              <span>Quiz Attempt</span>
            </div>
          </div>
        </motion.div>

        {histories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-12 h-12 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No activity yet
            </h3>
            <p className="text-muted-foreground">
              Start learning to track your progress
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {histories
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((history, index) => (
                <motion.div
                  key={history.sk}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="mb-4"
                >
                  <div
                    className={`relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${
                      isQuiz(history)
                        ? "bg-gradient-to-br from-purple-500/5 via-purple-500/5 to-purple-500/10 border-purple-500/20"
                        : "bg-gradient-to-br from-blue-500/5 via-blue-500/5 to-blue-500/10 border-blue-500/20"
                    }`}
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-current to-transparent opacity-20" />

                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                            isQuiz(history)
                              ? "bg-purple-500/10 border border-purple-500/30"
                              : "bg-blue-500/10 border border-blue-500/30"
                          }`}
                        >
                          {isQuiz(history) ? (
                            <CheckCircle className="w-6 h-6 text-purple-500" />
                          ) : (
                            <BookOpen className="w-6 h-6 text-blue-500" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                              <h3 className="font-semibold text-foreground text-base mb-1">
                                {isQuiz(history)
                                  ? "Quiz Attempt"
                                  : "Content View"}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {formatDistanceToNow(
                                  new Date(history.createdAt),
                                  {
                                    addSuffix: true,
                                  },
                                )}
                              </p>
                            </div>

                            {isQuiz(history) && history.quizData?.isCorrect && (
                              <div
                                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getAccuracyBg(
                                  history.quizData.overallAccuracy,
                                )}`}
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span
                                  className={getAccuracyColor(
                                    history.quizData.overallAccuracy,
                                  )}
                                >
                                  {history.quizData.isCorrect
                                    ? "Correct"
                                    : "Incorrect"}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>
                                {isQuiz(history)
                                  ? formatTime(history.quizData?.timeSpent || 0)
                                  : formatTime(history.totalTimeSpent || 0)}
                              </span>
                            </div>

                            {isQuiz(history) && (
                              <>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Check className="w-4 h-4 text-green-500" />
                                  <span>
                                    {history.quizData?.totalCorrect || 0}{" "}
                                    correct
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <XCircle className="w-4 h-4 text-red-500" />
                                  <span>
                                    {history.quizData?.totalIncorrect || 0}{" "}
                                    incorrect
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">
                                    Progress:
                                  </span>
                                  <span
                                    className={`font-semibold ${getAccuracyColor(
                                      history.quizData?.overallAccuracy || 0,
                                    )}`}
                                  >
                                    {Math.round(
                                      history.quizData?.overallAccuracy || 0,
                                    )}
                                    %
                                  </span>
                                </div>
                              </>
                            )}
                          </div>

                          {isQuiz(history) && (
                            <div className="mt-4 p-4 rounded-xl bg-background/50 border border-border/50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                  Question{" "}
                                  {history.quizData?.questionId?.split("-")[1]}{" "}
                                  of {history.quizData?.totalQuestions}
                                </span>
                                {(history.quizData?.overallAccuracy || 0) >=
                                80 ? (
                                  <TrendingUp className="w-4 h-4 text-green-500" />
                                ) : (
                                  <TrendingDown className="w-4 h-4 text-yellow-500" />
                                )}
                              </div>
                              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${history.quizData?.overallAccuracy || 0}%`,
                                  }}
                                  transition={{
                                    duration: 0.8,
                                    delay: index * 0.1 + 0.3,
                                  }}
                                  className={`h-full rounded-full ${
                                    (history.quizData?.overallAccuracy || 0) >=
                                    80
                                      ? "bg-gradient-to-r from-green-500 to-green-400"
                                      : (history.quizData?.overallAccuracy ||
                                            0) >= 60
                                        ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                                        : "bg-gradient-to-r from-red-500 to-red-400"
                                  }`}
                                />
                              </div>
                            </div>
                          )}

                          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                              {formatDate(history.createdAt)}
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        )}

        {histories.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: histories.length * 0.1 + 0.3 }}
            className="mt-8 text-center text-sm text-muted-foreground"
          >
            Showing {histories.length}{" "}
            {histories.length === 1 ? "entry" : "entries"}
          </motion.div>
        )}
      </div>
    </div>
  );
}
