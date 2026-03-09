"use client";

import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import { useGetCourseContentQuery } from "@/modules/course-content/use-get-course-content-query";
import { useUpdateCourseContentMutation } from "@/modules/course-content/use-update-course-content-mutation";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen, Edit2, Save, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchAuthSession } from "@aws-amplify/auth";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { useGetProfileQuery } from "@/modules/user/use-get-profile-query";

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

  const [isEditing, setIsEditing] = useState(false);
  const [editorContent, setEditorContent] = useState("");

  const { data: user } = useGetProfileQuery();

  const currentUserId = user?.id;

  const isLoading = courseLoading || contentLoading;

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

  const isAuthor = currentUserId === content?.userId;

  const handleEdit = () => {
    setEditorContent(content?.content || "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditorContent(content?.content || "");
  };

  useEffect(() => {
    if (content?.content) {
      setEditorContent(content?.content);
    }
  }, [content?.content]);

  const handleSave = async () => {
    try {
      await updateContentMutation.mutateAsync({
        content: editorContent,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update content:", error);
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
      <div className="max-w-4xl mx-auto px-6 py-16 lg:py-24">
        <div className="mb-16">
          <Link
            href={`/courses/${params.courseId}`}
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Link>
        </div>

        <div className="space-y-16">
          <header className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-foreground/60" />
                </div>
                <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
                  Course Content
                </p>
              </div>
              {isEditing && (
                <button
                  onClick={handleCancel}
                  disabled={updateContentMutation.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              )}
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight text-foreground text-balance leading-[1.15]">
                  {content.title}
                </h1>

                {content.description && (
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mt-4">
                    {content.description}
                  </p>
                )}
              </div>
              {isAuthor && !isEditing && (
                <button
                  onClick={handleEdit}
                  className="shrink-0 w-12 h-12 rounded-xl border border-border hover:border-foreground/20 hover:bg-accent flex items-center justify-center transition-all"
                  title="Edit content"
                >
                  <Edit2 className="w-5 h-5 text-muted-foreground" />
                </button>
              )}
            </div>
          </header>

          <div className="space-y-12">
            <div className="h-px bg-border/60" />
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
