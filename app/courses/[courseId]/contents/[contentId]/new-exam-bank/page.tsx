"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGetCourseContentQuery } from "@/modules/course-content/use-get-course-content-query";
import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import { useGenerateExamQuestionsMutation } from "@/modules/exam-bank/use-generate-exam-questions-mutation";
import { QUESTION_TYPES } from "@/modules/exam-bank/exam-bank.types";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useState } from "react";
import { CoffeeIcon, Loader2, ChevronDown } from "lucide-react";
import Link from "next/link";
import {
  parseContentToSlides,
  isStructuredContent,
  ParsedSlide,
} from "@/lib/content-parser";

export default function NewExamBankPage() {
  const params = useParams<{
    courseId: string;
    contentId: string;
  }>();
  const router = useRouter();

  const { data: course, isLoading: courseLoading } = useGetCourseQuery(
    params.courseId,
  );
  const { data: content, isLoading: contentLoading } = useGetCourseContentQuery(
    params.courseId,
    params.contentId,
  );

  const generateExamQuestionsMutation = useGenerateExamQuestionsMutation();

  const [questionType, setQuestionType] = useState<string>(
    "SINGLE_SELECT_MULTIPLE_CHOICE",
  );
  const [difficulty, setDifficulty] = useState<string>("hard");
  const [questionCategory, setQuestionCategory] = useState<string>("scenario");
  const [totalQuestions, setTotalQuestions] = useState<string>("10");
  const [domain, setDomain] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number | null>(
    null,
  );
  const [isSlideSelectorOpen, setIsSlideSelectorOpen] = useState(false);

  const slides = useState<ParsedSlide[]>(() => {
    if (!content?.content) return [];
    try {
      const parsedContent = JSON.parse(content.content);
      if (!isStructuredContent({ content: parsedContent })) return [];
      return parseContentToSlides(parsedContent);
    } catch {
      return [];
    }
  })[0];

  const title = content
    ? `${content.title} - ${questionType || "Mixed"} ${difficulty || "Mixed"} Questions`
    : "WIP";

  const handleGenerate = async () => {
    if (selectedSlideIndex === null && slides.length > 0) {
      alert("Please select a slide");
      return;
    }

    setIsGenerating(true);

    try {
      const examBank = await generateExamQuestionsMutation.mutateAsync({
        courseId: params.courseId,
        contentId: params.contentId,
        slideIndex: selectedSlideIndex !== null ? selectedSlideIndex + 1 : 1,
        specification: {
          type: questionType || undefined,
          difficulty: difficulty || undefined,
          questionType: questionCategory || undefined,
          totalQuestions: parseInt(totalQuestions),
          domain: domain || undefined,
          title,
          description,
        },
      });

      router.push(`/courses/${params.courseId}/exam-banks/${examBank.id}`);
    } catch (error) {
      console.error("Failed to generate exam questions:", error);
      alert("Failed to generate exam questions. Please try again.");
      setIsGenerating(false);
    }
  };

  if (courseLoading || contentLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!content || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-destructive">Content not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 pb-32 pt-24 sm:pt-32">
        <div className="mb-16">
          <Link
            href={`/courses/${params.courseId}/contents/${params.contentId}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </Link>
        </div>

        <div className="space-y-20">
          <div className="text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
              Generate Questions
            </h1>
            <p className="text-muted-foreground text-base">
              Create AI-powered exam questions for &ldquo;{content.title}&rdquo;
            </p>
          </div>

          {slides.length > 0 && (
            <div className="space-y-6">
              <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Select Content Slide
              </Label>
              <button
                onClick={() => setIsSlideSelectorOpen(true)}
                className="w-full group relative px-8 py-6 rounded-2xl border border-border/40 hover:border-border hover:bg-muted/40 transition-all duration-300 text-left flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-base text-foreground">
                    {selectedSlideIndex !== null
                      ? slides[selectedSlideIndex]?.heading || "Untitled"
                      : "Select a slide"}
                  </p>
                  <p className="text-sm text-muted-foreground/60 mt-1">
                    {selectedSlideIndex !== null
                      ? `Slide ${selectedSlideIndex + 1}`
                      : "Choose content to generate questions from"}
                  </p>
                </div>
                <ChevronDown className="w-5 h-5 text-muted-foreground/40 group-hover:text-foreground transition-colors ml-4" />
              </button>
            </div>
          )}

          <div className="grid gap-12">
            <div className="space-y-4">
              <Label
                htmlFor="questionType"
                className="text-sm font-medium text-muted-foreground uppercase tracking-wider"
              >
                Question Type
              </Label>
              <Select value={questionType} onValueChange={setQuestionType}>
                <SelectTrigger
                  id="questionType"
                  className="h-14 text-base px-6 border-border/40 rounded-xl"
                >
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((qt) => (
                    <SelectItem
                      key={qt.type}
                      value={qt.type}
                      className="text-base py-4"
                    >
                      {qt.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid sm:grid-cols-2 gap-12">
              <div className="space-y-4">
                <Label
                  htmlFor="difficulty"
                  className="text-sm font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Difficulty
                </Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger
                    id="difficulty"
                    className="h-14 text-base px-6 border-border/40 rounded-xl"
                  >
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy" className="text-base py-4">
                      Easy
                    </SelectItem>
                    <SelectItem value="medium" className="text-base py-4">
                      Medium
                    </SelectItem>
                    <SelectItem value="hard" className="text-base py-4">
                      Hard
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label
                  htmlFor="totalQuestions"
                  className="text-sm font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Number of Questions
                </Label>
                <Input
                  id="totalQuestions"
                  type="number"
                  min="1"
                  max="50"
                  value={totalQuestions}
                  onChange={(e) => setTotalQuestions(e.target.value)}
                  className="h-14 text-base px-6 border-border/40 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label
                htmlFor="questionCategory"
                className="text-sm font-medium text-muted-foreground uppercase tracking-wider"
              >
                Question Category
              </Label>
              <Select
                value={questionCategory}
                onValueChange={setQuestionCategory}
              >
                <SelectTrigger
                  id="questionCategory"
                  className="h-14 text-base px-6 border-border/40 rounded-xl"
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scenario" className="text-base py-4">
                    Scenario
                  </SelectItem>
                  <SelectItem value="definition" className="text-base py-4">
                    Definition
                  </SelectItem>
                  <SelectItem value="sequence" className="text-base py-4">
                    Sequence
                  </SelectItem>
                  <SelectItem value="identification" className="text-base py-4">
                    Identification
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label
                htmlFor="domain"
                className="text-sm font-medium text-muted-foreground uppercase tracking-wider"
              >
                Domain/Theme
              </Label>
              <Input
                id="domain"
                placeholder="e.g., Cloud Computing, AWS Services"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="h-14 text-base px-6 border-border/40 rounded-xl"
              />
            </div>

            <div className="space-y-4">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-muted-foreground uppercase tracking-wider"
              >
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Add a description for this exam bank..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="text-base px-6 py-4 resize-none border-border/40 rounded-xl"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 pt-8">
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/courses/${params.courseId}/contents/${params.contentId}`,
                )
              }
              className="flex-1 h-14 text-base border-border/40 hover:bg-muted/40"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1 h-14 text-base font-medium rounded-xl"
            >
              {isGenerating ? "Generating..." : "Generate Questions"}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isSlideSelectorOpen} onOpenChange={setIsSlideSelectorOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] p-0">
          <div className="p-8 border-b border-border/40">
            <DialogTitle className="text-xl font-semibold">
              Select a Slide
            </DialogTitle>
          </div>
          <div className="p-8 space-y-3 overflow-y-auto max-h-[65vh]">
            {slides.map((slide, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedSlideIndex(idx);
                  setIsSlideSelectorOpen(false);
                }}
                className={`w-full p-8 rounded-2xl border text-left transition-all hover:border-border hover:bg-muted/40 ${
                  selectedSlideIndex === idx
                    ? "border-foreground bg-muted/30"
                    : "border-border/30 bg-background"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                      Slide {idx + 1}
                    </div>
                    <div className="text-lg font-semibold text-foreground mb-3">
                      {slide.heading || "Untitled"}
                    </div>
                    {slide.intro && (
                      <div className="text-sm text-muted-foreground/70 leading-relaxed">
                        {slide.intro}
                      </div>
                    )}
                  </div>
                  {selectedSlideIndex === idx && (
                    <div className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-background"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isGenerating}>
        <DialogContent showCloseButton={false} className="max-w-md p-8">
          <div className="flex flex-col items-center gap-6 py-8">
            <Loader2 className="w-12 h-12 text-foreground animate-spin" />
            <div className="text-center space-y-2">
              <DialogTitle className="text-xl font-semibold">
                Generating Questions
              </DialogTitle>
              <p className="text-muted-foreground text-sm">
                Please wait or grab a{" "}
                <CoffeeIcon className="inline w-4 h-4 mx-1" /> meantime
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
