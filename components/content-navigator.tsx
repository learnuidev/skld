"use client";

import { CourseContent } from "@/modules/course-content/course-content.types";
import { Domain } from "@/modules/course/course.types";
import { MockExam } from "@/modules/user-mock-exams/user-mock-exams.types";
import { UserContentStat } from "@/modules/skld/skld.types";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ChevronDown, Clock, Eye, Target } from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

interface ContentNavigatorProps {
  courseId: string;
  contentId: string;
  contents: CourseContent[];
  domains: Domain[];
  enrollmentStats: UserContentStat[];
  mockExams?: MockExam[];
  onClose: () => void;
}

function formatTime(seconds: number): string {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return "0s";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function ContentNavigator({
  courseId,
  contentId,
  contents,
  domains,
  enrollmentStats,
  mockExams,
  onClose,
}: ContentNavigatorProps) {
  const [search, setSearch] = useState("");
  const chapterToDomainId = useMemo(() => {
    const map = new Map<string, string>();
    for (const domain of domains) {
      for (const chapter of domain.chapters) {
        map.set(chapter.id, domain.id);
      }
    }
    return map;
  }, [domains]);

  const currentContent = contents.find((c) => c.id === contentId);
  const currentDomainId = currentContent?.chapterId
    ? chapterToDomainId.get(currentContent.chapterId) || null
    : null;

  const defaultDomainId =
    currentDomainId || (domains.length > 0 ? domains[0].id : null);
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(
    defaultDomainId,
  );
  const [domainOpen, setDomainOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const selectedDomain = useMemo(
    () => domains.find((d) => d.id === selectedDomainId) || null,
    [domains, selectedDomainId],
  );

  const statsByContentId = useMemo(() => {
    const map = new Map<string, UserContentStat>();
    for (const stat of enrollmentStats) {
      map.set(stat.contentId, stat);
    }
    return map;
  }, [enrollmentStats]);

  const ongoingQuizContentIds = useMemo(() => {
    const ids = new Set<string>();
    if (!mockExams) return ids;
    for (const exam of mockExams) {
      if (exam.status === "in_progress" && exam.selectedContentIds) {
        for (const cid of exam.selectedContentIds) {
          ids.add(cid);
        }
      }
    }
    return ids;
  }, [mockExams]);

  const contentsByChapter = useMemo(() => {
    const map = new Map<string, CourseContent[]>();
    if (selectedDomain) {
      for (const chapter of selectedDomain.chapters) {
        map.set(chapter.id, []);
      }
    }
    const chapterIds = new Set(map.keys());
    const unassigned: CourseContent[] = [];

    for (const c of contents) {
      if (c.chapterId && chapterIds.has(c.chapterId)) {
        map.get(c.chapterId)!.push(c);
      } else if (!c.chapterId && !selectedDomain) {
        unassigned.push(c);
      }
    }

    for (const [, list] of map) {
      list.sort((a, b) => a.order - b.order);
    }

    const result: {
      chapterId: string | null;
      chapterName: string | null;
      contents: CourseContent[];
    }[] = [];
    for (const [chapterId, list] of map) {
      const chapter = selectedDomain?.chapters.find(
        (ch) => ch.id === chapterId,
      );
      result.push({
        chapterId,
        chapterName: chapter?.name || null,
        contents: list,
      });
    }

    if (unassigned.length > 0) {
      unassigned.sort((a, b) => a.order - b.order);
      result.push({ chapterId: null, chapterName: null, contents: unassigned });
    }

    return result.filter((g) => g.contents.length > 0);
  }, [contents, selectedDomain]);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return contents.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q)),
    );
  }, [contents, search]);

  const isSearching = search.trim().length > 0;

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (domainOpen) setDomainOpen(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, domainOpen]);

  const handleNavigate = (targetContentId: string) => {
    onClose();
    if (targetContentId !== contentId) {
      router.push(`/courses/${courseId}/contents/${targetContentId}`);
    }
  };

  const renderCard = (c: CourseContent, idx: number, delayOffset: number) => {
    const stat = statsByContentId.get(c.id);
    const isActive = c.id === contentId;
    const hasOngoingQuiz = ongoingQuizContentIds.has(c.id);

    return (
      <motion.button
        key={c.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, delay: delayOffset + idx * 0.02 }}
        onClick={() => handleNavigate(c.id)}
        className={`relative p-4 rounded-lg border text-left transition-all hover:border-primary/40 ${
          isActive
            ? "border-primary bg-primary/5"
            : "border-border bg-background"
        }`}
      >
        {hasOngoingQuiz && (
          <span className="absolute top-2 right-2 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
          </span>
        )}
        <div
          className={`text-sm font-medium line-clamp-2 mb-2 h-16 ${
            isActive ? "text-primary" : "text-foreground"
          }`}
        >
          {c.title}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {stat && (
            <>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(stat.metadata.totalTimeSpent)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {stat.metadata.timesRead ?? 0}
              </span>
              {(() => {
                const tc = stat.metadata.totalCorrect ?? 0;
                const ti = stat.metadata.totalIncorrect ?? 0;
                const total = tc + ti;
                if (total > 0) {
                  const perf = Math.round((tc / total) * 100);
                  return (
                    <span
                      className={`flex items-center gap-1 font-medium ${
                        perf >= 70
                          ? "text-green-600"
                          : perf >= 40
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      <Target className="w-3 h-3" />
                      {perf}%
                    </span>
                  );
                }
                return null;
              })()}
            </>
          )}
          {!stat && (
            <span className="text-muted-foreground/50">No activity</span>
          )}
        </div>
      </motion.button>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="h-full max-w-5xl mx-auto px-6 sm:px-12 py-8 sm:py-12 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {domains.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setDomainOpen(!domainOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:border-foreground/20 bg-background text-sm font-medium text-foreground transition-colors"
                  >
                    <span>{selectedDomain?.name || "Select domain"}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform ${domainOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {domainOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-64 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-10"
                      >
                        {domains.map((domain) => (
                          <button
                            key={domain.id}
                            onClick={() => {
                              setSelectedDomainId(domain.id);
                              setDomainOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                              domain.id === selectedDomainId
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-foreground hover:bg-muted"
                            }`}
                          >
                            {domain.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search contents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {isSearching ? (
              searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Search className="w-12 h-12 mb-4 opacity-30" />
                  <p className="text-lg font-medium">No results found</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {searchResults.map((c, idx) => renderCard(c, idx, 0))}
                </div>
              )
            ) : contentsByChapter.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <p className="text-lg font-medium">
                  No contents in this domain
                </p>
              </div>
            ) : (
              <div className="space-y-24 mt-12">
                {contentsByChapter.map((group, groupIdx) => (
                  <motion.div
                    key={group.chapterId || `ungrouped-${groupIdx}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: groupIdx * 0.06 }}
                  >
                    {group.chapterName && (
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-muted-foreground">
                          {group.chapterName}
                        </h3>
                        <p className="text-xs text-muted-foreground/60 mt-0.5">
                          {group.contents.length} content
                          {group.contents.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {group.contents.map((c, idx) =>
                        renderCard(c, idx, groupIdx * 0.04),
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-border/40 text-center text-xs text-muted-foreground/60">
            Press{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground text-xs">
              Esc
            </kbd>{" "}
            to close
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
