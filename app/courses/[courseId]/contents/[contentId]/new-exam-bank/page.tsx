"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetCourseContentQuery } from "@/modules/course-content/use-get-course-content-query";
import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import { useGenerateExamQuestionsMutation } from "@/modules/exam-bank/use-generate-exam-questions-mutation";
import { QUESTION_TYPES } from "@/modules/exam-bank/exam-bank.types";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useState } from "react";
import { CoffeeIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  parseContentToSlides,
  isStructuredContent,
  ParsedSlide,
  ContentNode,
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

  const selectedDomain = course?.domains?.find((domain) =>
    domain.chapters?.find((chapter) => chapter.id === content?.chapterId),
  );

  const generateExamQuestionsMutation = useGenerateExamQuestionsMutation();

  const [questionType, setQuestionType] = useState<string>(
    "SINGLE_SELECT_MULTIPLE_CHOICE",
  );
  const [difficulty, setDifficulty] = useState<string>("hard");
  const [questionCategory, setQuestionCategory] = useState<string>("scenario");
  const [totalQuestions, setTotalQuestions] = useState<string>("10");
  const [domain, setDomain] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("general");
  const [previewSlideIndex, setPreviewSlideIndex] = useState<number | null>(
    null,
  );

  const slides = (() => {
    return parseContentToSlides(content?.content?.content || []);
  })();

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

  console.log("selectedSlideIndex", selectedSlideIndex);

  const handleGenerate = async () => {
    if (!title.trim()) {
      setActiveTab("general");
      return;
    }

    setIsGenerating(true);

    try {
      const examBank = await generateExamQuestionsMutation.mutateAsync({
        courseId: params.courseId,
        contentId: params.contentId,
        domainId: selectedDomain?.id,
        slideIndex: selectedSlideIndex !== null ? selectedSlideIndex + 1 : null,
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

      router.push(
        `/courses/${params.courseId}/contents/${params.contentId}/exam-bank/${examBank.id}/options`,
      );
    } catch (error) {
      console.error("Failed to generate exam questions:", error);
      alert("Failed to generate exam questions. Please try again.");
      setIsGenerating(false);
    }
  };

  const renderSlideContent = (slide: ParsedSlide) => {
    const renderNode = (node: ContentNode): React.ReactNode => {
      if (node.type === "paragraph") {
        const text =
          node.content?.map((c) => c.text).join("") || node.text || "";
        if (!text.trim()) return null;
        return (
          <p className="text-base leading-relaxed text-foreground/90">{text}</p>
        );
      }

      if (node.type === "heading" && node.attrs?.level) {
        const text =
          node.content?.map((c) => c.text).join("") || node.text || "";
        const level = node.attrs.level;
        const fontSize =
          level === 1 ? "text-2xl" : level === 2 ? "text-xl" : "text-lg";
        return (
          <h2
            className={`font-semibold text-foreground ${fontSize} tracking-tight mb-6`}
          >
            {text}
          </h2>
        );
      }

      if (node.type === "bulletList") {
        return (
          <ul className="space-y-4 mb-6">
            {node.content?.map((item, idx) => (
              <li
                key={idx}
                className="text-base text-foreground/90 leading-relaxed flex items-start gap-3"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 flex-shrink-0 mt-2" />
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
          <blockquote className="border-l-4 border-foreground/20 pl-6 my-6 italic text-foreground/60 text-base">
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

    return (
      <div className="space-y-6">
        {slide.heading && (
          <div className="text-xl font-semibold text-foreground">
            {slide.heading}
          </div>
        )}
        {slide.intro && (
          <p className="text-base text-foreground/70 leading-relaxed">
            {slide.intro}
          </p>
        )}
        {slide.content?.map((node, idx) => (
          <div key={idx}>{renderNode(node)}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 pb-32 pt-24 sm:pt-32">
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

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList
              variant="line"
              className="w-full justify-start mb-12 border-b border-border/40"
            >
              <TabsTrigger value="general" className="text-base pb-3">
                General
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-base pb-3">
                Question Settings
              </TabsTrigger>
              <TabsTrigger value="content" className="text-base pb-3">
                Content
              </TabsTrigger>
              <TabsTrigger value="review" className="text-base pb-3">
                Review
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-8 space-y-12">
              <div className="space-y-4">
                <Label
                  htmlFor="title"
                  className="text-sm font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Title
                </Label>
                <Input
                  id="title"
                  placeholder="Enter exam bank title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                  rows={4}
                  className="text-base px-6 py-4 resize-none border-border/40 rounded-xl"
                />
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-8 space-y-12">
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
                    <SelectItem
                      value="identification"
                      className="text-base py-4"
                    >
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
            </TabsContent>

            <TabsContent value="content" className="mt-8">
              {slides.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  No slides available
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-4">
                      <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Slides ({slides.length})
                      </Label>
                      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                        {slides.map((slide, idx) => (
                          <button
                            key={idx}
                            onClick={() => setPreviewSlideIndex(idx)}
                            className={`w-full p-6 rounded-xl border text-left transition-all hover:border-border hover:bg-muted/40 ${
                              previewSlideIndex === idx
                                ? "border-foreground bg-muted/30"
                                : "border-border/30 bg-background"
                            }`}
                          >
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                              Slide {idx + 1}
                            </div>
                            <div className="text-base font-semibold text-foreground truncate">
                              {slide.heading || "Untitled"}
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="pt-4">
                        <Button
                          onClick={() => {
                            setSelectedSlideIndex(previewSlideIndex);
                            setActiveTab("review");
                          }}
                          disabled={previewSlideIndex === null}
                          className="w-full h-12 rounded-xl"
                        >
                          Select This Slide
                        </Button>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      {previewSlideIndex !== null &&
                      slides[previewSlideIndex] ? (
                        <div className="bg-muted/20 rounded-2xl p-8 min-h-[500px]">
                          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
                            Slide {previewSlideIndex + 1}
                          </div>
                          {renderSlideContent(slides[previewSlideIndex])}
                        </div>
                      ) : (
                        <div className="bg-muted/20 rounded-2xl p-8 min-h-[500px] flex items-center justify-center text-muted-foreground">
                          Select a slide to preview
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="review" className="mt-8">
              <div className="space-y-12">
                <div className="bg-muted/20 rounded-2xl p-8 space-y-8">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                      Title
                    </div>
                    <div className="text-xl font-semibold text-foreground">
                      {title || "Not set"}
                    </div>
                  </div>

                  {description && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        Description
                      </div>
                      <div className="text-base text-foreground/80">
                        {description}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="bg-muted/20 rounded-2xl p-8">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                      Question Type
                    </div>
                    <div className="text-base font-semibold text-foreground">
                      {QUESTION_TYPES.find((qt) => qt.type === questionType)
                        ?.title || "Not set"}
                    </div>
                  </div>

                  <div className="bg-muted/20 rounded-2xl p-8">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                      Difficulty
                    </div>
                    <div className="text-base font-semibold text-foreground capitalize">
                      {difficulty || "Not set"}
                    </div>
                  </div>

                  <div className="bg-muted/20 rounded-2xl p-8">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                      Number of Questions
                    </div>
                    <div className="text-base font-semibold text-foreground">
                      {totalQuestions}
                    </div>
                  </div>

                  <div className="bg-muted/20 rounded-2xl p-8">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                      Question Category
                    </div>
                    <div className="text-base font-semibold text-foreground capitalize">
                      {questionCategory || "Not set"}
                    </div>
                  </div>

                  {domain && (
                    <div className="bg-muted/20 rounded-2xl p-8 sm:col-span-2">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        Domain/Theme
                      </div>
                      <div className="text-base font-semibold text-foreground">
                        {domain}
                      </div>
                    </div>
                  )}

                  {selectedSlideIndex !== null &&
                    slides[selectedSlideIndex] && (
                      <div className="bg-muted/20 rounded-2xl p-8 sm:col-span-2">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                          Selected Content
                        </div>
                        <div className="space-y-2">
                          <div className="text-base font-semibold text-foreground">
                            Slide {selectedSlideIndex + 1}:{" "}
                            {slides[selectedSlideIndex].heading || "Untitled"}
                          </div>
                          {slides[selectedSlideIndex].intro && (
                            <div className="text-sm text-foreground/70 line-clamp-2">
                              {slides[selectedSlideIndex].intro}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

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
