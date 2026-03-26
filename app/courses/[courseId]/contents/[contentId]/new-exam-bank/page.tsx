"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { CoffeeIcon, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewExamBankPage() {
  const params = useParams<{
    courseId: string;
    contentId: string;
  }>();
  const router = useRouter();

  const { data: course, isLoading: courseLoading } = useGetCourseQuery(
    params.courseId
  );
  const { data: content, isLoading: contentLoading } = useGetCourseContentQuery(
    params.courseId,
    params.contentId
  );

  const generateExamQuestionsMutation = useGenerateExamQuestionsMutation();

  const [questionType, setQuestionType] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [questionCategory, setQuestionCategory] = useState<string>("");
  const [totalQuestions, setTotalQuestions] = useState<string>("10");
  const [domain, setDomain] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const title = content
    ? `${content.title} - ${questionType || "Mixed"} ${difficulty || "Mixed"} Questions`
    : "WIP";

  const handleGenerate = async () => {
    if (!questionType && !difficulty && !questionCategory) {
      alert("Please select at least one specification option");
      return;
    }

    setIsGenerating(true);

    try {
      const examBank = await generateExamQuestionsMutation.mutateAsync({
        courseId: params.courseId,
        contentId: params.contentId,
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
      <div className="max-w-4xl mx-auto sm:px-6 px-0 pb-24 lg:pb-32 pt-6">
        <div className="mb-8">
          <Link
            href={`/courses/${params.courseId}/contents/${params.contentId}`}
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Content
          </Link>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Generate Exam Questions
            </h1>
            <p className="text-muted-foreground mt-2">
              Configure and generate exam questions for &ldquo;{content.title}
              &rdquo;
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Question Specifications</CardTitle>
              <CardDescription>
                Select the type, difficulty, and other parameters for the
                questions you want to generate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="questionType">Question Type</Label>
                  <Select value={questionType} onValueChange={setQuestionType}>
                    <SelectTrigger id="questionType">
                      <SelectValue placeholder="Select question type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any type</SelectItem>
                      {QUESTION_TYPES.map((qt) => (
                        <SelectItem key={qt.type} value={qt.type}>
                          {qt.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any difficulty</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="questionCategory">Question Category</Label>
                  <Select
                    value={questionCategory}
                    onValueChange={setQuestionCategory}
                  >
                    <SelectTrigger id="questionCategory">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any category</SelectItem>
                      <SelectItem value="scenario">Scenario</SelectItem>
                      <SelectItem value="definition">Definition</SelectItem>
                      <SelectItem value="sequence">Sequence</SelectItem>
                      <SelectItem value="identification">
                        Identification
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalQuestions">Number of Questions</Label>
                  <Input
                    id="totalQuestions"
                    type="number"
                    min="1"
                    max="50"
                    value={totalQuestions}
                    onChange={(e) => setTotalQuestions(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain">Domain/Theme (Optional)</Label>
                <Input
                  id="domain"
                  placeholder="e.g., Cloud Computing, AWS Services"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Add a specific theme or domain context to the questions
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add a description for this exam bank..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/courses/${params.courseId}/contents/${params.contentId}`
                )
              }
            >
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate Questions"}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isGenerating}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Exam Questions
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-muted-foreground flex">
            <span>Please wait or grab a </span>
            <span className="px-2">
              <CoffeeIcon />
            </span>
            <span>at the meantime</span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
