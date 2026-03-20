"use client";

import {
  ParsedSlide,
  parseContentToSlides,
  isStructuredContent,
  ContentNode,
} from "@/lib/content-parser";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  LayoutGrid,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface PresentationModeProps {
  content: any;
  title: string;
  onClose: () => void;
  updatedAt?: string | Date | number;
  estimatedReadTime?: number;
}

export function PresentationMode({
  content,
  title,
  onClose,
  updatedAt,
  estimatedReadTime,
}: PresentationModeProps) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [slideSteps, setSlideSteps] = useState<Record<number, number>>({});
  const [showSlideNavigator, setShowSlideNavigator] = useState(false);

  const slides = useState<ParsedSlide[]>(() => {
    if (!isStructuredContent(content)) return [];
    return parseContentToSlides(content.content || []);
  })[0];

  const currentSlide = slides[currentIndex];
  const currentStep = slideSteps[currentIndex] || 0;
  const hasIntro = !!currentSlide?.intro;
  const hasHeading = !!currentSlide?.heading;
  const hasContent = currentSlide?.content && currentSlide?.content?.length > 0;
  const isIntroOnly = hasIntro && !hasHeading && !hasContent;
  const isHeadingFirst = true;

  const countContentSteps = (nodes: ContentNode[]): number => {
    return nodes.reduce((acc, node) => {
      if (node.type === "bulletList" && node.content) {
        return acc + node.content.length;
      }
      return acc + 1;
    }, 0);
  };

  const countIntroParagraphs = (intro: string): number => {
    const paragraphs = intro.split(/\n\n+/).filter((p) => p.trim());

    return paragraphs.length > 0 ? paragraphs.length : 1;
  };

  const introParagraphCount = hasIntro
    ? countIntroParagraphs(currentSlide.intro || "")
    : 0;
  const introSteps = isIntroOnly ? introParagraphCount : hasIntro ? 1 : 0;
  const contentOffset = isIntroOnly
    ? introParagraphCount
    : isHeadingFirst
      ? 2
      : introSteps + (hasHeading ? 1 : 0);
  const contentSteps = currentSlide?.content
    ? countContentSteps(currentSlide.content)
    : 0;

  const totalSteps = contentOffset + contentSteps;

  const enterFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, []);

  const handleFullscreenToggle = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  const handlePrevious = useCallback(() => {
    if (currentIndex === -1) {
      return;
    }

    const currentSlideStep = slideSteps[currentIndex] || 0;
    if (currentSlideStep > 0) {
      setSlideSteps((prev) => ({
        ...prev,
        [currentIndex]: currentSlideStep - 1,
      }));
    } else {
      setCurrentIndex((prev) => Math.max(-1, prev - 1));
    }
  }, [currentIndex, slideSteps]);

  const handleNext = useCallback(() => {
    if (currentIndex === -1) {
      setCurrentIndex(0);
      return;
    }

    if (currentIndex === slides.length) {
      return;
    }

    const currentSlideStep = slideSteps[currentIndex] || 0;
    if (currentSlideStep < totalSteps) {
      setSlideSteps((prev) => ({
        ...prev,
        [currentIndex]: currentSlideStep + 1,
      }));
    } else {
      setCurrentIndex((prev) => Math.min(slides.length, prev + 1));
    }
  }, [slides.length, currentIndex, totalSteps, slideSteps]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
        case "ArrowUp":
          handlePrevious();
          break;
        case "ArrowRight":
        case "ArrowDown":
        case " ":
          e.preventDefault();
          handleNext();
          break;
        case "Escape":
          if (showSlideNavigator) {
            setShowSlideNavigator(false);
          } else {
            onClose();
          }
          break;
        case "f":
          e.preventDefault();
          handleFullscreenToggle();
          break;
        case "n":
          e.preventDefault();
          setShowSlideNavigator((prev) => !prev);
          break;
      }
    },
    [
      handlePrevious,
      handleNext,
      onClose,
      handleFullscreenToggle,
      showSlideNavigator,
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    setSlideSteps((prev) => {
      if (prev[currentIndex] === undefined) {
        return { ...prev, [currentIndex]: 0 };
      }
      return prev;
    });
  }, [currentIndex]);

  const renderNode = (
    node: ContentNode,
    maxItems?: number,
  ): React.ReactNode => {
    if (node.type === "paragraph") {
      const text = node.content?.map((c) => c.text).join("") || node.text || "";
      if (!text.trim()) return null;
      return (
        <p className="text-lg leading-relaxed text-foreground/90">{text}</p>
      );
    }

    if (node.type === "heading" && node.attrs?.level) {
      const text = node.content?.map((c) => c.text).join("") || node.text || "";
      const level = node.attrs.level;
      const fontSize =
        level === 1 ? "text-4xl" : level === 2 ? "text-3xl" : "text-2xl";
      return (
        <h2
          className={`font-semibold text-foreground ${fontSize} tracking-tight mb-12`}
        >
          {text}
        </h2>
      );
    }

    if (node.type === "bulletList") {
      const itemsToShow =
        maxItems !== undefined
          ? Math.min(maxItems, node.content?.length || 0)
          : node.content?.length || 0;

      return (
        <ul className="space-y-6 mb-12">
          {node.content?.slice(0, itemsToShow).map((item, idx) => (
            <li
              key={idx}
              className="text-lg text-foreground/90 leading-relaxed flex items-start gap-4"
            >
              <span className="w-2 h-2 rounded-full bg-foreground/40 flex-shrink-0 mt-2.5" />
              <span className="flex-1">{renderNode(item)}</span>
            </li>
          ))}
        </ul>
      );
    }

    if (node.type === "listItem" && node.content) {
      return (
        <div>
          {node.content.map((child, idx) => (
            <div key={idx}>{renderNode(child)}</div>
          ))}
        </div>
      );
    }

    if (node.type === "blockquote") {
      return (
        <blockquote className="border-l-4 border-foreground/30 pl-6 my-8 italic text-foreground/70 text-xl">
          {node.content?.map((child, idx) => {
            if (child.type === "paragraph" && child.content) {
              const text = child.content.map((c) => c.text).join("");
              if (text.trim()) {
                return <p key={idx}>{text}</p>;
              }
            }
            return <div key={idx}>{renderNode(child)}</div>;
          })}
        </blockquote>
      );
    }

    return null;
  };

  const renderContentWithSteps = (
    nodes: ContentNode[],
    remainingSteps: number,
  ) => {
    let stepsUsed = 0;
    const renderedNodes = [];

    for (const node of nodes) {
      if (stepsUsed >= remainingSteps) break;

      const nodeSteps =
        node.type === "bulletList" ? node.content?.length || 1 : 1;

      if (stepsUsed + nodeSteps <= remainingSteps) {
        if (node.type === "bulletList") {
          renderedNodes.push(
            <motion.div
              key={renderedNodes.length}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {renderNode(node, node.content?.length)}
            </motion.div>,
          );
        } else {
          renderedNodes.push(
            <motion.div
              key={renderedNodes.length}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {renderNode(node)}
            </motion.div>,
          );
        }
        stepsUsed += nodeSteps;
      } else if (node.type === "bulletList") {
        const partialItems = remainingSteps - stepsUsed;
        renderedNodes.push(
          <motion.div
            key={renderedNodes.length}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {renderNode(node, partialItems)}
          </motion.div>,
        );
        stepsUsed = remainingSteps;
      }
    }

    return renderedNodes;
  };

  if (slides.length === 0) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-[100] bg-background ${
          isFullscreen ? "" : "rounded-lg"
        }`}
      >
        <div
          className={`h-full flex flex-col ${
            isFullscreen ? "" : "mx-4 my-4 max-w-6xl mx-auto"
          }`}
        >
          <header className="flex items-center justify-between px-12 py-6 border-b border-border/20">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {title}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">
                {currentIndex === -1
                  ? "Intro"
                  : currentIndex === slides.length
                    ? "End"
                    : `${currentIndex + 1} / ${slides.length}`}
                {currentIndex >= 0 &&
                  currentIndex < slides.length &&
                  totalSteps > 0 && (
                    <span className="ml-2">
                      ({currentStep}/{totalSteps})
                    </span>
                  )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSlideNavigator(!showSlideNavigator)}
                  className="w-10 h-10 rounded-full"
                  title="Slide Navigator (N)"
                >
                  <LayoutGrid className="w-5 h-5 text-muted-foreground" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFullscreenToggle}
                  className="w-10 h-10 rounded-full"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Maximize2 className="w-5 h-5 text-muted-foreground" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="w-10 h-10 rounded-full hover:bg-destructive/10"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="h-full overflow-y-auto px-16 py-16"
              >
                {currentIndex === -1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="max-w-3xl mx-auto flex flex-col  h-full text-center space-y-12"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-8">
                        Presentation
                      </div>
                      <h1 className="text-6xl font-semibold text-foreground tracking-tight leading-[1.1]">
                        {title}
                      </h1>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="space-y-6 text-muted-foreground"
                    >
                      <div className="flex items-center justify-center gap-8 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-foreground/40" />
                          <span>
                            {slides.length} slide
                            {slides.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        {updatedAt && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-foreground/40" />
                            <span>
                              Updated{" "}
                              {new Date(
                                typeof updatedAt === "string" ||
                                updatedAt instanceof Date
                                  ? updatedAt
                                  : Number(updatedAt),
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                        {estimatedReadTime && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-foreground/40" />
                            <span>
                              {estimatedReadTime < 60
                                ? `${estimatedReadTime} sec`
                                : estimatedReadTime < 3600
                                  ? `${Math.floor(estimatedReadTime / 60)} min`
                                  : `${Math.floor(estimatedReadTime / 3600)} hr`}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      className="text-sm text-muted-foreground/60"
                    >
                      Press{" "}
                      <kbd className="px-2 py-1 bg-muted rounded text-foreground text-xs">
                        →
                      </kbd>{" "}
                      or{" "}
                      <kbd className="px-2 py-1 bg-muted rounded text-foreground text-xs">
                        Space
                      </kbd>{" "}
                      to begin
                    </motion.div>
                  </motion.div>
                )}

                {currentIndex === slides.length && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="max-w-3xl mx-auto flex flex-col h-full text-center space-y-16"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="space-y-6"
                    >
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <svg
                          className="w-10 h-10 text-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <h2 className="text-5xl font-semibold text-foreground tracking-tight leading-[1.1]">
                        Presentation Complete
                      </h2>
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="text-xl text-muted-foreground/70 max-w-md mx-auto text-center"
                    >
                      You've reached the end of this presentation
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      className="flex flex-row justify-center items-center gap-3 w-full mx-auto"
                    >
                      <Button
                        variant={"outline"}
                        onClick={() => setCurrentIndex(0)}
                        className="rounded-full text-base font-medium"
                      >
                        Restart
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={onClose}
                        className="rounded-full text-base font-medium"
                      >
                        Exit
                      </Button>
                    </motion.div>
                  </motion.div>
                )}

                {currentIndex >= 0 &&
                  currentIndex < slides.length &&
                  currentSlide && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className={`max-w-4xl mx-auto`}
                    >
                      {hasHeading &&
                        currentStep >=
                          (isHeadingFirst ? 1 : hasIntro ? 2 : 1) && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mb-16"
                          >
                            <h1 className="text-4xl font-semibold text-foreground tracking-tight leading-[1.1]">
                              {currentSlide.heading}
                            </h1>
                          </motion.div>
                        )}

                      {hasIntro &&
                        (isIntroOnly ? (
                          <div className="space-y-6">
                            {(currentSlide.intro || "")
                              .split(/\n\n+/)
                              .filter((p) => p.trim())
                              .slice(0, currentStep)
                              .map((paragraph, idx, ctx) => {
                                return (
                                  <motion.p
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="text-xl leading-relaxed text-foreground/70 font-light"
                                  >
                                    {paragraph}
                                  </motion.p>
                                );
                              })}
                          </div>
                        ) : (
                          currentStep >= (isHeadingFirst ? 2 : 1) && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.5 }}
                              className="mb-16"
                            >
                              <p className="text-xl leading-relaxed text-foreground/70 font-light">
                                {currentSlide.intro}
                              </p>
                            </motion.div>
                          )
                        ))}

                      {currentSlide.content &&
                        currentSlide.content.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-8"
                          >
                            {renderContentWithSteps(
                              currentSlide.content,
                              Math.max(0, currentStep - contentOffset),
                            )}
                          </motion.div>
                        )}
                    </motion.div>
                  )}
              </motion.div>
            </AnimatePresence>
          </main>

          <AnimatePresence>
            {showSlideNavigator && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 z-[200] bg-background/95 backdrop-blur-sm"
                onClick={() => setShowSlideNavigator(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="h-full max-w-5xl mx-auto px-12 py-16 flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-semibold text-foreground tracking-tight">
                      Slides
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSlideNavigator(false)}
                      className="w-10 h-10 rounded-full"
                    >
                      <X className="w-5 h-5 text-muted-foreground" />
                    </Button>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentIndex(-1);
                          setShowSlideNavigator(false);
                        }}
                        className={`p-6 rounded-lg border text-left transition-all hover:border-primary/50 ${
                          currentIndex === -1
                            ? "border-primary bg-primary/5"
                            : "border-border bg-background"
                        }`}
                      >
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                          Intro
                        </div>
                        <div className="text-lg font-semibold text-foreground truncate">
                          {title}
                        </div>
                      </motion.button>

                      {slides.map((slide, idx) => (
                        <motion.button
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: (idx + 1) * 0.03,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentIndex(idx);
                            setShowSlideNavigator(false);
                          }}
                          className={`p-6 rounded-lg border text-left transition-all hover:border-primary/50 ${
                            currentIndex === idx
                              ? "border-primary bg-primary/5"
                              : "border-border bg-background"
                          }`}
                        >
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                            Slide {idx + 1}
                          </div>
                          <div className="text-lg font-semibold text-foreground truncate">
                            {slide.heading || "Untitled"}
                          </div>
                          {slide.intro && (
                            <div className="text-sm text-muted-foreground/70 mt-2 line-clamp-2">
                              {slide.intro}
                            </div>
                          )}
                        </motion.button>
                      ))}

                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: (slides.length + 1) * 0.03,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentIndex(slides.length);
                          setShowSlideNavigator(false);
                        }}
                        className={`p-6 rounded-lg border text-left transition-all hover:border-primary/50 ${
                          currentIndex === slides.length
                            ? "border-primary bg-primary/5"
                            : "border-border bg-background"
                        }`}
                      >
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                          End
                        </div>
                        <div className="text-lg font-semibold text-foreground">
                          Complete
                        </div>
                      </motion.button>
                    </div>
                  </div>

                  <div className="mt-8 text-center text-sm text-muted-foreground/60">
                    Press{" "}
                    <kbd className="px-2 py-1 bg-muted rounded text-foreground text-xs">
                      N
                    </kbd>{" "}
                    or{" "}
                    <kbd className="px-2 py-1 bg-muted rounded text-foreground text-xs">
                      Esc
                    </kbd>{" "}
                    to close
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <footer className="flex items-center justify-between px-12 py-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              disabled={currentIndex === -1}
              className="w-12 h-12 rounded-full"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <div className="flex-1 px-12">
              <div className="w-full bg-muted/30 rounded-full h-1 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(1, Math.max(0, (currentIndex + 1) / (slides.length + 2))) * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-foreground/60 rounded-full"
                />
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              disabled={currentIndex === slides.length}
              className="w-12 h-12 rounded-full"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </footer>

          <div className="fixed bottom-16 opacity-30 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/60">
            Press{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">
              →
            </kbd>{" "}
            or{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">
              Space
            </kbd>{" "}
            for next,{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">
              ←
            </kbd>{" "}
            for previous,{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">
              N
            </kbd>{" "}
            for navigator,{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">
              Esc
            </kbd>{" "}
            to exit,{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">
              F
            </kbd>{" "}
            for fullscreen
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
