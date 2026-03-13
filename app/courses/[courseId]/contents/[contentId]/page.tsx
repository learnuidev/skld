"use client";

import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import { useAutoSizeTextarea } from "@/hooks/ui/use-auto-size-textarea";
import { useGetCourseContentQuery } from "@/modules/course-content/use-get-course-content-query";
import { useUpdateCourseContentMutation } from "@/modules/course-content/use-update-course-content-mutation";
import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import { useIsUserCourseAuthor } from "@/modules/course/use-is-user-course-author";
import { useCreateKnowledgeGraphMutation } from "@/modules/knowledge-graph/use-create-knowledge-graph-mutation";
import { useGetKnowledgeGraphQuery } from "@/modules/knowledge-graph/use-get-knowledge-graph-query";
import { fetchAuthSession } from "aws-amplify/auth";
import { ArrowLeft, Clock, Edit2, Plus, Save, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ContentPage() {
  const params = useParams<{ courseId: string; contentId: string }>();
  const { data: course, isLoading: courseLoading } = useGetCourseQuery(
    params.courseId
  );
  const { data: content, isLoading: contentLoading } = useGetCourseContentQuery(
    params.courseId,
    params.contentId
  );
  const updateContentMutation = useUpdateCourseContentMutation(
    params.courseId,
    params.contentId
  );

  const sk = `CONTENT_${params.contentId}`;

  console.log("YOOO", sk);
  const { data: knowledgeGraph, isLoading: kgLoading } =
    useGetKnowledgeGraphQuery(sk);
  const createKnowledgeGraphMutation = useCreateKnowledgeGraphMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [editorContent, setEditorContent] = useState(content?.content || "");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editChapterId, setEditChapterId] = useState<string>("");

  const textareaRef = useAutoSizeTextarea(editDescription);

  const isLoading = courseLoading || contentLoading || kgLoading;

  const isAuthor = useIsUserCourseAuthor(params.courseId);

  const chapters = course?.domains?.flatMap((d) => d.chapters) || [];

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const session = await fetchAuthSession();
        const userId = session?.tokens?.idToken?.payload?.sub as string;
      } catch (error) {
        console.error("Failed to get current user:", error);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (content?.content) {
      setEditorContent(content?.content);
    }
  }, [content?.content]);

  const handleEdit = () => {
    setEditorContent(content?.content || "");
    setEditTitle(content?.title || "");
    setEditDescription(content?.description || "");
    setEditChapterId(content?.chapterId || "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditorContent(content?.content || "");
    setEditTitle(content?.title || "");
    setEditDescription(content?.description || "");
    setEditChapterId(content?.chapterId || "");
  };

  const handleSave = async () => {
    try {
      await updateContentMutation.mutateAsync({
        title: editTitle,
        description: editDescription,
        content: editorContent,
        chapterId: editChapterId || undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update content:", error);
    }
  };

  const handleCreateKnowledgeGraph = async () => {
    try {
      await createKnowledgeGraphMutation.mutateAsync({
        courseId: params.courseId,
        contentId: params.contentId,
      });
    } catch (error) {
      console.error("Failed to create knowledge graph:", error);
    }
  };

  if (isLoading) {
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
      <div className="px-0 pb-16 lg:pb-24">
        <div className="mb-16 flex items-center justify-between">
          <Link
            href={`/courses/${params.courseId}`}
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Link>

          <div className="flex gap-4 items-center">
            {isAuthor && (
              <div className="flex justify-end">
                {knowledgeGraph?.status === "completed" &&
                knowledgeGraph.knowledgeGraphData ? (
                  <Button asChild className="rounded-full gap-2">
                    <Link
                      href={`/courses/${params.courseId}/contents/${params.contentId}/knowledge-graph`}
                    >
                      View Knowledge Graph
                    </Link>
                  </Button>
                ) : (
                  <Button
                    onClick={handleCreateKnowledgeGraph}
                    disabled={createKnowledgeGraphMutation.isPending}
                    className="rounded-full gap-2"
                    variant={"outline"}
                  >
                    {createKnowledgeGraphMutation.isPending ? (
                      <>
                        <Clock className="size-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="size-4" />
                        Add Knowledge Graph
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {isAuthor ? (
              !isEditing ? (
                <Button
                  onClick={handleEdit}
                  className="shrink-0 rounded-xl border border-border hover:border-foreground/20 hover:bg-accent flex items-center justify-center transition-all"
                  title="Edit content"
                  variant={"ghost"}
                >
                  <Edit2 className="w-5 h-5 text-muted-foreground" />
                </Button>
              ) : (
                <button
                  onClick={handleCancel}
                  disabled={updateContentMutation.isPending}
                  className="shrink-0 w-12 h-12 rounded-xl border border-border hover:border-foreground/20 hover:bg-accent flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              )
            ) : null}
          </div>
        </div>

        <div className="space-y-8">
          <header className="space-y-6 sm:mb-16 mb-12">
            {isEditing ? (
              <>
                {chapters.length > 0 && (
                  <select
                    value={editChapterId}
                    onChange={(e) => setEditChapterId(e.target.value)}
                    className="h-12 px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">No chapter</option>
                    {chapters.map((chapter) => (
                      <option key={chapter.id} value={chapter.id}>
                        {chapter.name}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-4xl lg:text-5xl font-semibold tracking-tight text-foreground text-balance leading-[1.15] bg-transparent outline-none placeholder:text-muted-foreground/50"
                  placeholder="Content title"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full text-lg text-muted-foreground leading-relaxed max-w-2xl bg-transparent outline-none resize-none placeholder:text-muted-foreground/50 h-auto"
                  placeholder="Add a description..."
                  // rows={2}
                  ref={textareaRef}
                />
              </>
            ) : (
              <>
                {content.chapterId &&
                  chapters.length > 0 &&
                  (() => {
                    const chapter = chapters.find(
                      (ch) => ch.id === content.chapterId
                    );
                    return chapter ? (
                      <div className="text-xs font-medium text-primary">
                        {chapter.name}
                      </div>
                    ) : null;
                  })()}
                <h1 className="text-3xl lg:text-5xl font-semibold tracking-tight text-foreground text-balance leading-[1.15]">
                  {content.title}
                </h1>

                {content.description && (
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                    {content.description}
                  </p>
                )}
              </>
            )}
          </header>

          {isAuthor &&
            knowledgeGraph &&
            knowledgeGraph.status !== "completed" && (
              <div className="p-4 bg-muted border border-border rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={
                        knowledgeGraph.status === "failed"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }
                    >
                      {knowledgeGraph.status === "failed" ? (
                        <X className="size-4" />
                      ) : (
                        <Clock className="size-4 animate-spin" />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Knowledge Graph Status
                      </p>
                      <p
                        className={`text-xs ${
                          knowledgeGraph.status === "failed"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {knowledgeGraph.status === "failed"
                          ? "Failed"
                          : knowledgeGraph.status === "processing"
                            ? "Processing"
                            : "Pending"}
                      </p>
                    </div>
                  </div>
                  {knowledgeGraph.error && (
                    <p className="text-xs text-red-600 max-w-md truncate">
                      {knowledgeGraph.error}
                    </p>
                  )}
                </div>
                {knowledgeGraph.knowledgeGraphData && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Generated:{" "}
                      {new Date(knowledgeGraph.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}

          <div>
            <TiptapEditor
              content={editorContent}
              editable={isAuthor && isEditing}
              onUpdate={setEditorContent}
            />
          </div>

          {isEditing && (
            <div className="sticky bottom-6 z-10">
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={updateContentMutation.isPending}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-foreground text-background rounded-xl text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  {updateContentMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          <div className="pt-12">
            <div className="h-px bg-border/60" />
          </div>

          <footer className="space-y-4">
            <p className="text-sm text-muted-foreground">{course.title}</p>
            <p className="text-xs text-muted-foreground/60">
              Last updated{" "}
              {new Date(content.updatedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
