"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  CourseContent,
  CreateCourseContentParams,
} from "@/modules/course-content/course-content.types";
import { useBulkCreateCourseContentsMutation } from "@/modules/course-content/use-bulk-create-course-contents-mutation";
import { useCreateCourseContentMutation } from "@/modules/course-content/use-create-course-content-mutation";
import { useListCourseContentsQuery } from "@/modules/course-content/use-list-course-contents-query";
import { useIsUserCourseAuthor } from "@/modules/course/use-is-user-course-author";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  Plus,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ContentTabProps {
  courseId: string;
  chapters: Array<{ id: string; name: string; number?: number }>;
}

interface ParsedContent extends CreateCourseContentParams {
  chapter?: string;
  chapterNumber?: number;
  error?: string;
}

export function ContentTab({ courseId, chapters }: ContentTabProps) {
  const queryClient = useQueryClient();

  const isAuthor = useIsUserCourseAuthor(courseId);

  const { data: contents, isLoading } = useListCourseContentsQuery(courseId);
  const createContentMutation = useCreateCourseContentMutation();
  const bulkCreateContentMutation = useBulkCreateCourseContentsMutation();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [parsedContents, setParsedContents] = useState<ParsedContent[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [newContent, setNewContent] = useState<CreateCourseContentParams>({
    courseId,
    title: "",
    description: "",
    content: "",
    contentVaraints: ["text"],
    chapterId: "",
    order: 0,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading contents...</div>
      </div>
    );
  }

  const handleAddContent = async () => {
    try {
      await createContentMutation.mutateAsync(newContent);
      setAddDialogOpen(false);
      setNewContent({
        courseId,
        title: "",
        description: "",
        content: "",
        contentVaraints: ["text"],
        chapterId: "",
        order: 0,
      });
    } catch (error) {
      console.error("Failed to create content:", error);
    }
  };

  const parseChapterId = (
    chapterInput: string | number | undefined
  ): string | undefined => {
    if (!chapterInput) return undefined;

    const inputStr = String(chapterInput).trim().toLowerCase();

    for (const chapter of chapters) {
      if (chapter.id === inputStr) {
        return chapter.id;
      }
    }

    const selectedChapter = chapters?.[parseInt(inputStr) - 1];

    if (selectedChapter) {
      return selectedChapter?.id;
    }
    return undefined;
  };

  const validateParsedContents = (
    items: ParsedContent[]
  ): { valid: ParsedContent[]; errors: string[] } => {
    const valid: ParsedContent[] = [];
    const errors: string[] = [];

    items.forEach((item, index) => {
      if (!item.title) {
        errors.push(`Row ${index + 1}: Missing title`);
        return;
      }

      const chapterId =
        item.chapterId || parseChapterId(item.chapter || item.chapterNumber);

      if (!chapterId && (item.chapter || item.chapterNumber)) {
        errors.push(
          `Row ${index + 1}: Could not find chapter "${item.chapter || item.chapterNumber}"`
        );
        return;
      }

      valid.push({
        ...item,
        courseId,
        chapterId,
      });
    });

    return { valid, errors };
  };

  const parseCSV = (text: string): ParsedContent[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
    const items: ParsedContent[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i]
        .split(",")
        .map((v) => v.trim().replace(/^['"]|['"]$/g, ""));
      const item: any = {};

      headers.forEach((header, index) => {
        item[header] = values[index] || "";
      });

      items.push({
        courseId,
        title: item.title || "",
        description: item.description || "",
        content: item.content || "",
        chapter: item.chapter || item.chaptername || "",
        chapterNumber: item.chapternumber || item.chapter_number || "",
        contentVaraints:
          item.contentvariants || item.content_variants
            ? item.contentvariants.split("|").map((v: string) => v.trim())
            : ["text"],
        order: item.order ? parseInt(item.order, 10) : i,
      });
    }

    return items;
  };

  const parseJSON = (text: string): ParsedContent[] => {
    try {
      const data = JSON.parse(text);
      const items = Array.isArray(data) ? data : data.contents || [];

      return items.map((item: any, index: number) => ({
        courseId,
        title: item.title || "",
        description: item.description || "",
        content: item.content || "",
        chapter: item.chapter || item.chapterName || item.chapter_name || "",
        chapterNumber: item.chapterNumber || item.chapter_number || "",
        contentVaraints:
          item.contentVariants || item.content_variants
            ? Array.isArray(item.contentVariants)
              ? item.contentVariants
              : item.contentVariants.split("|")
            : ["text"],
        order: item.order || index,
      }));
    } catch {
      return [];
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      let items: ParsedContent[] = [];

      if (file.name.endsWith(".csv")) {
        items = parseCSV(text);
      } else if (file.name.endsWith(".json")) {
        items = parseJSON(text);
      }

      const { valid, errors } = validateParsedContents(items);
      setParsedContents(valid);
      setUploadErrors(errors);

      if (valid.length > 0 || errors.length > 0) {
        setVerifyDialogOpen(true);
        setBulkDialogOpen(false);
      }
    };
    reader.readAsText(file);
  };

  const handleBulkCreate = async () => {
    try {
      await bulkCreateContentMutation.mutateAsync({
        courseId,
        contents: parsedContents,
      });
      setVerifyDialogOpen(false);
      setParsedContents([]);
      setUploadErrors([]);
    } catch (error) {
      console.error("Failed to bulk create contents:", error);
    }
  };

  const downloadCSV = () => {
    if (!contents || contents.length === 0) return;

    const headers = [
      "title",
      "description",
      "content",
      "chapter",
      "chapterNumber",
      "contentVariants",
      "order",
    ];
    const rows = contents.map((c) => [
      `"${c.title}"`,
      `"${c.description || ""}"`,
      `"${c.content || ""}"`,
      `"${c.chapterId || ""}"`,
      "",
      `"${c.contentVaraints?.join("|") || "text"}"`,
      c.order,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contents-${courseId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    if (!contents || contents.length === 0) return;

    const data = contents.map((c) => ({
      title: c.title,
      description: c.description,
      content: c.content,
      chapter: c.chapterId,
      contentVariants: c.contentVaraints,
      order: c.order,
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contents-${courseId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between py-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Course Contents
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {contents?.length || 0} content{contents?.length !== 1 ? "s" : ""}
          </p>
        </div>
        {contents && contents.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadCSV}
              className="rounded-full gap-2"
            >
              <Download className="size-3.5" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadJSON}
              className="rounded-full gap-2"
            >
              <Download className="size-3.5" />
              JSON
            </Button>
          </div>
        )}
      </div>

      {!contents || contents.length === 0 ? (
        <EmptyState
          onAddSingle={() => setAddDialogOpen(true)}
          onBulkUpload={() => setBulkDialogOpen(true)}
        />
      ) : (
        <>
          <ContentList contents={contents} chapters={chapters} />
          {isAuthor && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-8">
              <Button
                onClick={() => setAddDialogOpen(true)}
                className="rounded-full gap-2"
              >
                <Plus className="size-4" />
                Add more content
              </Button>
              <Button
                variant="outline"
                onClick={() => setBulkDialogOpen(true)}
                className="rounded-full gap-2"
              >
                <Upload className="size-4" />
                Bulk add more content
              </Button>
            </div>
          )}
        </>
      )}

      <AddContentDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        content={newContent}
        onChange={setNewContent}
        onSubmit={handleAddContent}
        isPending={createContentMutation.isPending}
        chapters={chapters}
      />

      <BulkUploadDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        onFileUpload={handleFileUpload}
      />

      <VerifyDialog
        open={verifyDialogOpen}
        onOpenChange={setVerifyDialogOpen}
        contents={parsedContents}
        errors={uploadErrors}
        onConfirm={handleBulkCreate}
        isPending={bulkCreateContentMutation.isPending}
      />
    </div>
  );
}

function EmptyState({
  onAddSingle,
  onBulkUpload,
}: {
  onAddSingle: () => void;
  onBulkUpload: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6">
      <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-6">
        <FileText className="size-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        No content yet
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-8">
        Add your first piece of content to get started with your course
        materials.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onAddSingle} className="rounded-full gap-2">
          <Plus className="size-4" />
          Add content
        </Button>
        <Button
          variant="outline"
          onClick={onBulkUpload}
          className="rounded-full gap-2"
        >
          <Upload className="size-4" />
          Bulk upload
        </Button>
      </div>
    </div>
  );
}

function ContentList({
  contents,
  chapters,
}: {
  contents: CourseContent[];
  chapters: Array<{ id: string; name: string; number?: number }>;
}) {
  return (
    <div className="space-y-4">
      {contents.map((content) => (
        <ContentCard
          key={content.id}
          content={content}
          courseId={content.courseId}
          chapters={chapters}
        />
      ))}
    </div>
  );
}

function ContentCard({
  content,
  courseId,
  chapters,
}: {
  content: CourseContent;
  courseId: string;
  chapters: Array<{ id: string; name: string; number?: number }>;
}) {
  const chapter = chapters.find((ch) => ch.id === content.chapterId);

  return (
    <div className="p-6 bg-card border border-border rounded-2xl hover:border-border/80 transition-all">
      <div className="flex items-start justify-between gap-4">
        <Link
          href={`/courses/${courseId}/contents/${content.id}`}
          className="flex-1 space-y-2"
        >
          {chapter && (
            <div className="text-xs font-medium text-primary">
              {chapter.number
                ? `Chapter ${chapter.number}: ${chapter.name}`
                : chapter.name}
            </div>
          )}
          <h3 className="text-base font-semibold text-foreground hover:text-primary/80 transition-colors">
            {content.title}
          </h3>
          {content.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {content.description}
            </p>
          )}
          <div className="flex items-center gap-2 pt-1">
            {content.contentVaraints?.map((variant) => (
              <span
                key={variant}
                className="px-2.5 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground capitalize"
              >
                {variant}
              </span>
            ))}
            <span className="text-xs text-muted-foreground">
              Order: {content.order}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}

function AddContentDialog({
  open,
  onOpenChange,
  content,
  onChange,
  onSubmit,
  isPending,
  chapters,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: CreateCourseContentParams;
  onChange: (content: CreateCourseContentParams) => void;
  onSubmit: () => void;
  isPending: boolean;
  chapters: Array<{ id: string; name: string }>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-xl">Add Content</DialogTitle>
          <DialogDescription className="text-base">
            Create a new piece of content for your course.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="Enter content title"
              value={content.title}
              onChange={(e) => onChange({ ...content, title: e.target.value })}
              className="h-11"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Description</label>
            <Input
              placeholder="Enter content description"
              value={content.description || ""}
              onChange={(e) =>
                onChange({ ...content, description: e.target.value })
              }
              className="h-11"
            />
          </div>

          {chapters.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Chapter</label>
              <select
                value={content.chapterId || ""}
                onChange={(e) =>
                  onChange({
                    ...content,
                    chapterId: e.target.value || undefined,
                  })
                }
                className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">No chapter</option>
                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-sm font-medium">Content</label>
            <textarea
              placeholder="Enter content..."
              value={content.content || ""}
              onChange={(e) =>
                onChange({ ...content, content: e.target.value })
              }
              className="w-full min-h-[120px] px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Order</label>
            <Input
              type="number"
              placeholder="Enter order"
              value={content.order || 0}
              onChange={(e) =>
                onChange({ ...content, order: parseInt(e.target.value) || 0 })
              }
              className="h-11"
            />
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!content.title || isPending}>
            {isPending ? "Adding..." : "Add content"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BulkUploadDialog({
  open,
  onOpenChange,
  onFileUpload,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-xl">Bulk Upload Content</DialogTitle>
          <DialogDescription className="text-base">
            Upload multiple contents at once using a CSV or JSON file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-border/80 transition-colors">
            <Upload className="size-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-foreground mb-2">
              Drop your file here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Supports CSV and JSON files
            </p>
            <input
              type="file"
              accept=".csv,.json"
              onChange={onFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-foreground text-background hover:opacity-90 cursor-pointer"
            >
              Choose file
            </label>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">CSV Format:</p>
            <div className="p-4 bg-muted rounded-lg">
              <code>
                <p className="text-xs text-muted-foreground overflow-x">
                  title, description, content, chapter, chapterNumber,
                  contentVariants, order
                </p>
              </code>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VerifyDialog({
  open,
  onOpenChange,
  contents,
  errors,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contents: ParsedContent[];
  errors: string[];
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-xl">Review & Confirm</DialogTitle>
          <DialogDescription className="text-base">
            Please review the parsed contents before creating them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {errors.length > 0 && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="size-4" />
                <span className="text-sm font-medium">Errors found</span>
              </div>
              <ul className="space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-xs text-destructive pl-6">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {contents.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-foreground">
                <CheckCircle2 className="size-4 text-green-600" />
                <span className="text-sm font-medium">
                  {contents.length} content{contents.length !== 1 ? "s" : ""}{" "}
                  ready to create
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {contents.map((content, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted rounded-xl text-sm space-y-1"
                  >
                    <div className="font-medium text-foreground">
                      {content.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {content.description || "No description"}
                    </div>
                    {content.chapterId && (
                      <div className="text-xs text-muted-foreground">
                        Chapter: {content.chapterId}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={contents.length === 0 || isPending}
            className="gap-2"
          >
            {isPending ? (
              "Creating..."
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                Confirm & create {contents.length} content
                {contents.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
