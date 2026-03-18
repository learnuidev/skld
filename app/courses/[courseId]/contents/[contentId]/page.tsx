"use client";

import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { FloatingMenu } from "@/components/floating-menu";
import { KnowledgeGraphStatus } from "@/components/knowledge-graph/knowledge-graph-status";
import { useAutoSizeTextarea } from "@/hooks/ui/use-auto-size-textarea";
import { useGetCourseContentQuery } from "@/modules/course-content/use-get-course-content-query";
import { useListCourseContentsQuery } from "@/modules/course-content/use-list-course-contents-query";
import { useUpdateCourseContentMutation } from "@/modules/course-content/use-update-course-content-mutation";
import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import { useIsUserCourseAuthor } from "@/modules/course/use-is-user-course-author";
import { useCreateKnowledgeGraphMutation } from "@/modules/knowledge-graph/use-create-knowledge-graph-mutation";
import { useGetKnowledgeGraphQuery } from "@/modules/knowledge-graph/use-get-knowledge-graph-query";
import { useRetryKnowledgeGraphMutation } from "@/modules/knowledge-graph/use-retry-knowledge-graph-mutation";
import { useSkldMutation } from "@/modules/skld/use-skld-mutation";
import { ContentRecommendation } from "@/modules/skld/skld.types";
import { fetchAuthSession } from "aws-amplify/auth";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGetUserContentStatsQuery } from "@/modules/user-content-stats/use-get-user-content-stats-query";

export default function ContentPage() {
  const params = useParams<{ courseId: string; contentId: string }>();
  const { data: course, isLoading: courseLoading } = useGetCourseQuery(
    params.courseId
  );
  const { data: content, isLoading: contentLoading } = useGetCourseContentQuery(
    params.courseId,
    params.contentId
  );
  const { data: contents } = useListCourseContentsQuery(params.courseId);
  const updateContentMutation = useUpdateCourseContentMutation(
    params.courseId,
    params.contentId
  );

  const { data: knowledgeGraph, isLoading: kgLoading } =
    useGetKnowledgeGraphQuery({ contentId: params.contentId });
  const createKnowledgeGraphMutation = useCreateKnowledgeGraphMutation();
  const retryKnowledgeGraphMutation = useRetryKnowledgeGraphMutation();

  const { data: userContentStats } = useGetUserContentStatsQuery(
    params.courseId,
    params.contentId
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editorContent, setEditorContent] = useState(content?.content || "");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editChapterId, setEditChapterId] = useState<string>("");
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [showTimeSpent, setShowTimeSpent] = useState(false);
  const [recommendations, setRecommendations] = useState<
    ContentRecommendation[] | null
  >(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const skldMutation = useSkldMutation();

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setStartTime(Date.now());
    setShowTimeSpent(false);
    setTimeout(() => setShowTimeSpent(true), 2000);
  }, [params.contentId]);

  const handleNext = async () => {
    try {
      const timespent = Math.floor((Date.now() - startTime) / 1000);

      const result = await skldMutation.mutateAsync({
        contentId: params.contentId,
        enrollmentId: params.courseId,
        metadata: { timespent },
      });

      setRecommendations(result.recommendations);
      setShowRecommendations(true);
      setStartTime(Date.now());
    } catch (error) {
      console.error("Failed to submit skld request:", error);
    }
  };

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

  const handleRetryKnowledgeGraph = async () => {
    if (!knowledgeGraph?.sk) return;
    try {
      await retryKnowledgeGraphMutation.mutateAsync(knowledgeGraph.sk);
    } catch (error) {
      console.error("Failed to retry knowledge graph:", error);
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
    <div className="min-h-screen bg-background mt-24">
      {showTimeSpent && (
        <div className="fixed top-0 left-0 right-0 z-50 py-4 bg-background/95 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto sm:px-6 px-4 py-2 flex justify-between">
            <div className="text-sm text-muted-foreground flex gap-2 items-end">
              <Clock />{" "}
              <span>{Math.floor((currentTime - startTime) / 1000)}s</span>
            </div>

            <div>
              <div className="text-sm text-muted-foreground flex gap-2 items-end">
                <Eye />
                <span>
                  {userContentStats?.userContentStat?.metadata?.timesRead}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto sm:px-6 px-0 pb-24 lg:pb-32 pt-6">
        <div className="mb-16 flex items-center justify-between">
          <Link
            href={`/courses/${params.courseId}`}
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Link>
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

          {showRecommendations && recommendations && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Recommended Content</h2>
              <div className="grid gap-3">
                {recommendations.map((rec) => (
                  <Link
                    key={rec.contentId}
                    href={`/courses/${params.courseId}/contents/${rec.contentId}`}
                    onClick={() => {
                      setShowRecommendations(false);
                    }}
                    className="flex items-start gap-3 p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">
                        {rec.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {rec.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>
                          Read {rec.timesRead} time
                          {rec.timesRead !== 1 ? "s" : ""}
                        </span>
                        <span>{rec.totalTimeSpent}s total</span>
                        <span>
                          Last read{" "}
                          {rec.contentLastReviewed === 0
                            ? "never"
                            : `${rec.contentLastReviewed} day${rec.contentLastReviewed !== 1 ? "s" : ""} ago`}
                        </span>
                      </div>
                    </div>
                    {rec.isRecommended && (
                      <div className="flex items-center gap-1 text-xs font-medium text-primary">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Recommended</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <KnowledgeGraphStatus
            knowledgeGraph={knowledgeGraph}
            viewKnowledgeGraphLink={`/courses/${params.courseId}/contents/${params.contentId}/knowledge-graph`}
            showCompletedStatus={true}
            isAuthor={isAuthor}
            onGenerateKnowledgeGraph={handleCreateKnowledgeGraph}
            isGenerating={createKnowledgeGraphMutation.isPending}
            onRetryKnowledgeGraph={handleRetryKnowledgeGraph}
            isRetrying={retryKnowledgeGraphMutation.isPending}
          />

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

      {showTimeSpent && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border/60">
          <div className="max-w-4xl mx-auto sm:px-6 px-4 py-3 relative">
            <div className="flex justify-between items-center">
              {isAuthor && (
                <FloatingMenu
                  courseId={params.courseId}
                  contentId={params.contentId}
                  contents={contents || []}
                  isEditing={isEditing}
                  onEdit={handleEdit}
                  onCancel={handleCancel}
                  knowledgeGraph={knowledgeGraph || undefined}
                  onCreateKnowledgeGraph={handleCreateKnowledgeGraph}
                  isCreatingKnowledgeGraph={
                    createKnowledgeGraphMutation.isPending
                  }
                  onRetryKnowledgeGraph={handleRetryKnowledgeGraph}
                  isRetryingKnowledgeGraph={
                    retryKnowledgeGraphMutation.isPending
                  }
                />
              )}

              <Button
                onClick={handleNext}
                disabled={skldMutation.isPending}
                variant={"outline"}
                className="rounded-full"
              >
                {skldMutation.isPending ? "Processing..." : "Next"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
