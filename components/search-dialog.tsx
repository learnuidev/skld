"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, BookOpen, Clock, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useListPublicCoursesQuery } from "@/modules/course/use-list-public-courses-query";

interface SearchDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSearch?: (query: string) => void;
}

export function SearchDialog({
  open: controlledOpen,
  onOpenChange,
  onSearch,
}: SearchDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const inputRef = useRef<HTMLInputElement>(null);
  const wasOpen = useRef(false);
  const { data: courses, isLoading } = useListPublicCoursesQuery();

  const goalIntents = [
    "i want to pass",
    "i want to take",
    "i need to pass",
    "i'd like to pass",
    "i want to study",
  ];
  const isGoalIntent = goalIntents.some((intent) =>
    intent.includes(searchQuery.toLowerCase()),
  );

  const getGradientForCourse = (index: number) => {
    const gradients = [
      "from-purple-500 to-pink-600",
      "from-blue-500 to-cyan-600",
      "from-green-500 to-emerald-600",
      "from-orange-500 to-red-600",
      "from-indigo-500 to-purple-600",
    ];
    return gradients[index % gradients.length];
  };

  const getLevelFromCourseType = (courseType?: string) => {
    if (!courseType) return "Intermediate";
    return courseType.charAt(0).toUpperCase() + courseType.slice(1);
  };

  const filteredCourses = useMemo(() => {
    if (isGoalIntent) {
      return courses || [];
    }

    return (
      courses?.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          course.domains?.some((domain) =>
            domain.name.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      ) || []
    );
  }, [courses, searchQuery, isGoalIntent]);

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    setSelectedIndex(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
      if (open) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCourses.length - 1 ? prev + 1 : prev,
          );
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        }
        if (e.key === "Enter" && filteredCourses.length > 0) {
          e.preventDefault();
          const selected = filteredCourses[selectedIndex];
          onSearch?.(selected.title);
          if (isGoalIntent) {
            window.location.href = `/goals?courseId=${selected.id}`;
          } else {
            window.location.href = `/courses/${selected.id}`;
          }
          setOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    open,
    filteredCourses,
    selectedIndex,
    setOpen,
    onSearch,
    isGoalIntent,
    searchQuery,
  ]);

  useEffect(() => {
    if (open && !wasOpen.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchQuery("");
      setSelectedIndex(0);
      inputRef.current?.focus();
    }
    wasOpen.current = open;
  }, [open, setSearchQuery, setSelectedIndex]);

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-primary/20 text-primary rounded px-1">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={() => setOpen(false)}
      />

      <div className="relative w-full max-w-5xl mx-4">
        <div className="bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border overflow-hidden">
          <div className="border-b p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                placeholder={
                  isGoalIntent
                    ? "Select a course to set your goal..."
                    : "Search courses..."
                }
                value={searchQuery}
                onChange={(e) => handleSearchQueryChange(e.target.value)}
                className="w-full pl-14 pr-14 py-5 text-lg bg-transparent border-0 focus:outline-none focus:ring-0"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchQueryChange("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-muted rounded-full p-2 transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="text-muted-foreground">Loading courses...</div>
              </div>
            ) : searchQuery === "" ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                <Search className="h-24 w-24 text-muted-foreground/50" />
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold">Search for courses</h2>
                  <p className="text-muted-foreground text-lg">
                    Type to find courses, certifications, and exams
                  </p>
                  <p className="text-primary text-sm font-medium mt-4">
                    Try typing &quot;I want to pass...&quot; to set a learning
                    goal
                  </p>
                </div>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search className="h-24 w-24 text-muted-foreground/50 mb-6" />
                <p className="text-2xl font-medium mb-2">No results found</p>
                <p className="text-muted-foreground text-lg">
                  Try searching for another term
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {isGoalIntent && (
                  <div className="text-center py-6 space-y-2">
                    <p className="text-xl font-semibold">🎯 Set Your Goal</p>
                    <p className="text-muted-foreground">
                      Select a course you want to pass
                    </p>
                  </div>
                )}
                <div className="space-y-3">
                  {filteredCourses.map((course, index) => (
                    <button
                      key={course.id}
                      onClick={() => {
                        onSearch?.(course.title);
                        if (isGoalIntent) {
                          window.location.href = `/goals?courseId=${course.id}`;
                        } else {
                          window.location.href = `/courses/${course.id}`;
                        }
                        setOpen(false);
                      }}
                      className={cn(
                        "w-full text-left p-5 rounded-xl border-2 transition-all group flex items-start gap-5 hover:border-primary",
                        index === selectedIndex && "border-primary bg-accent",
                      )}
                    >
                      <div
                        className={cn(
                          "flex-none w-14 h-14 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0",
                          getGradientForCourse(index),
                        )}
                      >
                        {course.title.substring(0, 2).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-bold text-lg">
                            {highlightMatch(course.title, searchQuery)}
                          </h4>
                          {course.hasCertification && (
                            <span className="shrink-0 text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                              Certification
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground line-clamp-2 mb-3">
                          {highlightMatch(
                            course.description || "",
                            searchQuery,
                          )}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {getLevelFromCourseType(course.courseType)}
                          </span>
                          {course.exam && (
                            <>
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                {course.exam.totalQuestions} Questions
                              </span>
                              {course.exam.totalTimeMinutes && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {course.exam.totalTimeMinutes}min
                                </span>
                              )}
                            </>
                          )}
                          {course.domains && course.domains.length > 0 && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {course.domains.length} Domains
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t p-4 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <kbd className="h-5 px-1.5 rounded bg-muted border text-[10px]">
                  ↑
                </kbd>
                <kbd className="h-5 px-1.5 rounded bg-muted border text-[10px]">
                  ↓
                </kbd>
                <span>to navigate</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="h-5 px-1.5 rounded bg-muted border text-[10px]">
                  ↵
                </kbd>
                <span>to select</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="h-5 px-1.5 rounded bg-muted border text-[10px]">
                  esc
                </kbd>
                <span>to close</span>
              </div>
            </div>
            <div className="text-sm">
              {searchQuery &&
                `${filteredCourses.length} result${filteredCourses.length !== 1 ? "s" : ""}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
