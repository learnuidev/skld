"use client";

import { CourseBackLink } from "@/components/course/course-back-link";
import { CourseContainer } from "@/components/course/course-container";
import { CourseGeneralInfo } from "@/components/course/course-general-info";
import { CourseHeader } from "@/components/course/course-header";
import { LoadingCourse } from "@/components/course/loading-course";
import { LoadingCourseFailed } from "@/components/course/loading-course-failed";
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
import { cn } from "@/lib/utils";
import { useDeleteCourseMutation } from "@/modules/course/use-delete-course-mutation";
import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import { AlertTriangle, Pencil } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ContentTab } from "./components/content-tab";
import { ExamBankTab } from "./components/exam-bank-tab";

const tabs = ["General Info", "Content", "Exam Bank"] as const;

function DeleteDialog({
  open,
  onOpenChange,
  courseTitle,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle: string;
  onConfirm: () => void;
  isPending: boolean;
}) {
  const [courseNameConfirm, setCourseNameConfirm] = useState("");

  const handleConfirm = () => {
    if (courseNameConfirm === courseTitle) {
      onConfirm();
      setCourseNameConfirm("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle className="text-xl">Delete Course</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-4">
            This action cannot be undone. This will permanently delete course
            &quot;{courseTitle}&quot; and all associated exam banks.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4">
            <p className="text-sm font-medium text-destructive mb-2">
              Warning: All exam banks in this course will also be deleted
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Type <span className="font-bold">&quot;{courseTitle}&quot;</span>{" "}
              to confirm
            </label>
            <Input
              placeholder="Enter course name"
              value={courseNameConfirm}
              onChange={(e) => setCourseNameConfirm(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter className="gap-3 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setCourseNameConfirm("");
            }}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={courseNameConfirm !== courseTitle || isPending}
          >
            {isPending ? "Deleting..." : "Delete Course"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("General Info");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: course, isLoading, error } = useGetCourseQuery(params.courseId);
  const deleteCourseMutation = useDeleteCourseMutation();

  const handleDeleteCourse = async () => {
    await deleteCourseMutation.mutateAsync(params.courseId);
    setIsDeleteDialogOpen(false);
    router.push("/studio");
  };

  if (isLoading) {
    return <LoadingCourse />;
  }

  if (error || !course) {
    return <LoadingCourseFailed />;
  }

  return (
    <CourseContainer>
      <CourseBackLink href="/studio" title={"Back to Studio"} />

      <CourseHeader course={course}>
        <div className="flex gap-2">
          <Link href={`/studio/${course.id}/edit`}>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-2 rounded-full border-border text-foreground hover:bg-accent"
            >
              <Pencil className="size-3.5" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="shrink-0 rounded-full border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Delete
          </Button>
        </div>
      </CourseHeader>

      {/* Tabs */}
      <nav className="mt-10 flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "relative px-4 py-3 text-sm font-medium transition-colors",
              activeTab === tab
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute inset-x-0 -bottom-px h-px bg-foreground" />
            )}
          </button>
        ))}
      </nav>

      {/* Content */}
      {activeTab === "General Info" && <CourseGeneralInfo course={course} />}

      {activeTab === "Content" && (
        <div className="mt-12">
          <ContentTab
            courseId={course.id}
            chapters={
              course.domains?.flatMap((d) =>
                d.chapters.map((c) => ({ ...c }))
              ) || []
            }
          />
        </div>
      )}

      {activeTab === "Exam Bank" && (
        <div className="mt-12">
          <ExamBankTab courseId={course.id} />
        </div>
      )}

      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        courseTitle={course.title}
        onConfirm={handleDeleteCourse}
        isPending={deleteCourseMutation.isPending}
      />
    </CourseContainer>
  );
}
