"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CourseFormData, Course } from "@/modules/course/course.types";
import { useUpdateCourseMutation } from "@/modules/course/use-update-course-mutation";
import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CourseFormMinimal } from "../../../courses/add/components/course-form-minimal";
import { CourseFormTraditional } from "../../../courses/add/components/course-form-traditional";
import { FormSidebar } from "../../../courses/add/components/form-sidebar";
import { Layout, LayoutTemplate, Download, Upload } from "lucide-react";

const initialFormData: CourseFormData = {
  title: "",
  description: "",
  courseType: "beginner",
  hasCertification: false,
  supportedLanguages: [],
  domains: [],
  exam: {
    totalQuestions: 0,
    totalTimeMinutes: 0,
    domainWeights: {},
    allowSkipQuestions: false,
    questionTypes: [],
  },
};

export default function EditCoursePage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const updateCourseMutation = useUpdateCourseMutation(params.courseId);
  const { data: existingCourse, isLoading } = useGetCourseQuery(
    params.courseId
  );

  const [formData, setFormData] = useState<CourseFormData>(initialFormData);

  const [currentStep, setCurrentStep] = useState(1);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [importMethod, setImportMethod] = useState<"paste" | "upload">("paste");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [viewMode, setViewMode] = useState<"minimal" | "traditional">(
    "traditional"
  );

  const totalSteps = 5;

  useEffect(() => {
    if (existingCourse) {
      setFormData({
        title: existingCourse.title || "",
        description: existingCourse.description || "",
        courseType: existingCourse.courseType || "beginner",
        hasCertification: existingCourse.hasCertification || false,
        domains: existingCourse.domains || [],
        supportedLanguages: existingCourse.supportedLanguages || [],
        exam: existingCourse.exam
          ? {
              totalQuestions: existingCourse.exam.totalQuestions || 0,
              totalTimeMinutes: existingCourse.exam.totalTimeMinutes || 0,
              domainWeights: existingCourse.exam.domainWeights || {},
              allowSkipQuestions:
                existingCourse.exam.allowSkipQuestions || false,
              questionTypes: existingCourse.exam.questionTypes || [],
            }
          : {
              totalQuestions: 0,
              totalTimeMinutes: 0,
              domainWeights: {},
              allowSkipQuestions: false,
              questionTypes: [],
            },
      });
    }
  }, [existingCourse]);

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    router.push(`/studio/${params.courseId}`);
  };

  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setFormData(parsed);
      setShowJsonModal(false);
      setJsonInput("");
      setUploadedFile(null);
    } catch {
      alert("Invalid JSON format. Please check your input.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setJsonInput(content);
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/json") {
      setUploadedFile(file);
      setImportMethod("upload");
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setJsonInput(content);
      };
      reader.readAsText(file);
    }
  };

  const handleCloseModal = () => {
    setShowJsonModal(false);
    setJsonInput("");
    setUploadedFile(null);
    setImportMethod("paste");
  };

  const handleExportJson = () => {
    const json = JSON.stringify(formData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formData.title || "course"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    try {
      await updateCourseMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        courseType: formData.courseType,
        hasCertification: formData.hasCertification,
        domains: formData.domains,
        exam: formData.exam,
      });
      router.push(`/studio/${params.courseId}`);
    } catch (error) {
      console.error("Failed to update course:", error);
    }
  };

  const isFormValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.title.trim().length > 0 &&
          formData.description.trim().length > 0
        );
      case 2:
        return formData.domains.length > 0;
      case 3:
        return formData.domains.every((domain) => domain.chapters.length > 0);
      case 4:
        return (
          formData.exam.totalQuestions > 0 &&
          formData.domains.every(
            (domain) => formData.exam.domainWeights[domain.id] > 0
          ) &&
          formData.exam.questionTypes.length > 0
        );
      case 5:
        const totalWeight = Object.values(formData.exam.domainWeights).reduce(
          (a, b) => a + b,
          0
        );
        return (
          formData.title.trim().length > 0 &&
          formData.description.trim().length > 0 &&
          formData.domains.length > 0 &&
          formData.domains.every((domain) => domain.chapters.length > 0) &&
          formData.exam.totalQuestions > 0 &&
          formData.exam.totalTimeMinutes > 0 &&
          totalWeight === 100 &&
          formData.domains.every(
            (domain) => formData.exam.domainWeights[domain.id] > 0
          )
        );
      default:
        return false;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-muted-foreground">Loading course...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="">
        <div className="pt-8 pb-32">
          <div className="mb-8 flex items-center justify-between">
            <Link
              href={`/studio/${params.courseId}`}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Course
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportJson}
                className="text-muted-foreground hover:text-foreground"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowJsonModal(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setViewMode(
                    viewMode === "minimal" ? "traditional" : "minimal"
                  )
                }
                className="text-muted-foreground hover:text-foreground"
              >
                {viewMode === "minimal" ? (
                  <>
                    <LayoutTemplate className="w-4 h-4 mr-2" />
                    Traditional
                  </>
                ) : (
                  <>
                    <Layout className="w-4 h-4 mr-2" />
                    Minimal
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
            </div>
          </div>

          {viewMode === "minimal" ? (
            <CourseFormMinimal
              formData={formData}
              setFormData={setFormData}
              currentStep={currentStep}
              onNext={handleNext}
              onBack={handleBack}
              onSubmit={handleSubmit}
              isSubmitting={updateCourseMutation.isPending}
              isValid={isFormValid()}
              totalSteps={totalSteps}
              submitButtonTitle={
                updateCourseMutation.isPending ? "Updating..." : "Update Course"
              }
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <FormSidebar
                    currentStep={currentStep}
                    onStepChange={handleStepChange}
                    totalSteps={totalSteps}
                    formData={formData}
                  />
                </div>
              </div>
              <div className="lg:col-span-2">
                <CourseFormTraditional
                  formData={formData}
                  setFormData={setFormData}
                  currentStep={currentStep}
                  onNext={handleNext}
                  onBack={handleBack}
                  onSubmit={handleSubmit}
                  isSubmitting={updateCourseMutation.isPending}
                  isValid={isFormValid()}
                  totalSteps={totalSteps}
                  submitButtonTitle={
                    updateCourseMutation.isPending
                      ? "Updating..."
                      : "Update Course"
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {showJsonModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden border border-border shadow-2xl">
            <div className="p-8 border-b border-border">
              <h2 className="text-2xl font-light text-foreground">
                Import Course
              </h2>
              <p className="text-muted-foreground mt-2">
                Paste or upload your course JSON
              </p>
            </div>

            <div className="p-8">
              <div className="flex gap-2 mb-8">
                <button
                  onClick={() => setImportMethod("paste")}
                  className={`flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all ${
                    importMethod === "paste"
                      ? "bg-foreground text-background"
                      : "bg-secondary hover:bg-secondary/80 text-foreground/70"
                  }`}
                >
                  Paste
                </button>
                <button
                  onClick={() => setImportMethod("upload")}
                  className={`flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all ${
                    importMethod === "upload"
                      ? "bg-foreground text-background"
                      : "bg-secondary hover:bg-secondary/80 text-foreground/70"
                  }`}
                >
                  Upload
                </button>
              </div>

              {importMethod === "paste" ? (
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='{
  "title": "Course Title",
  "description": "Course Description",
  "domains": [...],
  "exam": {...}
}'
                  className="w-full h-64 px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:border-foreground font-mono text-sm resize-none placeholder:text-muted-foreground/50"
                />
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                    uploadedFile
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-border bg-secondary/30 hover:border-foreground/30 hover:bg-secondary/50"
                  }`}
                >
                  <input
                    type="file"
                    id="json-upload"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="json-upload"
                    className="cursor-pointer flex flex-col items-center w-full h-full justify-center"
                  >
                    {uploadedFile ? (
                      <>
                        <svg
                          className="w-12 h-12 text-green-500 mb-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-base font-medium text-foreground mb-1">
                          {uploadedFile.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          File loaded
                        </p>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-12 h-12 text-muted-foreground/50 mb-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="text-base font-medium text-foreground/70 mb-1">
                          Drop JSON file here
                        </p>
                        <p className="text-sm text-muted-foreground">
                          or click to browse
                        </p>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-border flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {importMethod === "paste"
                  ? "Paste your JSON data"
                  : uploadedFile
                    ? uploadedFile.name
                    : "Select a JSON file"}
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button onClick={handleJsonImport}>Import</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
