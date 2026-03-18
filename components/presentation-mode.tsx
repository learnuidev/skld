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
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface PresentationModeProps {
  content: any;
  title: string;
  onClose: () => void;
}

export function PresentationMode({
  content,
  title,
  onClose,
}: PresentationModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [slideSteps, setSlideSteps] = useState<Record<number, number>>({});

  const slides = useState<ParsedSlide[]>(() => {
    if (!isStructuredContent(content)) return [];
    return parseContentToSlides(content.content || []);
  })[0];

  const currentSlide = slides[currentIndex];
  const currentStep = slideSteps[currentIndex] || 0;
  const hasIntro = !!currentSlide.intro;
  const hasHeading = !!currentSlide.heading;

  const countContentSteps = (nodes: ContentNode[]): number => {
    return nodes.reduce((acc, node) => {
      if (node.type === "bulletList" && node.content) {
        return acc + node.content.length;
      }
      return acc + 1;
    }, 0);
  };

  const contentOffset = (hasIntro ? 1 : 0) + (hasHeading ? 1 : 0);
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
    const currentSlideStep = slideSteps[currentIndex] || 0;
    if (currentSlideStep > 0) {
      setSlideSteps((prev) => ({
        ...prev,
        [currentIndex]: currentSlideStep - 1,
      }));
    } else {
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    }
  }, [currentIndex, slideSteps]);

  const handleNext = useCallback(() => {
    const currentSlideStep = slideSteps[currentIndex] || 0;
    if (currentSlideStep < totalSteps) {
      setSlideSteps((prev) => ({
        ...prev,
        [currentIndex]: currentSlideStep + 1,
      }));
    } else {
      setCurrentIndex((prev) => Math.min(slides.length - 1, prev + 1));
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
          onClose();
          break;
        case "f":
          e.preventDefault();
          handleFullscreenToggle();
          break;
      }
    },
    [handlePrevious, handleNext, onClose, handleFullscreenToggle]
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
    maxItems?: number
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

    return null;
  };

  const renderContentWithSteps = (
    nodes: ContentNode[],
    remainingSteps: number
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
            </motion.div>
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
            </motion.div>
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
          </motion.div>
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
                {currentIndex + 1} / {slides.length}
                {totalSteps > 0 && (
                  <span className="ml-2">
                    ({currentStep}/{totalSteps})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
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
                {currentSlide && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="max-w-4xl mx-auto"
                  >
                    {hasIntro && currentStep >= 1 && (
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
                    )}

                    {hasHeading && currentStep >= (hasIntro ? 2 : 1) && (
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
                            Math.max(0, currentStep - contentOffset)
                          )}
                        </motion.div>
                      )}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          <footer className="flex items-center justify-between px-12 py-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              disabled={currentIndex === 0 && currentStep === 0}
              className="w-12 h-12 rounded-full"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <div className="flex-1 px-12">
              <div className="w-full bg-muted/30 rounded-full h-1 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentIndex + 1) / slides.length) * 100}%`,
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
              disabled={
                currentIndex === slides.length - 1 && currentStep >= totalSteps
              }
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
