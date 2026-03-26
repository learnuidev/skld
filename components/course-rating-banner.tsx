"use client";

import { useState, useEffect, useRef } from "react";
import { Star, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddUserCourseRatingMutation } from "@/modules/user-course-rating/use-add-user-course-rating-mutation";
import { StarRating } from "@/components/star-rating";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

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
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [daysSinceEnrollment, setDaysSinceEnrollment] = useState<number>(0);
  const [review, setReview] = useState<string>("");
  const [showReviewInput, setShowReviewInput] = useState<boolean>(false);
  const addRatingMutation = useAddUserCourseRatingMutation();
  const daysRef = useRef<number>(0);

  useEffect(() => {
    const calculateDays = () => {
      const days = Math.floor(
        (Date.now() - enrolledAt) / (1000 * 60 * 60 * 24),
      );
      daysRef.current = days;
      setDaysSinceEnrollment(days);
    };

    calculateDays();

    const interval = setInterval(calculateDays, 60000);

    return () => clearInterval(interval);
  }, [enrolledAt]);

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
    <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6 my-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Rate Your Experience
              </h3>
              <p className="text-sm text-muted-foreground">
                You&apos;ve been enrolled for {daysSinceEnrollment} days
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            How would you rate this course? Your feedback helps others make
            better learning decisions.
          </p>

          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <StarRating
                rating={rating || hoveredRating}
                size="lg"
                showCount={false}
                interactive
                onRatingChange={(newRating) => setRating(newRating)}
              />
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onMouseEnter={() => setHoveredRating(num)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(num)}
                  className={cn(
                    "w-12 h-8 rounded-lg transition-all",
                    rating === num || hoveredRating === num
                      ? "bg-yellow-500 text-white font-medium"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary/80",
                  )}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {showReviewInput ? (
            <div className="space-y-2">
              <Textarea
                placeholder="Share your experience with this course (optional)..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="min-h-[100px] resize-none"
                maxLength={500}
              />
              <div className="text-xs text-muted-foreground">
                {review.length}/500 characters
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReviewInput(true)}
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Leave a Review
            </Button>
          )}

          <Button
            onClick={handleRatingSubmit}
            disabled={rating === 0 || addRatingMutation.isPending}
            className="shrink-0"
          >
            {addRatingMutation.isPending ? "Submitting..." : "Submit Rating"}
          </Button>
        </div>

      <button
        onClick={() => {
          setRating(0);
          setReview("");
          setShowReviewInput(false);
        }}
        className="absolute top-4 right-4 p-1 rounded-full hover:bg-secondary/50 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}
