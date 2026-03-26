"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAddUserCourseRatingMutation } from "@/modules/user-course-rating/use-add-user-course-rating-mutation";
import { MessageSquare, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CourseRatingBannerProps {
  courseId: string;
  enrolledAt: number;
  onRated?: () => void;
}

export function CourseRatingBanner({
  courseId,
  enrolledAt,
  onRated,
}: CourseRatingBannerProps) {
  const [rating, setRating] = useState<number>(0);
  const [daysSinceEnrollment, setDaysSinceEnrollment] = useState<number>(0);
  const [review, setReview] = useState<string>("");
  const [showReviewInput, setShowReviewInput] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const addRatingMutation = useAddUserCourseRatingMutation();
  const daysRef = useRef<number>(0);

  useEffect(() => {
    const calculateDays = () => {
      const days = Math.floor(
        (Date.now() - enrolledAt) / (1000 * 60 * 60 * 24)
      );
      daysRef.current = days;
      setDaysSinceEnrollment(days);
    };

    calculateDays();

    const interval = setInterval(calculateDays, 60000);

    return () => clearInterval(interval);
  }, [enrolledAt]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const isEligible = daysSinceEnrollment >= 10;

  if (!isEligible) return null;

  const handleRatingSubmit = async () => {
    if (rating === 0) return;

    try {
      await addRatingMutation.mutateAsync({
        courseId,
        rating,
        review: review.trim() || undefined,
      });
      setReview("");
      setShowReviewInput(false);
      onRated?.();
    } catch (error) {
      console.error("Failed to submit rating:", error);
    }
  };

  return (
    <div
      className={cn(
        "relative border border-border rounded-2xl p-12 my-8 transition-all duration-500 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      <button
        onClick={() => {
          setRating(0);
          setReview("");
          setShowReviewInput(false);
          setIsVisible(false);
        }}
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-all duration-300 hover:scale-110"
        aria-label="Dismiss"
      >
        <X className="w-5 h-5 text-muted-foreground" />
      </button>

      <div className="max-w-2xl">
        <div className="mb-8">
          <h3 className="text-2xl font-medium text-foreground mb-2 tracking-tight">
            Rate Your Experience
          </h3>
          <p className="text-muted-foreground">
            You&apos;ve been enrolled for {daysSinceEnrollment} days
          </p>
        </div>

        <p className="text-muted-foreground mb-10 leading-relaxed">
          How would you rate this course? Your feedback helps others make better
          learning decisions.
        </p>

        <div className="flex items-center gap-8 mb-10">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setRating(num)}
                className={cn(
                  "w-14 h-10 rounded-lg transition-all duration-300",
                  "hover:scale-105 active:scale-95",
                  rating === num
                    ? "bg-foreground text-background font-medium"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {rating > 0 && (
          <div
            className={cn(
              "space-y-6 transition-all duration-500 ease-out",
              showReviewInput
                ? "opacity-100 max-h-[500px]"
                : "opacity-80 max-h-12"
            )}
          >
            {!showReviewInput ? (
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setShowReviewInput(true)}
                className="text-muted-foreground hover:text-foreground gap-3 px-0 transition-all duration-300 hover:pl-2"
              >
                <MessageSquare className="w-5 h-5" />
                Leave a Review
              </Button>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <Textarea
                  placeholder="Share your experience with this course (optional)..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="min-h-[120px] resize-none transition-all duration-300 focus:scale-[1.01]"
                  maxLength={500}
                />
                <div className="text-sm text-muted-foreground flex justify-between items-center">
                  <span>{review.length}/500 characters</span>
                  <Button
                    onClick={handleRatingSubmit}
                    disabled={rating === 0 || addRatingMutation.isPending}
                    className="transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    {addRatingMutation.isPending
                      ? "Submitting..."
                      : "Submit Rating"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
