"use client";

import { Button } from "@/components/ui/button";
import { CourseFormData } from "@/modules/course/course.types";
import { useCreateCourseMutation } from "@/modules/course/use-create-course-mutation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CourseForm } from "./components/course-form";
import { FormSidebar } from "./components/form-sidebar";

const initialFormData: CourseFormData = {
  title: "",
  description: "",
  courseType: "basic",
  hasCertification: false,
  domains: [],
  exam: {
    totalQuestions: 0,
    totalTimeMinutes: 0,
    domainWeights: {},
    allowSkipQuestions: false,
  },
};

export default function AddCoursePage() {
  const router = useRouter();
  const createCourseMutation = useCreateCourseMutation();
  const [formData, setFormData] = useState<CourseFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [importMethod, setImportMethod] = useState<"paste" | "upload">("paste");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const totalSteps = 5;

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
    if (
      window.confirm(
        "Are you sure you want to cancel? All progress will be lost."
      )
    ) {
      router.push("/studio");
    }
  };

  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setFormData({
        ...initialFormData,
        ...parsed,
      });
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
      await createCourseMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        courseType: formData.courseType,
        hasCertification: formData.hasCertification,
        domains: formData.domains,
        exam: formData.exam,
      });
      router.push("/studio");
    } catch (error) {
      console.error("Failed to create course:", error);
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
          )
        );
      case 5:
        return formData.title.trim().length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/studio"
              className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors"
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
              Back to Studio
            </Link>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Create Your Course
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Build your course step by step. Progress is tracked in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleExportJson}>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export
            </Button>
            <Button variant="outline" onClick={() => setShowJsonModal(true)}>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Import JSON
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <FormSidebar
                currentStep={currentStep}
                onStepChange={handleStepChange}
                totalSteps={totalSteps}
              />
            </div>
          </div>
          <div className="lg:col-span-2">
            <CourseForm
              formData={formData}
              setFormData={setFormData}
              currentStep={currentStep}
              onNext={handleNext}
              onBack={handleBack}
              onSubmit={handleSubmit}
              isSubmitting={createCourseMutation.isPending}
              isValid={isFormValid()}
              totalSteps={totalSteps}
            />
          </div>
        </div>
      </div>

      {showJsonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[rgb(10,11,12)] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Import Course JSON
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Choose your import method
              </p>
            </div>

            <div className="p-6">
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setImportMethod("paste")}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                    importMethod === "paste"
                      ? "bg-[rgb(10,11,12)] dark:bg-white text-white dark:text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <svg
                    className="w-4 h-4 mr-2 inline"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Paste JSON
                </button>
                <button
                  onClick={() => setImportMethod("upload")}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                    importMethod === "upload"
                      ? "bg-[rgb(10,11,12)] dark:bg-white text-white dark:text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <svg
                    className="w-4 h-4 mr-2 inline"
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
                  Upload File
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
                  className="w-full h-64 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white font-mono text-sm resize-none"
                />
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${
                    uploadedFile
                      ? "border-green-400 bg-green-50 dark:bg-green-950/20"
                      : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500"
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
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {uploadedFile ? (
                      <>
                        <svg
                          className="w-12 h-12 text-green-600 dark:text-green-400 mb-3"
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
                        <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          File loaded successfully
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                          Click or drag to replace
                        </p>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-12 h-12 text-slate-400 mb-3"
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
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Drop your JSON file here
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          or click to browse
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
                          Supports .json files
                        </p>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {importMethod === "paste"
                  ? "Paste your course JSON data above"
                  : uploadedFile
                    ? `${uploadedFile.name} ready to import`
                    : "Upload a JSON file containing your course data"}
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleCloseModal}>
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
