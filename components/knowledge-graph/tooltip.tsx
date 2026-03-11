"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useTheme } from "next-themes";

import { Card, CardContent } from "@/components/ui/card";
import { PANEL_DARK_BACKGROUND } from "./knowledge-graph.constants";

export interface TooltipData {
  title: string;
  description: string;
  hint?: string;
}

export const Tooltip = ({
  data,
  position,
  visible,
  onClose,
}: {
  data: TooltipData | null;
  position: { x: number; y: number };
  visible: boolean;
  onClose: () => void;
}) => {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === "dark" || resolvedTheme === "dark";

  return (
    <AnimatePresence>
      {visible && data && (
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
              <X className="w-3.5 h-3.5" />
            </button>
            <CardContent className="p-4 pr-8">
              <h4 className={`font-semibold text-base mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                {data.title}
              </h4>
              <p className={`text-sm leading-relaxed mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {data.description}
              </p>
              {data.hint && (
                <p className={`text-xs ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                  {data.hint}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
