"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating?: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export function StarRating({
  rating = 0,
  count,
  size = "sm",
  showCount = true,
  interactive = false,
  onRatingChange,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const containerSizeClasses = {
    sm: "gap-0.5",
    md: "gap-1",
    lg: "gap-1",
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.round(rating);
      const isPartial = i > rating && i < rating + 1;

      stars.push(
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onRatingChange?.(i)}
          className={cn(
            "transition-transform hover:scale-110",
            interactive && "cursor-pointer hover:text-yellow-400",
            !interactive && "pointer-events-none",
          )}
          aria-label={`Rate ${i} stars`}
        >
          <Star
            className={cn(
              sizeClasses[size],
              isFilled
                ? "text-yellow-400 fill-yellow-400"
                : "text-muted-foreground",
              isPartial && "text-yellow-200",
            )}
          />
        </button>,
      );
    }
    return stars;
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn("flex items-center", containerSizeClasses[size])}>
        {renderStars()}
      </div>
      {showCount && count !== undefined && (
        <span className="text-sm text-muted-foreground">({count})</span>
      )}
    </div>
  );
}
