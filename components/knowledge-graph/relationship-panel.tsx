"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Info, X } from "lucide-react";
import { useTheme } from "next-themes";

import { Card, CardContent } from "@/components/ui/card";
import { Link } from "./knowledge-graph.types";

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
          className="absolute bottom-4 right-4 z-30"
        >
          <Card
            className={`${isDark ? "bg-slate-900/98 backdrop-blur-xl" : "bg-white/98 backdrop-blur-xl"} border-l-4 shadow-2xl max-w-md`}
            style={{ borderLeftColor: link.color }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  Relationship Details
                </h3>
                <button
                  onClick={onClose}
                  className={`hover:${isDark ? "bg-slate-700" : "bg-slate-200"} rounded-full p-1 transition-colors`}
                >
                  <X className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
                </button>
              </div>
              <div className={`${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-slate-100/50 border-slate-200/50"} rounded-lg p-4 mb-4 border`}>
                <p className={`${isDark ? "text-slate-200" : "text-slate-700"} text-sm leading-relaxed`}>
                  {link.description}
                </p>
              </div>
              <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-r-lg p-4">
                <h4 className="text-emerald-400 font-semibold text-sm mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Real-World Example
                </h4>
                <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                  {link.realExample}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: link.color }}
                >
                  {link.strength.toUpperCase()}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
