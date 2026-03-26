"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SearchDialog } from "@/components/search-dialog";
import { StarRating } from "@/components/star-rating";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Play,
  Info,
  Command,
} from "lucide-react";
import { useListPublicCoursesQuery } from "@/modules/course/use-list-public-courses-query";

export default function Catalog() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFeatured, setCurrentFeatured] = useState(0);
  const isPaused = useRef(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const { data: courses, isLoading, error } = useListPublicCoursesQuery();

  const filteredCourses =
    courses?.filter(
      (course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const featuredCourses =
    courses?.filter((course) => course.hasCertification).slice(0, 5) || [];
  const currentFeaturedCourse = featuredCourses[currentFeatured];

  const prevSearchQuery = useRef(searchQuery);
  const prevFilteredDataLength = useRef(filteredCourses.length);

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

  const nextFeatured = () => {
    setCurrentFeatured((prev) => (prev + 1) % featuredCourses.length);
  };

  const prevFeatured = () => {
    setCurrentFeatured(
      (prev) => (prev - 1 + featuredCourses.length) % featuredCourses.length,
    );
  };

  const variants = {
    enter: {
      opacity: 0,
      scale: 1,
    },
    center: {
      zIndex: 1,
      opacity: 1,
      scale: 1,
    },
    exit: {
      zIndex: 0,
      opacity: 0,
      scale: 1.02,
    },
  };

  useEffect(() => {
    if (!isPaused.current) {
      autoPlayRef.current = setInterval(() => {
        setCurrentFeatured((prev) => (prev + 1) % featuredCourses.length);
      }, 8000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [featuredCourses.length]);

  useEffect(() => {
    if (
      prevSearchQuery.current !== searchQuery ||
      prevFilteredDataLength.current !== filteredCourses.length
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentFeatured(0);
    }
    prevSearchQuery.current = searchQuery;
    prevFilteredDataLength.current = filteredCourses.length;
  }, [searchQuery, filteredCourses.length, setCurrentFeatured]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="py-4 px-4 md:px-8">
          <button
            onClick={() => setSearchOpen(true)}
            className="relative w-full max-w-2xl mx-auto flex items-center gap-3 px-4 py-3 rounded-full bg-secondary/50 border-2 border-transparent hover:border-primary hover:bg-secondary/70 transition-all text-left text-sm md:text-base group"
          >
            <Search className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-muted-foreground group-hover:text-foreground transition-colors">
              Search for courses...
            </span>
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-xs text-muted-foreground">
              <Command className="h-3 w-3" />
              <span>K</span>
            </kbd>
          </button>
        </div>
      </div>

      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSearch={setSearchQuery}
      />

      {isLoading && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground">Loading courses...</div>
        </div>
      )}

      {error && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-destructive">Error loading courses</div>
        </div>
      )}

      {!isLoading && !error && courses && (
        <>
          <div className="relative h-[500px] md:h-[600px] overflow-hidden">
            <AnimatePresence initial={false} mode="wait">
              {currentFeaturedCourse && (
                <motion.div
                  key={currentFeatured}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: 1,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${getGradientForCourse(currentFeatured)}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  </div>

                  <div className="relative h-full max-w-5xl mx-auto px-4 md:px-8 pr-16 md:pr-20 flex items-center">
                    <div className="max-w-2xl space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium"
                      >
                        Featured Certification
                      </motion.div>
                      <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-5xl md:text-5xl font-bold text-white leading-tight"
                      >
                        {currentFeaturedCourse.title}
                      </motion.h1>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="flex flex-wrap gap-3 text-white/80"
                      >
                        {currentFeaturedCourse.exam && (
                          <>
                            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                              {currentFeaturedCourse.exam.totalQuestions}{" "}
                              Questions
                            </span>
                            {currentFeaturedCourse.exam.totalTimeMinutes && (
                              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                                {currentFeaturedCourse.exam.totalTimeMinutes}{" "}
                                Minutes
                              </span>
                            )}
                          </>
                        )}
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                          {getLevelFromCourseType(
                            currentFeaturedCourse.courseType,
                          )}
                        </span>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="flex flex-wrap gap-3 text-white/80 mb-4"
                      >
                        {currentFeaturedCourse.averageRating !== undefined &&
                          currentFeaturedCourse.totalTimesRated !==
                            undefined && (
                            <div className="flex items-center gap-2">
                              <StarRating
                                rating={currentFeaturedCourse.averageRating}
                                count={currentFeaturedCourse.totalTimesRated}
                                size="sm"
                                showCount
                              />
                            </div>
                          )}
                        {currentFeaturedCourse.exam && (
                          <>
                            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                              {currentFeaturedCourse.exam.totalQuestions}{" "}
                              Questions
                            </span>
                            {currentFeaturedCourse.exam.totalTimeMinutes && (
                              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                                {currentFeaturedCourse.exam.totalTimeMinutes}{" "}
                                Minutes
                              </span>
                            )}
                          </>
                        )}
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                          {getLevelFromCourseType(
                            currentFeaturedCourse.courseType,
                          )}
                        </span>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="flex gap-4 pt-4"
                      >
                        <Button
                          size="lg"
                          className="bg-white text-black hover:bg-white/90 px-8"
                          asChild
                        >
                          <a href={`/courses/${currentFeaturedCourse.id}`}>
                            <Play className="w-5 h-5 mr-2" />
                            Start Practice
                          </a>
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          className="bg-white/20 border-white/40 text-white hover:bg-white/30 px-8"
                          asChild
                        >
                          <a href={`/courses/${currentFeaturedCourse.id}`}>
                            <Info className="w-5 h-5 mr-2" />
                            Learn More
                          </a>
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {featuredCourses.length > 1 && (
              <>
                <button
                  onClick={() => {
                    isPaused.current = true;
                    setTimeout(() => {
                      isPaused.current = false;
                    }, 10000);
                    prevFeatured();
                  }}
                  onMouseEnter={() => (isPaused.current = true)}
                  onMouseLeave={() => (isPaused.current = false)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => {
                    isPaused.current = true;
                    setTimeout(() => {
                      isPaused.current = false;
                    }, 10000);
                    nextFeatured();
                  }}
                  onMouseEnter={() => (isPaused.current = true)}
                  onMouseLeave={() => (isPaused.current = false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {featuredCourses.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        isPaused.current = true;
                        setTimeout(() => {
                          isPaused.current = false;
                        }, 10000);
                        setCurrentFeatured(index);
                      }}
                      onMouseEnter={() => (isPaused.current = true)}
                      onMouseLeave={() => (isPaused.current = false)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentFeatured
                          ? "bg-white w-8"
                          : "bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course, index) => (
                <div key={course.id} className="group/card">
                  <div
                    className={`relative aspect-[2/3] rounded-xl overflow-hidden bg-gradient-to-br ${getGradientForCourse(index)} shadow-xl group-hover/card:scale-105 transition-transform duration-300`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                        {getLevelFromCourseType(course.courseType)}
                      </span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="font-bold text-lg mb-1">{course.title}</h3>
                      <div className="flex items-center justify-between text-sm mt-3 mb-2">
                        {course.averageRating !== undefined &&
                          course.totalTimesRated !== undefined && (
                            <StarRating
                              rating={course.averageRating}
                              count={course.totalTimesRated}
                              size="sm"
                              showCount
                            />
                          )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex gap-2">
                          {course.exam && (
                            <>
                              <span className="px-2 py-1 bg-white/20 rounded text-xs">
                                {course.exam.totalQuestions}Q
                              </span>
                              {course.exam.totalTimeMinutes && (
                                <span className="px-2 py-1 bg-white/20 rounded text-xs">
                                  {course.exam.totalTimeMinutes}m
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <Button
                        size="lg"
                        className="bg-white text-black hover:bg-white/90"
                        asChild
                      >
                        <a href={`/courses/${course.id}`}>
                          <Play className="w-5 h-5 mr-2" />
                          Start
                        </a>
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-white/40 text-white hover:bg-white/20"
                        asChild
                      >
                        <a href={`/courses/${course.id}`}>
                          <Info className="w-5 h-5" />
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground">
                  No courses found matching &ldquo;{searchQuery}&rdquo;
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
