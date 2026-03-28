"use client";

import { ReactNode, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  className?: string;
}

export function Tooltip({ children, content, className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({
    top: 0,
    left: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    }
    setIsVisible(true);
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block", className)}
      style={{ zIndex: 9999 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className="px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg"
          style={{
            zIndex: 10000,
            position: "fixed",
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: "translate(-50%, -100%)",
            whiteSpace: "nowrap",
            minWidth: "fit-content",
            pointerEvents: "none",
          }}
        >
          {content}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
            style={{ borderTopColor: "#111827" }}
          />
        </div>
      )}
    </div>
  );
}
