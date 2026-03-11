"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";

import { Card, CardContent } from "@/components/ui/card";
import { PANEL_DARK_BACKGROUND } from "./knowledge-graph.constants";

export const Tooltip = ({
  content,
  position,
  visible,
  onClose,
}: {
  content: string;
  position: { x: number; y: number };
  visible: boolean;
  onClose: () => void;
}) => {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === "dark" || resolvedTheme === "dark";

  return (
    <AnimatePresence>
      {visible && content && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed z-50 pointer-events-none"
          style={{ left: position.x + 20, top: position.y - 20 }}
        >
          <Card
            className={`${isDark ? `${PANEL_DARK_BACKGROUND} border-slate-700/50` : "bg-white/95 border-slate-200/50"} backdrop-blur-xl shadow-2xl max-w-sm relative`}
          >
            <button
              onClick={onClose}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-700/50 transition-colors pointer-events-auto"
              style={{ color: isDark ? "#94a3b8" : "#475569" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <CardContent className="p-3 pr-8">
              <p
                className={`text-sm leading-relaxed ${isDark ? "text-slate-200" : "text-slate-700"}`}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
