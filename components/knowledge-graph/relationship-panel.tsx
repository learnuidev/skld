"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Info, X } from "lucide-react";
import { useTheme } from "next-themes";

import { Card, CardContent } from "@/components/ui/card";
import { Link } from "./knowledge-graph.types";
import { PANEL_DARK_BACKGROUND } from "./knowledge-graph.constants";

export const RelationshipPanel = ({
  link,
  onClose,
}: {
  link: Link | null;
  onClose: () => void;
}) => {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === "dark" || resolvedTheme === "dark";

  return (
    <AnimatePresence>
      {link && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="absolute bottom-4 left-4 z-30"
        >
          <Card
            className={`${isDark ? `${PANEL_DARK_BACKGROUND} backdrop-blur-xl border-slate-800/50` : "bg-white/98 backdrop-blur-xl border-slate-200/50"} shadow-xl max-w-md`}
            style={{ borderLeftColor: link.color }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3
                  className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                >
                  Relationship Details
                </h3>
                <button
                  onClick={onClose}
                  className={`hover:${isDark ? "bg-slate-700/50" : "bg-slate-200/50"} rounded-lg p-2 transition-colors`}
                >
                  <X
                    className={`w-4 h-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                  />
                </button>
              </div>
              <div className="space-y-4">
                <div
                  className={`${isDark ? "bg-slate-800/30" : "bg-slate-100/30 "} rounded-lg p-2`}
                >
                  <p
                    className={`${isDark ? "text-slate-200" : "text-slate-700"} leading-relaxed text-xs`}
                  >
                    {link.description}
                  </p>
                </div>
                <div
                  className={`${isDark ? "bg-slate-800/30 " : "bg-slate-100/30 "} rounded-lg p-2`}
                >
                  <h4 className="text-emerald-400 font-medium mb-3 text-sm flex items-center gap-3">
                    <Info className="w-4 h-4" />
                    Real-World Example
                  </h4>
                  <p
                    className={`${isDark ? "text-slate-300" : "text-slate-600"} text-xs`}
                  >
                    {link.realExample}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex text-xs items-center px-3 py-1 rounded-full font-medium text-white"
                    style={{ backgroundColor: link.color }}
                  >
                    {link.strength.toUpperCase()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
